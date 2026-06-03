const express = require("express");

const {
  getPendingUsers,
  approveUser,
  rejectUser,
  getApprovedUsers,
  getAllUsers,
  updateUserVerification,
  blockUser,
  unblockUser,
  deleteUser,
  getAnalytics,
  getRecentActivity,
} = require("../controllers/superAdminController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/pending-users",
  protect,
  authorizeRoles("superAdmin"),
  getPendingUsers,
);

router.patch(
  "/approve/:userId",
  protect,
  authorizeRoles("superAdmin"),
  approveUser,
);

router.delete(
  "/reject/:userId",
  protect,
  authorizeRoles("superAdmin"),
  rejectUser,
);

router.get(
  "/approved-users",
  protect,
  authorizeRoles("superAdmin"),
  getApprovedUsers,
);

router.get("/users", protect, authorizeRoles("superAdmin"), getAllUsers);

router.patch(
  "/verify/:userId",
  protect,
  authorizeRoles("superAdmin"),
  updateUserVerification,
);

router.patch(
  "/block/:userId",
  protect,
  authorizeRoles("superAdmin"),
  blockUser,
);

router.patch(
  "/unblock/:userId",
  protect,
  authorizeRoles("superAdmin"),
  unblockUser,
);

router.delete(
  "/delete/:userId",
  protect,
  authorizeRoles("superAdmin"),
  deleteUser,
);

router.get("/analytics", protect, authorizeRoles("superAdmin"), getAnalytics);

router.get(
  "/recent-activity",
  protect,
  authorizeRoles("superAdmin"),
  getRecentActivity,
);

module.exports = router;
