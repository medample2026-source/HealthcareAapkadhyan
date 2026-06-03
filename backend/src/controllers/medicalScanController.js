const MedicalScan = require("../models/MedicalScan");
const MedicalStore = require("../models/MedicalStore");
const PatientProfile = require("../models/PatientProfile");
const User = require("../models/User");

const getOwnerId = (req) => {
  return req.user?._id || req.user?.id;
};

const getMonthInfo = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return {
    year,
    month,
    monthKey: `${year}-${String(month).padStart(2, "0")}`,
  };
};

const extractPatientUniqueId = (value) => {
  if (!value) return "";

  const rawValue = String(value).trim();

  try {
    const url = new URL(rawValue);
    const parts = url.pathname.split("/").filter(Boolean);

    return parts[parts.length - 1] || rawValue;
  } catch {
    return rawValue;
  }
};

const calculateDiscount = (billAmount, discountPercentage) => {
  const bill = Number(billAmount);
  const discount = Number(discountPercentage);

  if (!Number.isFinite(bill) || bill < 0) {
    return null;
  }

  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    return null;
  }

  const discountAmount = Number(((bill * discount) / 100).toFixed(2));
  const finalAmount = Number((bill - discountAmount).toFixed(2));

  return {
    billAmount: bill,
    discountPercentage: discount,
    discountAmount,
    finalAmount,
  };
};

const getOwnerStore = async (ownerId) => {
  return await MedicalStore.findOne({
    owner: ownerId,
    isActive: true,
  });
};

const findPatientByUniqueValue = async (value) => {
  const cleanValue = extractPatientUniqueId(value);

  if (!cleanValue) return null;

  const profile = await PatientProfile.findOne({
    patientId: cleanValue,
  }).populate("patient", "fullName email phone role isApproved isBlocked");

  if (profile?.patient) {
    return {
      user: profile.patient,
      uniqueId: profile.patientId,
      profile,
    };
  }

  const user = await User.findOne({
    role: "patient",
    $or: [{ phone: cleanValue }, { email: cleanValue.toLowerCase() }],
  }).select("fullName email phone role isApproved isBlocked");

  if (!user) return null;

  const userProfile = await PatientProfile.findOne({ patient: user._id });

  return {
    user,
    uniqueId: userProfile?.patientId || cleanValue,
    profile: userProfile,
  };
};

// @desc    Fetch patient details using QR / patient unique ID
// @route   GET /api/medical-scans/patient/:patientUniqueId
// @access  Private - medicalOwner
exports.getPatientByQRCode = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const { patientUniqueId } = req.params;

    if (!patientUniqueId) {
      return res.status(400).json({
        success: false,
        message: "Patient unique ID is required",
      });
    }

    const cleanPatientId = extractPatientUniqueId(patientUniqueId);

    const patientData = await findPatientByUniqueValue(cleanPatientId);
    const patient = patientData?.user;

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found with this QR ID",
      });
    }

    if (patient.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "This patient account is blocked",
      });
    }

    return res.status(200).json({
      success: true,
      patient: {
        id: patient._id,
        fullName: patient.fullName || "",
        email: patient.email || "",
        phone: patient.phone || "",
        uniqueId: patientData.uniqueId || cleanPatientId,
        role: patient.role,
        profileUrl: `/patient-card/${patientData.uniqueId || cleanPatientId}`,
        bloodGroup: patientData.profile?.bloodGroup || "",
        emergencyContactNumber:
          patientData.profile?.emergencyContactNumber || "",
      },
    });
  } catch (error) {
    console.error("Get patient by QR error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch patient details",
    });
  }
};

// @desc    Create QR discount scan interaction
// @route   POST /api/medical-scans
// @access  Private - medicalOwner
exports.createMedicalScan = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const store = await getOwnerStore(ownerId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Medical store profile not found",
      });
    }

    if (!store.isProfileComplete) {
      return res.status(400).json({
        success: false,
        message: "Please complete your medical store profile first",
      });
    }

    const {
      patientUniqueId,
      scannedValue,
      patientName,
      patientPhone,
      billAmount,
      discountPercentage,
      scanSource,
      note,
    } = req.body;

    const finalPatientUniqueId = extractPatientUniqueId(
      patientUniqueId || scannedValue,
    );

    if (!finalPatientUniqueId) {
      return res.status(400).json({
        success: false,
        message: "Patient QR value or unique ID is required",
      });
    }

    if (billAmount === undefined || billAmount === "") {
      return res.status(400).json({
        success: false,
        message: "Bill amount is required",
      });
    }

    const defaultDiscount = store.discountAvailable
      ? Number(store.discountPercentage || 0)
      : 0;

    const finalDiscount =
      discountPercentage === undefined || discountPercentage === ""
        ? defaultDiscount
        : Number(discountPercentage);

    const amountData = calculateDiscount(billAmount, finalDiscount);

    if (!amountData) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill amount or discount percentage",
      });
    }

    let patient = null;
    let finalPatientName = patientName?.trim() || "";
    let finalPatientPhone = patientPhone?.trim() || "";

    const possiblePatientData = await findPatientByUniqueValue(
      finalPatientUniqueId,
    );
    const possiblePatient = possiblePatientData?.user;

    if (possiblePatient) {
      patient = possiblePatient._id;
      finalPatientName = finalPatientName || possiblePatient.fullName || "";
      finalPatientPhone = finalPatientPhone || possiblePatient.phone || "";
    }

    const { monthKey, year, month } = getMonthInfo();

    const scan = await MedicalScan.create({
      medicalStore: store._id,
      owner: ownerId,
      patient,
      patientUniqueId: finalPatientUniqueId,
      patientName: finalPatientName,
      patientPhone: finalPatientPhone,
      ...amountData,
      scanSource: scanSource === "qr" ? "qr" : "manual",
      note: note?.trim() || "",
      monthKey,
      year,
      month,
    });

    const populatedScan = await MedicalScan.findById(scan._id)
      .populate("medicalStore", "storeName city state phone")
      .populate("patient", "fullName phone email role");

    return res.status(201).json({
      success: true,
      message: "QR discount interaction recorded successfully",
      scan: populatedScan,
    });
  } catch (error) {
    console.error("Create medical scan error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to record QR discount interaction",
    });
  }
};

// @desc    Get logged-in medical owner's scan history
// @route   GET /api/medical-scans/my
// @access  Private - medicalOwner
exports.getMyMedicalScans = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const { monthKey, search } = req.query;

    const query = {
      owner: ownerId,
      isActive: true,
    };

    if (monthKey) {
      query.monthKey = monthKey;
    }

    if (search) {
      query.$or = [
        { patientUniqueId: { $regex: search, $options: "i" } },
        { patientName: { $regex: search, $options: "i" } },
        { patientPhone: { $regex: search, $options: "i" } },
      ];
    }

    const scans = await MedicalScan.find(query)
      .populate("medicalStore", "storeName city state phone")
      .populate("patient", "fullName phone email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: scans.length,
      scans,
    });
  } catch (error) {
    console.error("Get my medical scans error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch scan history",
    });
  }
};

// @desc    Get monthly scan stats for logged-in medical owner
// @route   GET /api/medical-scans/my/stats
// @access  Private - medicalOwner
exports.getMyMedicalScanStats = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const { monthKey } = req.query;

    const currentMonth = getMonthInfo();
    const selectedMonthKey = monthKey || currentMonth.monthKey;

    const store = await getOwnerStore(ownerId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Medical store profile not found",
      });
    }

    const scans = await MedicalScan.find({
      owner: ownerId,
      medicalStore: store._id,
      monthKey: selectedMonthKey,
      isActive: true,
    });

    const totalScans = scans.length;

    const uniquePatients = new Set(scans.map((scan) => scan.patientUniqueId))
      .size;

    const totalBillAmount = scans.reduce(
      (sum, scan) => sum + Number(scan.billAmount || 0),
      0,
    );

    const totalDiscountGiven = scans.reduce(
      (sum, scan) => sum + Number(scan.discountAmount || 0),
      0,
    );

    const monthlyTarget = store.monthlyTargetUsers || 150;

    const targetProgress = Math.min(
      100,
      Number(((uniquePatients / monthlyTarget) * 100).toFixed(2)),
    );

    return res.status(200).json({
      success: true,
      stats: {
        monthKey: selectedMonthKey,
        totalScans,
        uniquePatients,
        totalBillAmount,
        totalDiscountGiven,
        monthlyTarget,
        targetProgress,
        targetCompleted: uniquePatients >= monthlyTarget,
      },
    });
  } catch (error) {
    console.error("Get medical scan stats error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch scan stats",
    });
  }
};

// @desc    Delete scan interaction softly
// @route   DELETE /api/medical-scans/:id
// @access  Private - medicalOwner
exports.deleteMedicalScan = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const scan = await MedicalScan.findOne({
      _id: req.params.id,
      owner: ownerId,
      isActive: true,
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan record not found",
      });
    }

    scan.isActive = false;
    await scan.save();

    return res.status(200).json({
      success: true,
      message: "Scan record deleted successfully",
    });
  } catch (error) {
    console.error("Delete medical scan error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete scan record",
    });
  }
};
