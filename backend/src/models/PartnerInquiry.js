const mongoose = require("mongoose");

const partnerInquirySchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    contactPerson: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    organizationType: {
      type: String,
      required: true,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    partnershipInterest: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 1500,
    },

    status: {
      type: String,
      enum: ["new", "contacted", "approved", "rejected"],
      default: "new",
    },

    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PartnerInquiry", partnerInquirySchema);
