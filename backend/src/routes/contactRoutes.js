const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const { sendContactMessage } = require("../controllers/contactController");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: "Too many messages sent. Please try again after 15 minutes.",
  },
});

router.post(
  "/",
  contactLimiter,
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 60 })
      .withMessage("Name must be between 2 and 60 characters"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),

    body("phone")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 10, max: 15 })
      .withMessage("Phone number must be valid"),

    body("subject")
      .trim()
      .notEmpty()
      .withMessage("Subject is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Subject must be between 3 and 100 characters"),

    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Message must be between 10 and 1000 characters"),
  ],
  sendContactMessage,
);

module.exports = router;
