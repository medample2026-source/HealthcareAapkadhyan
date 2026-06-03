const express = require("express");

const {
  createHospitalProfile,
  getMyHospitalProfile,
  updateHospitalProfile,
  getAllHospitals,
  getSingleHospital,
} = require("../controllers/hospitalController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const profileImageUpload = require("../middleware/profileImageUploadMiddleware");

const router = express.Router();

router.get("/", getAllHospitals);

router.post(
  "/profile",
  protect,
  authorizeRoles("hospitalAdmin"),
  profileImageUpload.single("profileImageFile"),
  createHospitalProfile,
);

router.get(
  "/profile/me",
  protect,
  authorizeRoles("hospitalAdmin"),
  getMyHospitalProfile,
);

router.patch(
  "/profile",
  protect,
  authorizeRoles("hospitalAdmin"),
  profileImageUpload.single("profileImageFile"),
  updateHospitalProfile,
);

router.get("/:id", getSingleHospital);

module.exports = router;
