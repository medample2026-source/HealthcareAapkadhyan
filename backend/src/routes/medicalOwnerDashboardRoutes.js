const express = require("express");

const {
  getMedicalOwnerDashboardStats,
} = require("../controllers/medicalOwnerDashboardController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/stats",
  protect,
  authorizeRoles("medicalOwner"),
  getMedicalOwnerDashboardStats,
);

module.exports = router;
