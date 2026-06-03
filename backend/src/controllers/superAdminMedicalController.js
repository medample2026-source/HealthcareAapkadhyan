const MedicalStore = require("../models/MedicalStore");
const MedicalScan = require("../models/MedicalScan");

const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

// @desc    Get all medical stores with monthly analytics
// @route   GET /api/super-admin-medical/stores?monthKey=2026-06&search=satna
// @access  Private - superAdmin
exports.getMedicalStoreAnalytics = async (req, res) => {
  try {
    const { monthKey, search, status } = req.query;

    const selectedMonthKey = monthKey || getCurrentMonthKey();

    const storeQuery = {};

    if (search) {
      storeQuery.$or = [
        { storeName: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") {
      storeQuery.isActive = true;
    }

    if (status === "inactive") {
      storeQuery.isActive = false;
    }

    if (status === "complete") {
      storeQuery.isProfileComplete = true;
    }

    if (status === "incomplete") {
      storeQuery.isProfileComplete = false;
    }

    const stores = await MedicalStore.find(storeQuery)
      .populate("owner", "fullName email phone role isApproved isBlocked")
      .sort({ createdAt: -1 });

    const storeIds = stores.map((store) => store._id);

    const scans = await MedicalScan.find({
      medicalStore: { $in: storeIds },
      monthKey: selectedMonthKey,
      isActive: true,
    });

    const analyticsMap = {};

    scans.forEach((scan) => {
      const storeId = scan.medicalStore.toString();

      if (!analyticsMap[storeId]) {
        analyticsMap[storeId] = {
          totalScans: 0,
          uniquePatientsSet: new Set(),
          totalBillAmount: 0,
          totalDiscountGiven: 0,
        };
      }

      analyticsMap[storeId].totalScans += 1;
      analyticsMap[storeId].uniquePatientsSet.add(scan.patientUniqueId);
      analyticsMap[storeId].totalBillAmount += Number(scan.billAmount || 0);
      analyticsMap[storeId].totalDiscountGiven += Number(
        scan.discountAmount || 0,
      );
    });

    const medicalStores = stores.map((store) => {
      const storeId = store._id.toString();

      const analytics = analyticsMap[storeId] || {
        totalScans: 0,
        uniquePatientsSet: new Set(),
        totalBillAmount: 0,
        totalDiscountGiven: 0,
      };

      const monthlyTarget = store.monthlyTargetUsers || 150;
      const uniquePatients = analytics.uniquePatientsSet.size;

      const targetProgress = Math.min(
        100,
        Number(((uniquePatients / monthlyTarget) * 100).toFixed(2)),
      );

      return {
        _id: store._id,
        owner: store.owner,
        storeName: store.storeName,
        storeType: store.storeType,
        ownerName: store.ownerName,
        phone: store.phone,
        email: store.email,
        address: store.address,
        city: store.city,
        state: store.state,
        pincode: store.pincode,
        open24x7: store.open24x7,
        homeDeliveryAvailable: store.homeDeliveryAvailable,
        discountAvailable: store.discountAvailable,
        discountPercentage: store.discountPercentage,
        monthlyTargetUsers: monthlyTarget,
        isProfileComplete: store.isProfileComplete,
        isVerifiedByAdmin: store.isVerifiedByAdmin,
        isActive: store.isActive,
        createdAt: store.createdAt,

        analytics: {
          monthKey: selectedMonthKey,
          totalScans: analytics.totalScans,
          uniquePatients,
          totalBillAmount: Number(analytics.totalBillAmount.toFixed(2)),
          totalDiscountGiven: Number(analytics.totalDiscountGiven.toFixed(2)),
          targetProgress,
          targetCompleted: uniquePatients >= monthlyTarget,
        },
      };
    });

    const totalStores = medicalStores.length;
    const activeStores = medicalStores.filter((store) => store.isActive).length;
    const completedProfiles = medicalStores.filter(
      (store) => store.isProfileComplete,
    ).length;
    const targetCompletedStores = medicalStores.filter(
      (store) => store.analytics.targetCompleted,
    ).length;

    const totalScans = medicalStores.reduce(
      (sum, store) => sum + store.analytics.totalScans,
      0,
    );

    const totalUniqueUsers = medicalStores.reduce(
      (sum, store) => sum + store.analytics.uniquePatients,
      0,
    );

    const totalBillAmount = medicalStores.reduce(
      (sum, store) => sum + store.analytics.totalBillAmount,
      0,
    );

    const totalDiscountGiven = medicalStores.reduce(
      (sum, store) => sum + store.analytics.totalDiscountGiven,
      0,
    );

    return res.status(200).json({
      success: true,
      monthKey: selectedMonthKey,
      summary: {
        totalStores,
        activeStores,
        completedProfiles,
        targetCompletedStores,
        totalScans,
        totalUniqueUsers,
        totalBillAmount: Number(totalBillAmount.toFixed(2)),
        totalDiscountGiven: Number(totalDiscountGiven.toFixed(2)),
      },
      medicalStores,
    });
  } catch (error) {
    console.error("Get medical store analytics error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch medical store analytics",
    });
  }
};

// @desc    Get single medical store analytics with scan records
// @route   GET /api/super-admin-medical/stores/:storeId?monthKey=2026-06
// @access  Private - superAdmin
exports.getSingleMedicalStoreAnalytics = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { monthKey } = req.query;

    const selectedMonthKey = monthKey || getCurrentMonthKey();

    const store = await MedicalStore.findById(storeId).populate(
      "owner",
      "fullName email phone role isApproved isBlocked",
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Medical store not found",
      });
    }

    const scans = await MedicalScan.find({
      medicalStore: store._id,
      monthKey: selectedMonthKey,
      isActive: true,
    })
      .populate("patient", "fullName email phone role uniqueId patientUniqueId")
      .sort({ createdAt: -1 });

    const uniquePatients = new Set(scans.map((scan) => scan.patientUniqueId))
      .size;

    const totalScans = scans.length;

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
      store,
      analytics: {
        monthKey: selectedMonthKey,
        totalScans,
        uniquePatients,
        totalBillAmount: Number(totalBillAmount.toFixed(2)),
        totalDiscountGiven: Number(totalDiscountGiven.toFixed(2)),
        monthlyTarget,
        targetProgress,
        targetCompleted: uniquePatients >= monthlyTarget,
      },
      scans,
    });
  } catch (error) {
    console.error("Get single medical store analytics error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch store analytics",
    });
  }
};

// @desc    Toggle medical store active status
// @route   PATCH /api/super-admin-medical/stores/:storeId/status
// @access  Private - superAdmin
exports.toggleMedicalStoreStatus = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await MedicalStore.findById(storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Medical store not found",
      });
    }

    store.isActive = !store.isActive;
    await store.save();

    return res.status(200).json({
      success: true,
      message: store.isActive
        ? "Medical store activated successfully"
        : "Medical store deactivated successfully",
      store,
    });
  } catch (error) {
    console.error("Toggle medical store status error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update store status",
    });
  }
};

// @desc    Verify medical store
// @route   PATCH /api/super-admin-medical/stores/:storeId/verify
// @access  Private - superAdmin
exports.verifyMedicalStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await MedicalStore.findById(storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Medical store not found",
      });
    }

    store.isVerifiedByAdmin = true;
    await store.save();

    return res.status(200).json({
      success: true,
      message: "Medical store verified successfully",
      store,
    });
  } catch (error) {
    console.error("Verify medical store error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify medical store",
    });
  }
};
