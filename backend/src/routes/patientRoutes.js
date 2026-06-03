const express = require("express");

const {
  createPatientProfile,
  getMyPatientProfile,
  updatePatientProfile,
  getEmergencyProfile,
  getQrPatientProfile,
} = require("../controllers/patientController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const profileImageUpload = require("../middleware/profileImageUploadMiddleware");

const router = express.Router();

router.post(
  "/profile",
  protect,
  authorizeRoles("patient"),
  profileImageUpload.single("profileImageFile"),
  createPatientProfile,
);

router.get(
  "/profile/me",
  protect,
  authorizeRoles("patient"),
  getMyPatientProfile,
);

router.patch(
  "/profile",
  protect,
  authorizeRoles("patient"),
  profileImageUpload.single("profileImageFile"),
  updatePatientProfile,
);

router.get("/emergency/:patientId", getEmergencyProfile);
router.get("/qr/:patientId", getQrPatientProfile);

module.exports = router;
