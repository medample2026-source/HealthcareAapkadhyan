const express = require("express");
const {
  register,
  verifyEmail,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  logout,
  refreshToken,
  me,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.use(authLimiter);

router.post("/register", register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

router.get("/me", protect, me);

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
