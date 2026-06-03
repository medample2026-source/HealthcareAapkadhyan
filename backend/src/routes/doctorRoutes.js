const express = require("express");

const {
  createDoctorProfile,
  getMyDoctorProfile,
  updateDoctorProfile,
  getAllDoctors,
  getSingleDoctor,
} = require("../controllers/doctorController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const profileImageUpload = require("../middleware/profileImageUploadMiddleware");

const router = express.Router();

router.get("/", getAllDoctors);

router.post(
  "/profile",
  protect,
  authorizeRoles("doctor"),
  profileImageUpload.single("profileImageFile"),
  createDoctorProfile,
);

router.get(
  "/profile/me",
  protect,
  authorizeRoles("doctor"),
  getMyDoctorProfile,
);

router.patch(
  "/profile",
  protect,
  authorizeRoles("doctor"),
  profileImageUpload.single("profileImageFile"),
  updateDoctorProfile,
);

router.get("/:id", getSingleDoctor);

module.exports = router;
