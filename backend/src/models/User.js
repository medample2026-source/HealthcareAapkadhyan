const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "patient",
        "doctor",
        "hospitalAdmin",
        "medicalOwner",
        "superAdmin",
      ],
      default: "patient",
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "phone"],
      default: "local",
    },

    googleId: {
      type: String,
      sparse: true,
    },

    avatar: {
      type: String,
    },

    profileImage: {
      type: String,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "patient" || this.role === "superAdmin";
      },
    },

    refreshToken: {
      type: String,
      select: false,
    },

    emailVerificationToken: String,
    emailVerificationExpire: Date,

    passwordResetToken: String,
    passwordResetExpire: Date,

    phoneOtp: String,
    phoneOtpExpire: Date,

    isBlocked: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });

module.exports = mongoose.model("User", userSchema);
