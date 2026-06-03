const express = require("express");

const {
  createMedicineRequest,
  getMyStoreMedicineRequests,
  updateMedicineRequestStatus,
  getMyStoreRequestSummary,
  getMyPatientMedicineRequests,
} = require("../controllers/medicineRequestController");

const { protect, optionalProtect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", optionalProtect, createMedicineRequest);

router.get(
  "/my-store",
  protect,
  authorizeRoles("medicalOwner"),
  getMyStoreMedicineRequests,
);

router.get(
  "/my-store/summary",
  protect,
  authorizeRoles("medicalOwner"),
  getMyStoreRequestSummary,
);

router.get(
  "/my-requests",
  protect,
  authorizeRoles("patient"),
  getMyPatientMedicineRequests,
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("medicalOwner"),
  updateMedicineRequestStatus,
);

module.exports = router;
