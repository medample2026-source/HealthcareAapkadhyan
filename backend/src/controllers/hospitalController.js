const Hospital = require("../models/Hospital");
const User = require("../models/User");
const {
  deleteCloudinaryImage,
  uploadImageToCloudinary,
} = require("../utils/cloudinaryUpload");
const {
  cleanImageUrl,
  parseBooleanField,
  parseJsonField,
  parseNumberField,
} = require("../utils/profilePayload");

const hospitalProfileFields = [
  "name",
  "registrationNumber",
  "hospitalType",
  "description",
  "address",
  "city",
  "state",
  "pincode",
  "contactNumber",
  "emergencyNumber",
  "email",
  "website",
  "profileImage",
  "services",
  "facilities",
  "totalBeds",
  "availableBeds",
  "icuBeds",
  "availableIcuBeds",
  "emergencyAvailable",
  "ambulanceAvailable",
  "open24x7",
];

const buildHospitalPayload = (body) => {
  const payload = {};

  hospitalProfileFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  ["services", "facilities"].forEach((field) => {
    if (payload[field] !== undefined) {
      payload[field] = parseJsonField(payload[field], []);
    }
  });

  ["totalBeds", "availableBeds", "icuBeds", "availableIcuBeds"].forEach(
    (field) => {
      if (payload[field] !== undefined) {
        payload[field] = parseNumberField(payload[field]);
      }
    },
  );

  ["emergencyAvailable", "ambulanceAvailable", "open24x7"].forEach((field) => {
    if (payload[field] !== undefined) {
      payload[field] = parseBooleanField(payload[field]);
    }
  });

  if (payload.profileImage !== undefined) {
    payload.profileImage = cleanImageUrl(payload.profileImage);
    payload.profileImagePublicId = "";
  }

  return payload;
};

const applyHospitalProfileImage = async (hospital, file) => {
  if (!file) return;

  const uploadedImage = await uploadImageToCloudinary(
    file.buffer,
    `healthcare/profile-images/hospitals/${hospital.admin}`,
  );

  if (hospital.profileImagePublicId) {
    await deleteCloudinaryImage(hospital.profileImagePublicId);
  }

  hospital.profileImage = uploadedImage.secure_url;
  hospital.profileImagePublicId = uploadedImage.public_id;
};

exports.createHospitalProfile = async (req, res) => {
  try {
    const adminId = req.user._id;

    const user = await User.findById(adminId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "hospitalAdmin") {
      return res.status(403).json({
        success: false,
        message: "Only hospital admins can create hospital profile",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your hospital admin account is not approved yet",
      });
    }

    const existingHospital = await Hospital.findOne({ admin: adminId });

    if (existingHospital) {
      return res.status(400).json({
        success: false,
        message: "Hospital profile already exists",
      });
    }

    const hospital = await Hospital.create({
      admin: adminId,
      ...buildHospitalPayload(req.body),
    });

    await applyHospitalProfileImage(hospital, req.file);
    await hospital.save();

    const populatedHospital = await Hospital.findById(hospital._id).populate(
      "admin",
      "fullName email phone role isApproved isBlocked",
    );

    res.status(201).json({
      success: true,
      message: "Hospital profile created successfully",
      hospital: populatedHospital,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyHospitalProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ admin: req.user._id }).populate(
      "admin",
      "fullName email phone role isApproved isBlocked",
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital profile not found",
      });
    }

    res.status(200).json({
      success: true,
      hospital,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateHospitalProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ admin: req.user._id });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital profile not found",
      });
    }

    const payload = buildHospitalPayload(req.body);

    Object.keys(payload).forEach((field) => {
      if (field === "profileImage" && hospital.profileImagePublicId) {
        deleteCloudinaryImage(hospital.profileImagePublicId).catch(() => {});
      }

      hospital[field] = payload[field];
    });

    await applyHospitalProfileImage(hospital, req.file);

    await hospital.save();

    const updatedHospital = await Hospital.findById(hospital._id).populate(
      "admin",
      "fullName email phone role isApproved isBlocked",
    );

    res.status(200).json({
      success: true,
      message: "Hospital profile updated successfully",
      hospital: updatedHospital,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const { city, state, emergency, search } = req.query;

    const filter = {};

    if (city) {
      filter.city = { $regex: city, $options: "i" };
    }

    if (state) {
      filter.state = { $regex: state, $options: "i" };
    }

    if (emergency === "true") {
      filter.emergencyAvailable = true;
    }

    let hospitals = await Hospital.find(filter)
      .populate("admin", "fullName email phone role isApproved isBlocked")
      .sort({ createdAt: -1 });

    hospitals = hospitals.filter(
      (hospital) =>
        hospital.admin &&
        hospital.admin.isApproved === true &&
        hospital.admin.isBlocked !== true,
    );

    if (search) {
      const keyword = search.toLowerCase();

      hospitals = hospitals.filter((hospital) => {
        const name = hospital.name.toLowerCase();
        const cityName = hospital.city.toLowerCase();
        const services = hospital.services.join(" ").toLowerCase();

        return (
          name.includes(keyword) ||
          cityName.includes(keyword) ||
          services.includes(keyword)
        );
      });
    }

    res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSingleHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).populate(
      "admin",
      "fullName email phone role isApproved isBlocked",
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    if (!hospital.admin.isApproved || hospital.admin.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Hospital profile is not available",
      });
    }

    res.status(200).json({
      success: true,
      hospital,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
