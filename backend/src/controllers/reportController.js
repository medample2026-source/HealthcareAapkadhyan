const streamifier = require("streamifier");

const cloudinary = require("../config/cloudinary");
const Report = require("../models/Report");
const PatientProfile = require("../models/PatientProfile");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

const uploadToCloudinary = (fileBuffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const getCloudinaryResourceType = (mimetype) => {
  if (mimetype === "application/pdf") {
    return "raw";
  }

  return "image";
};

const populateReportQuery = (query) => {
  return query
    .populate("patient", "fullName email phone role")
    .populate("uploadedBy", "fullName email phone role")
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "fullName email phone role",
      },
    })
    .populate("hospital", "name city state contactNumber emergencyNumber");
};

const getPatientProfileByUniqueId = async (patientId) => {
  return PatientProfile.findOne({ patientId }).populate(
    "patient",
    "fullName email phone role",
  );
};

exports.searchPatientByUniqueId = async (req, res) => {
  try {
    const { patientId } = req.params;

    const profile = await getPatientProfileByUniqueId(patientId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient not found with this unique ID",
      });
    }

    res.status(200).json({
      success: true,
      patient: {
        patientUniqueId: profile.patientId,
        patientUserId: profile.patient?._id,
        profileId: profile._id,
        fullName: profile.patient?.fullName,
        email: profile.patient?.email,
        phone: profile.patient?.phone,
        age: profile.age,
        gender: profile.gender,
        bloodGroup: profile.bloodGroup,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactNumber: profile.emergencyContactNumber,
        medicalConditions: profile.medicalConditions,
        allergies: profile.allergies,
        currentMedications: profile.currentMedications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadMyReport = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can upload their own reports",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Report file is required",
      });
    }

    const profile = await PatientProfile.findOne({
      patient: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Please create patient profile before uploading reports",
      });
    }

    const { title, reportType, description, visibility } = req.body;

    const resourceType = getCloudinaryResourceType(req.file.mimetype);

    const uploadedFile = await uploadToCloudinary(
      req.file.buffer,
      `healthcare/reports/${profile.patientId}`,
      resourceType,
    );

    const report = await Report.create({
      patient: req.user._id,
      patientProfile: profile._id,
      patientUniqueId: profile.patientId,
      uploadedBy: req.user._id,
      uploadedByRole: "patient",
      title,
      reportType,
      description,
      fileUrl: uploadedFile.secure_url,
      publicId: uploadedFile.public_id,
      fileType: req.file.mimetype,
      originalFileName: req.file.originalname,
      visibility: visibility || "doctor-visible",
    });

    const populatedReport = await populateReportQuery(
      Report.findById(report._id),
    );

    res.status(201).json({
      success: true,
      message: "Report uploaded successfully",
      report: populatedReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadReportForPatientByDoctor = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can upload reports for patients",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Report file is required",
      });
    }

    const { patientId } = req.params;

    const profile = await getPatientProfileByUniqueId(patientId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient not found with this unique ID",
      });
    }

    const doctorProfile = await Doctor.findOne({
      user: req.user._id,
    });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const {
      title,
      reportType,
      description,
      diagnosisNote,
      prescriptionNote,
      visibility,
    } = req.body;

    const resourceType = getCloudinaryResourceType(req.file.mimetype);

    const uploadedFile = await uploadToCloudinary(
      req.file.buffer,
      `healthcare/reports/${profile.patientId}`,
      resourceType,
    );

    const report = await Report.create({
      patient: profile.patient._id,
      patientProfile: profile._id,
      patientUniqueId: profile.patientId,
      uploadedBy: req.user._id,
      uploadedByRole: "doctor",
      doctor: doctorProfile._id,
      title,
      reportType,
      description,
      diagnosisNote,
      prescriptionNote,
      fileUrl: uploadedFile.secure_url,
      publicId: uploadedFile.public_id,
      fileType: req.file.mimetype,
      originalFileName: req.file.originalname,
      visibility: visibility || "doctor-visible",
    });

    const populatedReport = await populateReportQuery(
      Report.findById(report._id),
    );

    res.status(201).json({
      success: true,
      message: "Patient report uploaded by doctor successfully",
      report: populatedReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadReportForPatientByHospital = async (req, res) => {
  try {
    if (req.user.role !== "hospitalAdmin") {
      return res.status(403).json({
        success: false,
        message: "Only hospital admins can upload reports for patients",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Report file is required",
      });
    }

    const { patientId } = req.params;

    const profile = await getPatientProfileByUniqueId(patientId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient not found with this unique ID",
      });
    }

    const hospital = await Hospital.findOne({
      admin: req.user._id,
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital profile not found",
      });
    }

    const {
      title,
      reportType,
      description,
      diagnosisNote,
      prescriptionNote,
      hospitalNote,
      visibility,
    } = req.body;

    const resourceType = getCloudinaryResourceType(req.file.mimetype);

    const uploadedFile = await uploadToCloudinary(
      req.file.buffer,
      `healthcare/reports/${profile.patientId}`,
      resourceType,
    );

    const report = await Report.create({
      patient: profile.patient._id,
      patientProfile: profile._id,
      patientUniqueId: profile.patientId,
      uploadedBy: req.user._id,
      uploadedByRole: "hospitalAdmin",
      hospital: hospital._id,
      title,
      reportType,
      description,
      diagnosisNote,
      prescriptionNote,
      hospitalNote,
      fileUrl: uploadedFile.secure_url,
      publicId: uploadedFile.public_id,
      fileType: req.file.mimetype,
      originalFileName: req.file.originalname,
      visibility: visibility || "hospital-visible",
    });

    const populatedReport = await populateReportQuery(
      Report.findById(report._id),
    );

    res.status(201).json({
      success: true,
      message: "Patient report uploaded by hospital successfully",
      report: populatedReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await populateReportQuery(
      Report.find({
        patient: req.user._id,
      }).sort({ createdAt: -1 }),
    );

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPatientReportsForDoctor = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can access patient reports",
      });
    }

    const { patientId } = req.params;

    const profile = await PatientProfile.findOne({
      patientId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient not found with this unique ID",
      });
    }

    const reports = await populateReportQuery(
      Report.find({
        patientProfile: profile._id,
        visibility: {
          $in: ["doctor-visible", "all-medical-staff"],
        },
      }).sort({ createdAt: -1 }),
    );

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPatientReportsForHospital = async (req, res) => {
  try {
    if (req.user.role !== "hospitalAdmin") {
      return res.status(403).json({
        success: false,
        message: "Only hospital admins can access patient reports",
      });
    }

    const { patientId } = req.params;

    const profile = await PatientProfile.findOne({
      patientId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient not found with this unique ID",
      });
    }

    const hospital = await Hospital.findOne({
      admin: req.user._id,
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital profile not found",
      });
    }

    const reports = await populateReportQuery(
      Report.find({
        patientProfile: profile._id,
        $or: [
          {
            visibility: {
              $in: ["hospital-visible", "all-medical-staff"],
            },
          },
          {
            hospital: hospital._id,
          },
        ],
      }).sort({ createdAt: -1 }),
    );

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllReportsForSuperAdmin = async (req, res) => {
  try {
    if (req.user.role !== "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can access all reports",
      });
    }

    const reports = await populateReportQuery(
      Report.find().sort({ createdAt: -1 }),
    );

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPatientReportsForSuperAdmin = async (req, res) => {
  try {
    if (req.user.role !== "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can access patient reports",
      });
    }

    const { patientId } = req.params;

    const profile = await PatientProfile.findOne({
      patientId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient not found with this unique ID",
      });
    }

    const reports = await populateReportQuery(
      Report.find({
        patientProfile: profile._id,
      }).sort({ createdAt: -1 }),
    );

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteMyReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findOne({
      _id: reportId,
      patient: req.user._id,
      uploadedByRole: "patient",
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or cannot be deleted",
      });
    }

    await cloudinary.uploader.destroy(report.publicId, {
      resource_type: report.fileType === "application/pdf" ? "raw" : "image",
    });

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
