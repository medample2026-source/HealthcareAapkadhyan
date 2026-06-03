const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patientProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
    },

    patientUniqueId: {
      type: String,
      required: true,
      trim: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    uploadedByRole: {
      type: String,
      enum: ["patient", "doctor", "hospitalAdmin", "superAdmin"],
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
    },

    title: {
      type: String,
      required: [true, "Report title is required"],
      trim: true,
    },

    reportType: {
      type: String,
      enum: [
        "Blood Test",
        "X-Ray",
        "MRI",
        "CT Scan",
        "Ultrasound",
        "Prescription",
        "Diagnosis",
        "Discharge Summary",
        "Lab Report",
        "Emergency Report",
        "Admission Report",
        "General Report",
        "Other",
      ],
      default: "General Report",
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1500,
    },

    diagnosisNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1500,
    },

    prescriptionNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1500,
    },

    hospitalNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1500,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    originalFileName: {
      type: String,
      default: "",
    },

    visibility: {
      type: String,
      enum: [
        "private",
        "doctor-visible",
        "hospital-visible",
        "all-medical-staff",
      ],
      default: "doctor-visible",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
