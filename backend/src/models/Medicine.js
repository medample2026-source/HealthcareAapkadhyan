const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    medicalStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalStore",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    medicineName: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },

    genericName: {
      type: String,
      trim: true,
      default: "",
    },

    brandName: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      enum: [
        "Tablet",
        "Capsule",
        "Syrup",
        "Injection",
        "Cream",
        "Drops",
        "Inhaler",
        "Medical Equipment",
        "Other",
      ],
      default: "Tablet",
    },

    strength: {
      type: String,
      trim: true,
      default: "",
    },

    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    prescriptionRequired: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

medicineSchema.index({
  medicineName: "text",
  genericName: "text",
  brandName: "text",
});

medicineSchema.index({ medicalStore: 1, medicineName: 1 });
medicineSchema.index({ owner: 1 });
medicineSchema.index({ isAvailable: 1 });

module.exports = mongoose.model("Medicine", medicineSchema);
