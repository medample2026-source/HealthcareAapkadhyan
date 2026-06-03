const MedicineRequest = require("../models/MedicineRequest");
const Medicine = require("../models/Medicine");
const MedicalStore = require("../models/MedicalStore");

const getUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

const getPatientId = (req) => {
  if (req.user?.role !== "patient") return null;

  return getUserId(req);
};

// @desc    Create medicine request from public/patient side
// @route   POST /api/medicine-requests
// @access  Public / Patient optional
exports.getMyPatientMedicineRequests = async (req, res) => {
  try {
    const patientId = getUserId(req);

    if (!patientId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const userPhone = req.user?.phone || "";
    const userEmail = req.user?.email || "";

    const query = {
      isActive: true,
      $or: [{ patient: patientId }],
    };

    if (userPhone) {
      query.$or.push({ patientPhone: userPhone });
    }

    if (userEmail) {
      query.$or.push({ patientEmail: userEmail.toLowerCase() });
    }

    const requests = await MedicineRequest.find(query)
      .populate(
        "medicine",
        "medicineName brandName genericName category strength price quantity isAvailable",
      )
      .populate(
        "medicalStore",
        "storeName storeType phone email address city state pincode open24x7 homeDeliveryAvailable discountAvailable discountPercentage",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get patient medicine requests error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch your medicine requests",
    });
  }
};
exports.createMedicineRequest = async (req, res) => {
  try {
    const {
      medicineId,
      patientName,
      patientPhone,
      patientEmail,
      requestedQuantity,
      message,
    } = req.body;

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    if (!patientName || !patientPhone) {
      return res.status(400).json({
        success: false,
        message: "Patient name and phone are required",
      });
    }

    const medicine = await Medicine.findOne({
      _id: medicineId,
      isActive: true,
    }).populate("medicalStore");

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    if (!medicine.medicalStore || !medicine.medicalStore.isActive) {
      return res.status(400).json({
        success: false,
        message: "Medical store is currently not active",
      });
    }

    const request = await MedicineRequest.create({
      medicine: medicine._id,
      medicalStore: medicine.medicalStore._id,
      storeOwner: medicine.owner,
      patient: getPatientId(req),
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail?.trim()?.toLowerCase() || "",
      medicineName: medicine.medicineName,
      requestedQuantity:
        requestedQuantity === "" || requestedQuantity === undefined
          ? 1
          : Number(requestedQuantity),
      message: message?.trim() || "",
    });

    const populatedRequest = await MedicineRequest.findById(request._id)
      .populate(
        "medicine",
        "medicineName brandName genericName category strength price quantity",
      )
      .populate(
        "medicalStore",
        "storeName storeType phone address city state pincode",
      );

    return res.status(201).json({
      success: true,
      message: "Medicine request sent successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error("Create medicine request error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send medicine request",
    });
  }
};

// @desc    Get requests for logged-in medical owner
// @route   GET /api/medicine-requests/my-store
// @access  Private - medicalOwner
exports.getMyStoreMedicineRequests = async (req, res) => {
  try {
    const ownerId = getUserId(req);

    const { status, search } = req.query;

    const query = {
      storeOwner: ownerId,
      isActive: true,
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { patientPhone: { $regex: search, $options: "i" } },
        { medicineName: { $regex: search, $options: "i" } },
      ];
    }

    const requests = await MedicineRequest.find(query)
      .populate(
        "medicine",
        "medicineName brandName genericName category strength price quantity isAvailable",
      )
      .populate(
        "medicalStore",
        "storeName storeType phone address city state pincode",
      )
      .populate("patient", "fullName email phone role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get my store medicine requests error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch medicine requests",
    });
  }
};

// @desc    Update request status by medical owner
// @route   PATCH /api/medicine-requests/:id/status
// @access  Private - medicalOwner
exports.updateMedicineRequestStatus = async (req, res) => {
  try {
    const ownerId = getUserId(req);

    const { status, ownerNote } = req.body;

    const allowedStatuses = ["accepted", "rejected", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status",
      });
    }

    const request = await MedicineRequest.findOne({
      _id: req.params.id,
      storeOwner: ownerId,
      isActive: true,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Medicine request not found",
      });
    }

    request.status = status;
    request.ownerNote = ownerNote?.trim() || request.ownerNote || "";

    if (status === "accepted") {
      request.acceptedAt = new Date();
    }

    if (status === "rejected") {
      request.rejectedAt = new Date();
    }

    if (status === "completed") {
      request.completedAt = new Date();
    }

    await request.save();

    const updatedRequest = await MedicineRequest.findById(request._id)
      .populate(
        "medicine",
        "medicineName brandName genericName category strength price quantity isAvailable",
      )
      .populate(
        "medicalStore",
        "storeName storeType phone address city state pincode",
      )
      .populate("patient", "fullName email phone role");

    return res.status(200).json({
      success: true,
      message: `Request marked as ${status}`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Update medicine request status error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update request status",
    });
  }
};

// @desc    Get request summary for medical owner
// @route   GET /api/medicine-requests/my-store/summary
// @access  Private - medicalOwner

exports.getMyStoreRequestSummary = async (req, res) => {
  try {
    const ownerId = getUserId(req);

    const requests = await MedicineRequest.find({
      storeOwner: ownerId,
      isActive: true,
    });

    const summary = {
      total: requests.length,
      pending: requests.filter((item) => item.status === "pending").length,
      accepted: requests.filter((item) => item.status === "accepted").length,
      rejected: requests.filter((item) => item.status === "rejected").length,
      completed: requests.filter((item) => item.status === "completed").length,
      cancelled: requests.filter((item) => item.status === "cancelled").length,
    };

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Get medicine request summary error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch request summary",
    });
  }
};
