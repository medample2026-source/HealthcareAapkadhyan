const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  createPartnerInquiry,
  getPartnerInquiries,
  updatePartnerInquiryStatus,
} = require("../controllers/partnerInquiryController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

const partnerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: "Too many partnership inquiries. Please try again later.",
  },
});

router.post("/", partnerLimiter, createPartnerInquiry);

router.get("/", protect, authorizeRoles("superAdmin"), getPartnerInquiries);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("superAdmin"),
  updatePartnerInquiryStatus,
);

module.exports = router;
