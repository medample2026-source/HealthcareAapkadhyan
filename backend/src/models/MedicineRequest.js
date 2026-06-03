const mongoose = require("mongoose");

const medicineRequestSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },

    medicalStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalStore",
      required: true,
    },

    storeOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },

    patientPhone: {
      type: String,
      required: [true, "Patient phone is required"],
      trim: true,
    },

    patientEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    medicineName: {
      type: String,
      required: true,
      trim: true,
    },

    requestedQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    message: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },

    ownerNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

medicineRequestSchema.index({ medicalStore: 1, status: 1 });
medicineRequestSchema.index({ storeOwner: 1, status: 1 });
medicineRequestSchema.index({ patientPhone: 1 });
medicineRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("MedicineRequest", medicineRequestSchema);
