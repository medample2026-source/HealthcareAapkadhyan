const express = require("express");

const {
  createMedicalStoreProfile,
  getMyMedicalStoreProfile,
  updateMedicalStoreProfile,
  getAllMedicalStores,
  getSingleMedicalStore,
} = require("../controllers/medicalStoreController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const profileImageUpload = require("../middleware/profileImageUploadMiddleware");

const router = express.Router();

router.get("/", getAllMedicalStores);

router.post(
  "/profile",
  protect,
  authorizeRoles("medicalOwner"),
  profileImageUpload.single("profileImageFile"),
  createMedicalStoreProfile,
);

router.get(
  "/profile/me",
  protect,
  authorizeRoles("medicalOwner"),
  getMyMedicalStoreProfile,
);

router.patch(
  "/profile",
  protect,
  authorizeRoles("medicalOwner"),
  profileImageUpload.single("profileImageFile"),
  updateMedicalStoreProfile,
);

router.get("/:id", getSingleMedicalStore);

module.exports = router;
