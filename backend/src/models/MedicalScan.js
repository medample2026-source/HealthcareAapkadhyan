const mongoose = require("mongoose");

const medicalScanSchema = new mongoose.Schema(
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

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    patientUniqueId: {
      type: String,
      required: [true, "Patient unique ID is required"],
      trim: true,
    },

    patientName: {
      type: String,
      trim: true,
      default: "",
    },

    patientPhone: {
      type: String,
      trim: true,
      default: "",
    },

    billAmount: {
      type: Number,
      required: [true, "Bill amount is required"],
      min: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    scanSource: {
      type: String,
      enum: ["qr", "manual"],
      default: "manual",
    },

    note: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    monthKey: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    month: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

medicalScanSchema.index({ medicalStore: 1, monthKey: 1 });
medicalScanSchema.index({ owner: 1, monthKey: 1 });
medicalScanSchema.index({ patientUniqueId: 1 });
medicalScanSchema.index({ createdAt: -1 });

module.exports = mongoose.model("MedicalScan", medicalScanSchema);
