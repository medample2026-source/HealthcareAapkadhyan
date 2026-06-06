const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const hashToken = require("../utils/hashToken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");
const {
  sendRefreshCookie,
  clearRefreshCookie,
} = require("../utils/sendCookie");
const { addEmailJob } = require("../jobs/emailQueue");
const {
  verificationEmail,
  welcomeEmail,
  resetPasswordEmail,
} = require("../utils/emailTemplates");

const approvalRequiredRoles = ["doctor", "hospitalAdmin", "medicalOwner"];
const allowedRegistrationRoles = ["patient", ...approvalRequiredRoles];
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getClientUrl = () => {
  const [clientUrl] = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  return clientUrl || "http://localhost:5173";
};

const buildUserPayload = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  profileImage: user.profileImage,
  isEmailVerified: user.isEmailVerified,
  isPhoneVerified: user.isPhoneVerified,
  isApproved: user.isApproved,
});

const sendTokenResponse = async (user, res, message) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save();

  sendRefreshCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message,
    accessToken,
    user: buildUserPayload(user),
  });
};

const createVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");

  return {
    token,
    hashedToken: hashToken(token),
    expire: Date.now() + 10 * 60 * 1000,
  };
};

const queueVerificationEmail = async (user, rawToken) => {
  if (!user.email) return;

  const verifyUrl = `${getClientUrl()}/verify-email/${rawToken}`;
  const email = verificationEmail({
    fullName: user.fullName,
    verifyUrl,
  });

  await addEmailJob({
    to: user.email,
    ...email,
  });
};

exports.register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role } = req.body;

  if (!fullName || !password || (!email && !phone)) {
    return res.status(400).json({
      message: "Name, password, and either email or phone are required",
    });
  }

  if (role && !allowedRegistrationRoles.includes(role)) {
    return res.status(403).json({
      message: "Invalid registration role",
    });
  }

  const existingUser = await User.findOne({
    $or: [{ email: email || undefined }, { phone: phone || undefined }].filter(
      (condition) => Object.values(condition)[0],
    ),
  });

  if (existingUser) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  const selectedRole = role || "patient";
  const verificationToken = createVerificationToken();

  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: selectedRole,
    authProvider: "local",
    emailVerificationToken: email ? verificationToken.hashedToken : undefined,
    emailVerificationExpire: email ? verificationToken.expire : undefined,
    isEmailVerified: !email,
    isApproved:
      selectedRole === "patient" || selectedRole === "superAdmin"
        ? true
        : undefined,
  });

  await queueVerificationEmail(user, verificationToken.token);

  res.status(201).json({
    success: true,
    message: approvalRequiredRoles.includes(selectedRole)
      ? "Registration successful. Please verify email and wait for admin approval."
      : "Registration successful. Please verify your email.",
  });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    $or: [
      { emailVerificationToken: hashedToken },
      { emailVerificationToken: token },
    ],
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid or expired verification token",
    });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;

  await user.save();

  if (user.email) {
    await addEmailJob({
      to: user.email,
      ...welcomeEmail({ fullName: user.fullName }),
    });
  }

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { emailOrPhone, email, password } = req.body;
  const loginId = emailOrPhone || email;

  const user = await User.findOne({
    $or: [{ email: loginId }, { phone: loginId }],
  }).select("+password");

  if (!user || !user.password) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  if (user.isBlocked) {
    return res.status(403).json({
      message: "Your account has been blocked",
    });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  if (!user.isEmailVerified && user.email) {
    return res.status(403).json({
      message: "Please verify your email first",
    });
  }

  if (!user.isApproved) {
    return res.status(403).json({
      message: "Your account is waiting for admin approval",
    });
  }

  await sendTokenResponse(user, res, "Login successful");
});

exports.googleAuth = asyncHandler(async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) {
    return res.status(400).json({
      message: "Google credential is required",
    });
  }

  const selectedRole =
    role && allowedRegistrationRoles.includes(role) ? role : "patient";

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) {
    return res.status(400).json({
      message: "Google account email not found",
    });
  }

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: payload.email }],
  }).select("+password");

  if (!user) {
    user = await User.create({
      fullName: payload.name || payload.email.split("@")[0],
      email: payload.email,
      role: selectedRole,
      authProvider: "google",
      googleId: payload.sub,
      avatar: payload.picture,
      isEmailVerified: true,
      isApproved:
        selectedRole === "patient" || selectedRole === "superAdmin"
          ? true
          : undefined,
    });
  } else {
    user.googleId = user.googleId || payload.sub;
    user.authProvider = user.authProvider === "local" ? "local" : "google";
    user.avatar = user.avatar || payload.picture;
    user.isEmailVerified = true;
    await user.save();
  }

  if (user.isBlocked) {
    return res.status(403).json({
      message: "Your account has been blocked",
    });
  }

  if (!user.isApproved) {
    return res.status(403).json({
      message: "Your account is waiting for admin approval",
    });
  }

  await sendTokenResponse(user, res, "Google authentication successful");
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      message: "If email exists, reset link has been sent",
    });
  }

  const resetToken = createVerificationToken();

  user.passwordResetToken = resetToken.hashedToken;
  user.passwordResetExpire = resetToken.expire;

  await user.save();

  const resetUrl = `${getClientUrl()}/reset-password/${resetToken.token}`;
  const emailPayload = resetPasswordEmail({
    fullName: user.fullName,
    resetUrl,
  });

  await addEmailJob({
    to: email,
    ...emailPayload,
  });

  res.status(200).json({
    success: true,
    message: "Reset link sent to email",
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    $or: [{ passwordResetToken: hashedToken }, { passwordResetToken: token }],
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid or expired reset token",
    });
  }

  user.password = password;
  user.authProvider = user.authProvider || "local";
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  user.refreshToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== token || user.isBlocked || !user.isApproved) {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }

  const accessToken = generateAccessToken(user);

  res.status(200).json({
    success: true,
    accessToken,
    user: buildUserPayload(user),
  });
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: "" } });
    } catch (error) {
      // Clearing the browser cookie is enough if the token is already invalid.
    }
  }

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

exports.me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: buildUserPayload(req.user),
  });
});
