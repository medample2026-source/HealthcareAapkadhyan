const express = require("express");
const rateLimit = require("express-rate-limit");
const { createFeedback, getTestimonials } = require("../controllers/feedbackController");
const { optionalProtect } = require("../middleware/authMiddleware");

const router = express.Router();

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    message: "Too many feedback submissions. Please try again later.",
  },
});

router.get("/testimonials", getTestimonials);
router.post("/", feedbackLimiter, optionalProtect, createFeedback);

module.exports = router;
