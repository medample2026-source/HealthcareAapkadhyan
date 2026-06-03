const express = require("express");
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  logout,
  refreshToken,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      isApproved: req.user.isApproved,
    },
  });
});

router.get(
  "/patient-dashboard",
  protect,
  authorizeRoles("patient"),
  (req, res) => res.json({ message: "Patient dashboard access" }),
);

router.get("/doctor-dashboard", protect, authorizeRoles("doctor"), (req, res) =>
  res.json({ message: "Doctor dashboard access" }),
);

router.get(
  "/hospital-admin-dashboard",
  protect,
  authorizeRoles("hospitalAdmin"),
  (req, res) => res.json({ message: "Hospital admin dashboard access" }),
);

router.get(
  "/super-admin-dashboard",
  protect,
  authorizeRoles("superAdmin"),
  (req, res) => res.json({ message: "Super admin dashboard access" }),
);

module.exports = router;
