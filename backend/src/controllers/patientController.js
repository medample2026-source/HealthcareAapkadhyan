const PatientProfile = require("../models/PatientProfile");
const User = require("../models/User");
const {
  deleteCloudinaryImage,
  uploadImageToCloudinary,
} = require("../utils/cloudinaryUpload");
const {
  cleanImageUrl,
  parseJsonField,
  parseNumberField,
} = require("../utils/profilePayload");

const generatePatientId = () => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `PAT-${year}-${randomNumber}`;
};

const checkProfileComplete = (profile) => {
  return Boolean(
    profile.age &&
    profile.gender &&
    profile.bloodGroup &&
    profile.emergencyContactName &&
    profile.emergencyContactNumber,
  );
};

const patientProfileFields = [
  "age",
  "gender",
  "bloodGroup",
  "height",
  "weight",
  "address",
  "city",
  "state",
  "pincode",
  "emergencyContactName",
  "emergencyContactNumber",
  "emergencyContactRelation",
  "medicalConditions",
  "allergies",
  "currentMedications",
  "pastSurgeries",
  "insuranceProvider",
  "insuranceNumber",
  "profileImage",
];

const buildPatientPayload = (body) => {
  const payload = {};

  patientProfileFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  ["age", "height", "weight"].forEach((field) => {
    if (payload[field] !== undefined) {
      payload[field] = parseNumberField(payload[field]);
    }
  });

  [
    "medicalConditions",
    "allergies",
    "currentMedications",
    "pastSurgeries",
  ].forEach((field) => {
    if (payload[field] !== undefined) {
      payload[field] = parseJsonField(payload[field], []);
    }
  });

  if (payload.profileImage !== undefined) {
    payload.profileImage = cleanImageUrl(payload.profileImage);
    payload.profileImagePublicId = "";
  }

  return payload;
};

const applyPatientProfileImage = async (profile, file, folder) => {
  if (!file) return;

  const uploadedImage = await uploadImageToCloudinary(file.buffer, folder);

  if (profile.profileImagePublicId) {
    await deleteCloudinaryImage(profile.profileImagePublicId);
  }

  profile.profileImage = uploadedImage.secure_url;
  profile.profileImagePublicId = uploadedImage.public_id;
};

const getProfileByPatientId = (patientId) => {
  const cleanPatientId = String(patientId || "").trim();

  if (!cleanPatientId) {
    return PatientProfile.findOne({ _id: null });
  }

  const escapedPatientId = cleanPatientId.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  return PatientProfile.findOne({
    patientId: {
      $regex: `^${escapedPatientId}$`,
      $options: "i",
    },
  });
};

const buildLinkedPatientProfile = (profile) => ({
  patientId: profile.patientId,
  fullName: profile.patient?.fullName || "",
  email: profile.patient?.email || "",
  phone: profile.patient?.phone || "",
  age: profile.age,
  gender: profile.gender,
  bloodGroup: profile.bloodGroup,
  height: profile.height,
  weight: profile.weight,
  address: profile.address,
  city: profile.city,
  state: profile.state,
  pincode: profile.pincode,
  emergencyContactName: profile.emergencyContactName,
  emergencyContactNumber: profile.emergencyContactNumber,
  emergencyContactRelation: profile.emergencyContactRelation,
  medicalConditions: profile.medicalConditions,
  allergies: profile.allergies,
  currentMedications: profile.currentMedications,
  pastSurgeries: profile.pastSurgeries,
  insuranceProvider: profile.insuranceProvider,
  insuranceNumber: profile.insuranceNumber,
  profileImage: profile.profileImage,
  isProfileComplete: profile.isProfileComplete,
  updatedAt: profile.updatedAt,
});

exports.createPatientProfile = async (req, res) => {
  try {
    const patientId = req.user._id;

    const user = await User.findById(patientId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can create patient profile",
      });
    }

    const existingProfile = await PatientProfile.findOne({
      patient: patientId,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Patient profile already exists",
      });
    }

    let uniquePatientId = generatePatientId();

    const existingPatientId = await PatientProfile.findOne({
      patientId: uniquePatientId,
    });

    if (existingPatientId) {
      uniquePatientId = generatePatientId();
    }

    const profile = await PatientProfile.create({
      patient: patientId,
      patientId: uniquePatientId,
      ...buildPatientPayload(req.body),
    });

    await applyPatientProfileImage(
      profile,
      req.file,
      `healthcare/profile-images/patients/${uniquePatientId}`,
    );

    profile.isProfileComplete = checkProfileComplete(profile);
    await profile.save();

    const populatedProfile = await PatientProfile.findById(
      profile._id,
    ).populate("patient", "fullName email phone role");

    res.status(201).json({
      success: true,
      message: "Patient profile created successfully",
      profile: populatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyPatientProfile = async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({
      patient: req.user._id,
    }).populate("patient", "fullName email phone role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePatientProfile = async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({
      patient: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const payload = buildPatientPayload(req.body);

    Object.keys(payload).forEach((field) => {
      if (field === "profileImage" && profile.profileImagePublicId) {
        deleteCloudinaryImage(profile.profileImagePublicId).catch(() => {});
      }

      profile[field] = payload[field];
    });

    await applyPatientProfileImage(
      profile,
      req.file,
      `healthcare/profile-images/patients/${profile.patientId}`,
    );

    profile.isProfileComplete = checkProfileComplete(profile);

    await profile.save();

    const updatedProfile = await PatientProfile.findById(profile._id).populate(
      "patient",
      "fullName email phone role",
    );

    res.status(200).json({
      success: true,
      message: "Patient profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getEmergencyProfile = async (req, res) => {
  try {
    const { patientId } = req.params;

    const profile = await getProfileByPatientId(patientId).populate(
      "patient",
      "fullName phone",
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Emergency profile not found",
      });
    }

    res.status(200).json({
      success: true,
      emergencyProfile: {
        patientId: profile.patientId,
        fullName: profile.patient?.fullName,
        phone: profile.patient?.phone,
        age: profile.age,
        gender: profile.gender,
        bloodGroup: profile.bloodGroup,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactNumber: profile.emergencyContactNumber,
        emergencyContactRelation: profile.emergencyContactRelation,
        medicalConditions: profile.medicalConditions,
        allergies: profile.allergies,
        currentMedications: profile.currentMedications,
        profileImage: profile.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getQrPatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;

    const profile = await getProfileByPatientId(patientId).populate(
      "patient",
      "fullName email phone isBlocked",
    );

    if (!profile || !profile.patient) {
      return res.status(404).json({
        success: false,
        message: "Patient QR profile not found",
      });
    }

    if (profile.patient.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "This patient profile is not available",
      });
    }

    res.status(200).json({
      success: true,
      patientProfile: buildLinkedPatientProfile(profile),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
