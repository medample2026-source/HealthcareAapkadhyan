const express = require("express");

const {
  searchPatientByUniqueId,
  uploadMyReport,
  uploadReportForPatientByDoctor,
  uploadReportForPatientByHospital,
  getMyReports,
  getPatientReportsForDoctor,
  getPatientReportsForHospital,
  getAllReportsForSuperAdmin,
  getPatientReportsForSuperAdmin,
  deleteMyReport,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get(
  "/doctor/search-patient/:patientId",
  protect,
  authorizeRoles("doctor"),
  searchPatientByUniqueId,
);

router.get(
  "/doctor/patient/:patientId",
  protect,
  authorizeRoles("doctor"),
  getPatientReportsForDoctor,
);

router.post(
  "/doctor/upload/:patientId",
  protect,
  authorizeRoles("doctor"),
  upload.single("report"),
  uploadReportForPatientByDoctor,
);

router.get(
  "/hospital/search-patient/:patientId",
  protect,
  authorizeRoles("hospitalAdmin"),
  searchPatientByUniqueId,
);

router.get(
  "/hospital/patient/:patientId",
  protect,
  authorizeRoles("hospitalAdmin"),
  getPatientReportsForHospital,
);

router.post(
  "/hospital/upload/:patientId",
  protect,
  authorizeRoles("hospitalAdmin"),
  upload.single("report"),
  uploadReportForPatientByHospital,
);

router.get(
  "/super-admin/all",
  protect,
  authorizeRoles("superAdmin"),
  getAllReportsForSuperAdmin,
);

router.get(
  "/super-admin/patient/:patientId",
  protect,
  authorizeRoles("superAdmin"),
  getPatientReportsForSuperAdmin,
);

router.post(
  "/patient/upload",
  protect,
  authorizeRoles("patient"),
  upload.single("report"),
  uploadMyReport,
);

router.get("/my-reports", protect, authorizeRoles("patient"), getMyReports);

router.delete(
  "/my-reports/:reportId",
  protect,
  authorizeRoles("patient"),
  deleteMyReport,
);

module.exports = router;
