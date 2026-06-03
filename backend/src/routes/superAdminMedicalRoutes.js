const express = require("express");

const {
  getMedicalStoreAnalytics,
  getSingleMedicalStoreAnalytics,
  toggleMedicalStoreStatus,
  verifyMedicalStore,
} = require("../controllers/superAdminMedicalController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/stores",
  protect,
  authorizeRoles("superAdmin"),
  getMedicalStoreAnalytics,
);

router.get(
  "/stores/:storeId",
  protect,
  authorizeRoles("superAdmin"),
  getSingleMedicalStoreAnalytics,
);

router.patch(
  "/stores/:storeId/status",
  protect,
  authorizeRoles("superAdmin"),
  toggleMedicalStoreStatus,
);

router.patch(
  "/stores/:storeId/verify",
  protect,
  authorizeRoles("superAdmin"),
  verifyMedicalStore,
);

module.exports = router;
