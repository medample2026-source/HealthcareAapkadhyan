const Feedback = require("../models/Feedback");

const allowedRoles = [
  "patient",
  "doctor",
  "hospitalAdmin",
  "medicalOwner",
  "guest",
];

exports.createFeedback = async (req, res) => {
  try {
    const { name, role, rating, message } = req.body;

    const feedbackName = name?.trim() || req.user?.fullName || "";
    const feedbackRole = allowedRoles.includes(role)
      ? role
      : req.user?.role || "guest";
    const feedbackRating = Number(rating);

    if (!feedbackName) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!Number.isFinite(feedbackRating) || feedbackRating < 1 || feedbackRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Feedback message must be at least 10 characters",
      });
    }

    const feedback = await Feedback.create({
      user: req.user?._id || null,
      name: feedbackName,
      role: feedbackRole,
      rating: feedbackRating,
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for sharing your feedback",
      feedback,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit feedback",
    });
  }
};

exports.getTestimonials = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 12);

    const testimonials = await Feedback.find({ isVisible: true })
      .select("name role rating message createdAt")
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: testimonials.length,
      testimonials,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load testimonials",
    });
  }
};
