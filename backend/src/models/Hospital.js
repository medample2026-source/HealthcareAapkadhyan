const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: [true, "Hospital registration number is required"],
      trim: true,
      unique: true,
    },

    hospitalType: {
      type: String,
      enum: [
        "Government",
        "Private",
        "Multi-specialty",
        "Clinic",
        "Diagnostic Center",
        "Emergency Center",
        "Other",
      ],
      default: "Private",
    },

    description: {
      type: String,
      required: [true, "Hospital description is required"],
      trim: true,
      maxlength: 1500,
    },

    address: {
      type: String,
      required: [true, "Hospital address is required"],
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
    },

    emergencyNumber: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    profileImagePublicId: {
      type: String,
      default: "",
    },

    services: {
      type: [String],
      default: [],
    },

    facilities: {
      type: [String],
      default: [],
    },

    totalBeds: {
      type: Number,
      default: 0,
      min: 0,
    },

    availableBeds: {
      type: Number,
      default: 0,
      min: 0,
    },

    icuBeds: {
      type: Number,
      default: 0,
      min: 0,
    },

    availableIcuBeds: {
      type: Number,
      default: 0,
      min: 0,
    },

    emergencyAvailable: {
      type: Boolean,
      default: false,
    },

    ambulanceAvailable: {
      type: Boolean,
      default: false,
    },

    open24x7: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    isProfileComplete: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Hospital", hospitalSchema);
