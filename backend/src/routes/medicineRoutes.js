const express = require("express");

const {
  addMedicine,
  getMyMedicines,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
} = require("../controllers/medicineController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/search", searchMedicines);

router.post("/", protect, authorizeRoles("medicalOwner"), addMedicine);

router.get("/my", protect, authorizeRoles("medicalOwner"), getMyMedicines);

router.patch("/:id", protect, authorizeRoles("medicalOwner"), updateMedicine);

router.delete("/:id", protect, authorizeRoles("medicalOwner"), deleteMedicine);

module.exports = router;
