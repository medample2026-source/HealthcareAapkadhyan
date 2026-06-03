const express = require("express");
const {
  getSuperAdminAnalytics,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/super-admin",
  protect,
  authorizeRoles("superAdmin"),
  getSuperAdminAnalytics,
);

module.exports = router;
