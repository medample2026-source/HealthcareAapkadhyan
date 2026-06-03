const express = require("express");

const {
  createMedicalScan,
  getMyMedicalScans,
  getMyMedicalScanStats,
  deleteMedicalScan,
  getPatientByQRCode,
} = require("../controllers/medicalScanController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("medicalOwner"), createMedicalScan);

router.get("/my", protect, authorizeRoles("medicalOwner"), getMyMedicalScans);

router.get(
  "/my/stats",
  protect,
  authorizeRoles("medicalOwner"),
  getMyMedicalScanStats,
);

router.get(
  "/patient/:patientUniqueId",
  protect,
  authorizeRoles("medicalOwner"),
  getPatientByQRCode,
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("medicalOwner"),
  deleteMedicalScan,
);

module.exports = router;
