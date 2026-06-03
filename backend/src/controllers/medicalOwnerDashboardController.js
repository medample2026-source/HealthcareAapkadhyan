const MedicalStore = require("../models/MedicalStore");
const Medicine = require("../models/Medicine");
const MedicineRequest = require("../models/MedicineRequest");
const MedicalScan = require("../models/MedicalScan");

const getOwnerId = (req) => {
  return req.user?._id || req.user?.id;
};

const getCurrentMonthKey = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

exports.getMedicalOwnerDashboardStats = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const monthKey = getCurrentMonthKey();

    const store = await MedicalStore.findOne({
      owner: ownerId,
    });

    if (!store) {
      return res.status(200).json({
        success: true,
        hasStoreProfile: false,
        message: "Medical store profile not created yet",
        stats: {
          inventoryCount: 0,
          availableMedicines: 0,
          outOfStockMedicines: 0,
          pendingRequests: 0,
          acceptedRequests: 0,
          completedRequests: 0,
          monthlyScans: 0,
          uniquePatients: 0,
          totalBillAmount: 0,
          totalDiscountGiven: 0,
          monthlyTarget: 150,
          targetProgress: 0,
          targetCompleted: false,
        },
        store: null,
        recentRequests: [],
        recentScans: [],
      });
    }

    const medicines = await Medicine.find({
      owner: ownerId,
      isActive: true,
    });

    const medicineRequests = await MedicineRequest.find({
      storeOwner: ownerId,
      isActive: true,
    });

    const monthlyScans = await MedicalScan.find({
      owner: ownerId,
      medicalStore: store._id,
      monthKey,
      isActive: true,
    });

    const recentRequests = await MedicineRequest.find({
      storeOwner: ownerId,
      isActive: true,
    })
      .populate(
        "medicine",
        "medicineName brandName genericName category strength price quantity",
      )
      .sort({ createdAt: -1 })
      .limit(5);

    const recentScans = await MedicalScan.find({
      owner: ownerId,
      medicalStore: store._id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const inventoryCount = medicines.length;

    const availableMedicines = medicines.filter(
      (medicine) => medicine.isAvailable && medicine.quantity > 0,
    ).length;

    const outOfStockMedicines = medicines.filter(
      (medicine) => !medicine.isAvailable || medicine.quantity <= 0,
    ).length;

    const pendingRequests = medicineRequests.filter(
      (request) => request.status === "pending",
    ).length;

    const acceptedRequests = medicineRequests.filter(
      (request) => request.status === "accepted",
    ).length;

    const completedRequests = medicineRequests.filter(
      (request) => request.status === "completed",
    ).length;

    const uniquePatients = new Set(
      monthlyScans.map((scan) => scan.patientUniqueId),
    ).size;

    const totalBillAmount = monthlyScans.reduce(
      (sum, scan) => sum + Number(scan.billAmount || 0),
      0,
    );

    const totalDiscountGiven = monthlyScans.reduce(
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
      hasStoreProfile: true,
      monthKey,
      store: {
        _id: store._id,
        storeName: store.storeName,
        storeType: store.storeType,
        city: store.city,
        state: store.state,
        phone: store.phone,
        isProfileComplete: store.isProfileComplete,
        isVerifiedByAdmin: store.isVerifiedByAdmin,
        isActive: store.isActive,
        monthlyTargetUsers: store.monthlyTargetUsers || 150,
      },
      stats: {
        inventoryCount,
        availableMedicines,
        outOfStockMedicines,
        pendingRequests,
        acceptedRequests,
        completedRequests,
        monthlyScans: monthlyScans.length,
        uniquePatients,
        totalBillAmount: Number(totalBillAmount.toFixed(2)),
        totalDiscountGiven: Number(totalDiscountGiven.toFixed(2)),
        monthlyTarget,
        targetProgress,
        targetCompleted: uniquePatients >= monthlyTarget,
      },
      recentRequests,
      recentScans,
    });
  } catch (error) {
    console.error("Medical owner dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard stats",
    });
  }
};
