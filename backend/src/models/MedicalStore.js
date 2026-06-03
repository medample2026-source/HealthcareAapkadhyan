const mongoose = require("mongoose");

const medicalStoreSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
    },

    storeType: {
      type: String,
      enum: [
        "Pharmacy",
        "Medical Store",
        "Diagnostic Lab",
        "Clinic Pharmacy",
        "Other",
      ],
      default: "Medical Store",
    },

    ownerName: {
      type: String,
      trim: true,
      default: "",
    },

    drugLicenseNumber: {
      type: String,
      trim: true,
      default: "",
    },

    registrationNumber: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      lowercase: true,
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

    address: {
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

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    openingTime: {
      type: String,
      default: "09:00",
    },

    closingTime: {
      type: String,
      default: "21:00",
    },

    open24x7: {
      type: Boolean,
      default: false,
    },

    homeDeliveryAvailable: {
      type: Boolean,
      default: false,
    },

    discountAvailable: {
      type: Boolean,
      default: true,
    },

    discountPercentage: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },

    monthlyTargetUsers: {
      type: Number,
      default: 150,
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    isVerifiedByAdmin: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

medicalStoreSchema.index({ location: "2dsphere" });
medicalStoreSchema.index({ city: 1, storeType: 1 });
medicalStoreSchema.index({ storeName: "text", city: "text", address: "text" });

module.exports = mongoose.model("MedicalStore", medicalStoreSchema);
