const User = require("../models/User");

const approvableRoles = ["doctor", "hospitalAdmin", "medicalOwner"];

exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      role: { $in: approvableRoles },
      isApproved: false,
    })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!approvableRoles.includes(user.role)) {
      return res.status(400).json({
        success: false,
        message:
          "Only doctor, hospital admin, or medical owner can be approved",
      });
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.role} approved successfully`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!approvableRoles.includes(user.role)) {
      return res.status(400).json({
        success: false,
        message:
          "Only doctor, hospital admin, or medical owner can be rejected",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: `${user.role} rejected and removed successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getApprovedUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: approvableRoles },
      isApproved: true,
    })
      .select("-password -refreshToken")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;

    const query = {
      role: { $ne: "superAdmin" },
    };

    if (role && role !== "all") {
      query.role = role;
    }

    if (status === "approved") {
      query.isApproved = true;
    }

    if (status === "pending") {
      query.isApproved = false;
    }

    if (status === "blocked") {
      query.isBlocked = true;
    }

    if (status === "unverified-email") {
      query.email = { $exists: true, $ne: "" };
      query.isEmailVerified = false;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    const [totalUsers, totalPatients, totalDoctors, totalHospitals, totalMedicalOwners, pendingApprovals, blockedUsers] =
      await Promise.all([
        User.countDocuments({ role: { $ne: "superAdmin" } }),
        User.countDocuments({ role: "patient" }),
        User.countDocuments({ role: "doctor" }),
        User.countDocuments({ role: "hospitalAdmin" }),
        User.countDocuments({ role: "medicalOwner" }),
        User.countDocuments({
          role: { $in: approvableRoles },
          isApproved: false,
        }),
        User.countDocuments({
          role: { $ne: "superAdmin" },
          isBlocked: true,
        }),
      ]);

    res.status(200).json({
      success: true,
      count: users.length,
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalHospitals,
        totalMedicalOwners,
        pendingApprovals,
        blockedUsers,
      },
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateUserVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isEmailVerified, isPhoneVerified } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Super admin verification cannot be changed here",
      });
    }

    if (isEmailVerified !== undefined) {
      user.isEmailVerified = Boolean(isEmailVerified);
    }

    if (isPhoneVerified !== undefined) {
      user.isPhoneVerified = Boolean(isPhoneVerified);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User verification updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Super admin cannot be blocked",
      });
    }

    user.isBlocked = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Super admin cannot be deleted",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: "patient" });

    const totalDoctors = await User.countDocuments({
      role: "doctor",
      isApproved: true,
    });

    const totalHospitals = await User.countDocuments({
      role: "hospitalAdmin",
      isApproved: true,
    });

    const totalMedicalOwners = await User.countDocuments({
      role: "medicalOwner",
      isApproved: true,
    });

    const pendingApprovals = await User.countDocuments({
      role: { $in: approvableRoles },
      isApproved: false,
    });

    const blockedUsers = await User.countDocuments({
      isBlocked: true,
    });

    const approvedUsers = await User.countDocuments({
      role: { $in: approvableRoles },
      isApproved: true,
    });

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalHospitals,
        totalMedicalOwners,
        pendingApprovals,
        blockedUsers,
        approvedUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const latestUsers = await User.find({
      role: { $in: ["doctor", "hospitalAdmin", "medicalOwner", "patient"] },
    })
      .select("fullName email role isApproved isBlocked createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(8);

    const activities = latestUsers.map((user) => {
      let type = "registered";
      let message = `${user.fullName} registered as ${user.role}`;

      if (user.isBlocked) {
        type = "blocked";
        message = `${user.fullName} is currently blocked`;
      } else if (approvableRoles.includes(user.role) && user.isApproved) {
        type = "approved";
        message = `${user.fullName} approved as ${user.role}`;
      } else if (approvableRoles.includes(user.role) && !user.isApproved) {
        type = "pending";
        message = `${user.fullName} is waiting for approval`;
      }

      return {
        id: user._id,
        type,
        message,
        role: user.role,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
