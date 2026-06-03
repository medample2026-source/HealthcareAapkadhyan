const express = require("express");

const {
  createPublicSosRequest,
  createPatientSosRequest,
  getMySosRequests,
  getAllSosRequests,
  updateSosStatus,
} = require("../controllers/sosController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Public user SOS without login
router.post("/public", createPublicSosRequest);

// Logged-in patient SOS
router.post(
  "/patient",
  protect,
  authorizeRoles("patient"),
  createPatientSosRequest,
);

// Patient own SOS history
router.get("/my", protect, authorizeRoles("patient"), getMySosRequests);

// Super admin and hospital admin can monitor SOS requests
router.get(
  "/all",
  protect,
  authorizeRoles("superAdmin", "hospitalAdmin"),
  getAllSosRequests,
);

// Super admin and hospital admin can update SOS status
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("superAdmin", "hospitalAdmin"),
  updateSosStatus,
);

module.exports = router;
