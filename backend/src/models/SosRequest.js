const mongoose = require("mongoose");

const sosRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    requesterType: {
      type: String,
      enum: ["guest", "patient"],
      default: "guest",
    },

    fullName: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    incidentType: {
      type: String,
      required: [true, "Incident type is required"],
      enum: [
        "Accident / Injury",
        "Heart Attack Symptoms",
        "Breathing Problem",
        "High Fever",
        "Pregnancy Emergency",
        "Stroke Symptoms",
        "Severe Bleeding",
        "Unconscious Person",
        "Burn Injury",
        "Poisoning",
        "Mental Health Crisis",
        "Child Emergency",
        "Senior Citizen Emergency",
        "Other Emergency",
      ],
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Critical",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    location: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      accuracy: {
        type: Number,
        default: null,
      },
    },

    manualAddress: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    mapsLocationUrl: {
      type: String,
      default: "",
    },

    nearestSearchLinks: {
      hospitals: {
        type: String,
        default: "",
      },
      clinics: {
        type: String,
        default: "",
      },
      pharmacies: {
        type: String,
        default: "",
      },
    },

    emergencyMessage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "new",
        "viewed",
        "accepted",
        "rejected",
        "contacted",
        "ambulance_dispatched",
        "resolved",
        "cancelled",
      ],
      default: "new",
    },

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    statusNote: {
      type: String,
      trim: true,
      default: "",
    },

    acceptedByHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
    },

    acceptedByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    ambulanceDispatchedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SosRequest", sosRequestSchema);
