const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
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

const doctorProfileFields = [
  "specialization",
  "experience",
  "consultationFee",
  "bio",
  "qualification",
  "languages",
  "consultationModes",
  "availability",
  "profileImage",
  "clinicAddress",
  "hospital",
  "hospitalId",
];

const buildDoctorPayload = (body) => {
  const payload = {};

  doctorProfileFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  ["experience", "consultationFee"].forEach((field) => {
    if (payload[field] !== undefined) {
      payload[field] = parseNumberField(payload[field]);
    }
  });

  ["languages", "consultationModes", "availability"].forEach((field) => {
    if (payload[field] !== undefined) {
      payload[field] = parseJsonField(payload[field], []);
    }
  });

  if (payload.profileImage !== undefined) {
    payload.profileImage = cleanImageUrl(payload.profileImage);
    payload.profileImagePublicId = "";
  }

  if (payload.hospitalId !== undefined) {
    payload.hospital = payload.hospitalId || null;
    delete payload.hospitalId;
  }

  return payload;
};

const validateDoctorHospital = async (hospitalId) => {
  if (!hospitalId) return null;

  const hospital = await Hospital.findById(hospitalId).populate(
    "admin",
    "isApproved isBlocked role",
  );

  if (!hospital || !hospital.admin?.isApproved || hospital.admin?.isBlocked) {
    return null;
  }

  return hospital._id;
};

const applyDoctorProfileImage = async (doctor, file) => {
  if (!file) return;

  const uploadedImage = await uploadImageToCloudinary(
    file.buffer,
    `healthcare/profile-images/doctors/${doctor.user}`,
  );

  if (doctor.profileImagePublicId) {
    await deleteCloudinaryImage(doctor.profileImagePublicId);
  }

  doctor.profileImage = uploadedImage.secure_url;
  doctor.profileImagePublicId = uploadedImage.public_id;
};

exports.createDoctorProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can create doctor profile",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your doctor account is not approved yet",
      });
    }

    const existingProfile = await Doctor.findOne({ user: userId });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Doctor profile already exists",
      });
    }

    const payload = buildDoctorPayload(req.body);

    if (payload.hospital !== undefined) {
      payload.hospital = await validateDoctorHospital(payload.hospital);
    }

    const doctor = await Doctor.create({
      user: userId,
      ...payload,
    });

    await applyDoctorProfileImage(doctor, req.file);
    await doctor.save();

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate("user", "fullName email phone role isApproved isBlocked")
      .populate("hospital", "name city state contactNumber");

    res.status(201).json({
      success: true,
      message: "Doctor profile created successfully",
      doctor: populatedDoctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate("user", "fullName email phone role isApproved isBlocked")
      .populate("hospital", "name city state contactNumber");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const payload = buildDoctorPayload(req.body);

    if (payload.hospital !== undefined) {
      payload.hospital = await validateDoctorHospital(payload.hospital);
    }

    Object.keys(payload).forEach((field) => {
      if (field === "profileImage" && doctor.profileImagePublicId) {
        deleteCloudinaryImage(doctor.profileImagePublicId).catch(() => {});
      }

      doctor[field] = payload[field];
    });

    await applyDoctorProfileImage(doctor, req.file);

    await doctor.save();

    const updatedDoctor = await Doctor.findById(doctor._id)
      .populate("user", "fullName email phone role isApproved isBlocked")
      .populate("hospital", "name city state contactNumber");

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, mode, search } = req.query;

    const filter = {};

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    if (mode) {
      filter.consultationModes = mode;
    }

    let doctors = await Doctor.find(filter)
      .populate("user", "fullName email phone role isApproved isBlocked")
      .populate("hospital", "name city state contactNumber")
      .sort({ createdAt: -1 });

    doctors = doctors.filter(
      (doctor) =>
        doctor.user &&
        doctor.user.isApproved === true &&
        doctor.user.isBlocked !== true,
    );

    if (search) {
      doctors = doctors.filter((doctor) => {
        const keyword = search.toLowerCase();
        const name = doctor.user.fullName.toLowerCase();
        const spec = doctor.specialization.toLowerCase();

        return name.includes(keyword) || spec.includes(keyword);
      });
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSingleDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("user", "fullName email phone role isApproved isBlocked")
      .populate("hospital", "name city state contactNumber");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctor.user.isApproved || doctor.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Doctor profile is not available",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
