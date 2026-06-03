const MedicalStore = require("../models/MedicalStore");
const {
  deleteCloudinaryImage,
  uploadImageToCloudinary,
} = require("../utils/cloudinaryUpload");
const {
  cleanImageUrl,
  parseBooleanField,
  parseNumberField,
} = require("../utils/profilePayload");

const getOwnerId = (req) => {
  return req.user?._id || req.user?.id;
};

const buildLocation = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      latitude: null,
      longitude: null,
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
    };
  }

  return {
    latitude: lat,
    longitude: lng,
    location: {
      type: "Point",
      coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
    },
  };
};

const checkProfileComplete = (data) => {
  return Boolean(
    data.storeName &&
    data.storeType &&
    data.phone &&
    data.address &&
    data.city &&
    data.state &&
    data.pincode,
  );
};

const applyMedicalStoreProfileImage = async (medicalStore, file) => {
  if (!file) return;

  const uploadedImage = await uploadImageToCloudinary(
    file.buffer,
    `healthcare/profile-images/medical-stores/${medicalStore.owner}`,
  );

  if (medicalStore.profileImagePublicId) {
    await deleteCloudinaryImage(medicalStore.profileImagePublicId);
  }

  medicalStore.profileImage = uploadedImage.secure_url;
  medicalStore.profileImagePublicId = uploadedImage.public_id;
};

// @desc    Create medical store profile
// @route   POST /api/medical-stores/profile
// @access  Private - medicalOwner
exports.createMedicalStoreProfile = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const existingProfile = await MedicalStore.findOne({
      owner: ownerId,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Medical store profile already exists",
      });
    }

    const {
      storeName,
      storeType,
      ownerName,
      drugLicenseNumber,
      registrationNumber,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      openingTime,
      closingTime,
      open24x7,
      homeDeliveryAvailable,
      discountAvailable,
      discountPercentage,
      profileImage,
    } = req.body;

    if (!storeName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message:
          "Store name, phone, address, city, state, and pincode are required",
      });
    }

    const locationData = buildLocation(latitude, longitude);

    const profileData = {
      owner: ownerId,
      storeName: storeName.trim(),
      storeType: storeType || "Medical Store",
      ownerName: ownerName?.trim() || req.user?.fullName || "",
      drugLicenseNumber: drugLicenseNumber?.trim() || "",
      registrationNumber: registrationNumber?.trim() || "",
      phone: phone.trim(),
      email: email?.trim()?.toLowerCase() || req.user?.email || "",
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      ...locationData,
      openingTime: openingTime || "09:00",
      closingTime: closingTime || "21:00",
      open24x7: parseBooleanField(open24x7),
      homeDeliveryAvailable: parseBooleanField(homeDeliveryAvailable),
      discountAvailable:
        discountAvailable === undefined
          ? true
          : parseBooleanField(discountAvailable),
      discountPercentage:
        discountPercentage === undefined || discountPercentage === ""
          ? 5
          : parseNumberField(discountPercentage, 5),
      profileImage: cleanImageUrl(profileImage),
    };

    profileData.isProfileComplete = checkProfileComplete(profileData);

    const medicalStore = await MedicalStore.create(profileData);

    await applyMedicalStoreProfileImage(medicalStore, req.file);
    await medicalStore.save();

    return res.status(201).json({
      success: true,
      message: "Medical store profile created successfully",
      medicalStore,
    });
  } catch (error) {
    console.error("Create medical store profile error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Medical store profile already exists for this owner",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create medical store profile",
    });
  }
};

// @desc    Get logged-in medical owner's profile
// @route   GET /api/medical-stores/profile/me
// @access  Private - medicalOwner
exports.getMyMedicalStoreProfile = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const medicalStore = await MedicalStore.findOne({
      owner: ownerId,
    }).populate("owner", "fullName email phone role isApproved");

    if (!medicalStore) {
      return res.status(404).json({
        success: false,
        message: "Medical store profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      medicalStore,
    });
  } catch (error) {
    console.error("Get my medical store profile error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch medical store profile",
    });
  }
};

// @desc    Update medical store profile
// @route   PATCH /api/medical-stores/profile
// @access  Private - medicalOwner
exports.updateMedicalStoreProfile = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const medicalStore = await MedicalStore.findOne({
      owner: ownerId,
    });

    if (!medicalStore) {
      return res.status(404).json({
        success: false,
        message: "Medical store profile not found",
      });
    }

    const allowedFields = [
      "storeName",
      "storeType",
      "ownerName",
      "drugLicenseNumber",
      "registrationNumber",
      "phone",
      "email",
      "address",
      "city",
      "state",
      "pincode",
      "openingTime",
      "closingTime",
      "open24x7",
      "homeDeliveryAvailable",
      "discountAvailable",
      "discountPercentage",
      "profileImage",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (
          ["open24x7", "homeDeliveryAvailable", "discountAvailable"].includes(
            field,
          )
        ) {
          medicalStore[field] = parseBooleanField(req.body[field]);
        } else if (field === "profileImage") {
          if (medicalStore.profileImagePublicId) {
            deleteCloudinaryImage(medicalStore.profileImagePublicId).catch(
              () => {},
            );
          }

          medicalStore.profileImage = cleanImageUrl(req.body.profileImage);
          medicalStore.profileImagePublicId = "";
        } else if (typeof req.body[field] === "string") {
          medicalStore[field] = req.body[field].trim();
        } else {
          medicalStore[field] = req.body[field];
        }
      }
    });

    if (medicalStore.email) {
      medicalStore.email = medicalStore.email.toLowerCase();
    }

    if (req.body.latitude !== undefined || req.body.longitude !== undefined) {
      const locationData = buildLocation(req.body.latitude, req.body.longitude);

      medicalStore.latitude = locationData.latitude;
      medicalStore.longitude = locationData.longitude;
      medicalStore.location = locationData.location;
    }

    if (
      req.body.discountPercentage !== undefined &&
      req.body.discountPercentage !== ""
    ) {
      const discount = parseNumberField(req.body.discountPercentage, 5);

      if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
        return res.status(400).json({
          success: false,
          message: "Discount percentage must be between 0 and 100",
        });
      }

      medicalStore.discountPercentage = discount;
    }

    await applyMedicalStoreProfileImage(medicalStore, req.file);

    medicalStore.isProfileComplete = checkProfileComplete(medicalStore);

    await medicalStore.save();

    return res.status(200).json({
      success: true,
      message: "Medical store profile updated successfully",
      medicalStore,
    });
  } catch (error) {
    console.error("Update medical store profile error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update medical store profile",
    });
  }
};

// @desc    Get all public active medical stores
// @route   GET /api/medical-stores
// @access  Public
exports.getAllMedicalStores = async (req, res) => {
  try {
    const { city, state, storeType, search } = req.query;

    const query = {
      isActive: true,
      isProfileComplete: true,
    };

    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    if (state) {
      query.state = { $regex: state, $options: "i" };
    }

    if (storeType) {
      query.storeType = storeType;
    }

    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
      ];
    }

    const medicalStores = await MedicalStore.find(query)
      .populate("owner", "fullName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: medicalStores.length,
      medicalStores,
    });
  } catch (error) {
    console.error("Get all medical stores error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch medical stores",
    });
  }
};

// @desc    Get single public medical store
// @route   GET /api/medical-stores/:id
// @access  Public
exports.getSingleMedicalStore = async (req, res) => {
  try {
    const { id } = req.params;

    const medicalStore = await MedicalStore.findById(id).populate(
      "owner",
      "fullName email phone role",
    );

    if (!medicalStore) {
      return res.status(404).json({
        success: false,
        message: "Medical store not found",
      });
    }

    return res.status(200).json({
      success: true,
      medicalStore,
    });
  } catch (error) {
    console.error("Get single medical store error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch medical store",
    });
  }
};
