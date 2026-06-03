const Medicine = require("../models/Medicine");
const MedicalStore = require("../models/MedicalStore");

const getOwnerId = (req) => {
  return req.user?._id || req.user?.id;
};

const getOwnerStore = async (ownerId) => {
  return await MedicalStore.findOne({
    owner: ownerId,
    isActive: true,
  });
};

// @desc    Add medicine
// @route   POST /api/medicines
// @access  Private - medicalOwner
exports.addMedicine = async (req, res) => {
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
        message: "Please complete your medical store profile first",
      });
    }

    if (!store.isProfileComplete) {
      return res.status(400).json({
        success: false,
        message: "Please complete your medical store profile first",
      });
    }

    const {
      medicineName,
      genericName,
      brandName,
      category,
      strength,
      quantity,
      price,
      expiryDate,
      prescriptionRequired,
      isAvailable,
      description,
    } = req.body;

    if (!medicineName) {
      return res.status(400).json({
        success: false,
        message: "Medicine name is required",
      });
    }

    const medicine = await Medicine.create({
      medicalStore: store._id,
      owner: ownerId,
      medicineName: medicineName.trim(),
      genericName: genericName?.trim() || "",
      brandName: brandName?.trim() || "",
      category: category || "Tablet",
      strength: strength?.trim() || "",
      quantity:
        quantity === "" || quantity === undefined ? 0 : Number(quantity),
      price: price === "" || price === undefined ? 0 : Number(price),
      expiryDate: expiryDate || null,
      prescriptionRequired: Boolean(prescriptionRequired),
      isAvailable: isAvailable === undefined ? true : Boolean(isAvailable),
      description: description?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      medicine,
    });
  } catch (error) {
    console.error("Add medicine error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add medicine",
    });
  }
};

// @desc    Get logged-in medical owner's medicines
// @route   GET /api/medicines/my
// @access  Private - medicalOwner
exports.getMyMedicines = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    const { search, category, availability } = req.query;

    const query = {
      owner: ownerId,
      isActive: true,
    };

    if (search) {
      query.$or = [
        { medicineName: { $regex: search, $options: "i" } },
        { genericName: { $regex: search, $options: "i" } },
        { brandName: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (availability === "available") {
      query.isAvailable = true;
      query.quantity = { $gt: 0 };
    }

    if (availability === "unavailable") {
      query.$or = [{ isAvailable: false }, { quantity: 0 }];
    }

    const medicines = await Medicine.find(query)
      .populate("medicalStore", "storeName city state phone address")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    console.error("Get my medicines error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch medicines",
    });
  }
};

// @desc    Update medicine
// @route   PATCH /api/medicines/:id
// @access  Private - medicalOwner
exports.updateMedicine = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    const medicine = await Medicine.findOne({
      _id: req.params.id,
      owner: ownerId,
      isActive: true,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    const allowedFields = [
      "medicineName",
      "genericName",
      "brandName",
      "category",
      "strength",
      "quantity",
      "price",
      "expiryDate",
      "prescriptionRequired",
      "isAvailable",
      "description",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] === "string") {
          medicine[field] = req.body[field].trim();
        } else {
          medicine[field] = req.body[field];
        }
      }
    });

    if (req.body.quantity !== undefined && req.body.quantity !== "") {
      medicine.quantity = Number(req.body.quantity);
    }

    if (req.body.price !== undefined && req.body.price !== "") {
      medicine.price = Number(req.body.price);
    }

    if (Number.isNaN(medicine.quantity) || medicine.quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid positive number",
      });
    }

    if (Number.isNaN(medicine.price) || medicine.price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    await medicine.save();

    return res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      medicine,
    });
  } catch (error) {
    console.error("Update medicine error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update medicine",
    });
  }
};

// @desc    Delete medicine softly
// @route   DELETE /api/medicines/:id
// @access  Private - medicalOwner
exports.deleteMedicine = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    const medicine = await Medicine.findOne({
      _id: req.params.id,
      owner: ownerId,
      isActive: true,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    medicine.isActive = false;
    await medicine.save();

    return res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
    });
  } catch (error) {
    console.error("Delete medicine error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete medicine",
    });
  }
};

// @desc    Public medicine search
// @route   GET /api/medicines/search
// @access  Public
exports.searchMedicines = async (req, res) => {
  try {
    const { q, city, category } = req.query;

    const query = {
      isActive: true,
      isAvailable: true,
      quantity: { $gt: 0 },
    };

    if (q) {
      query.$or = [
        { medicineName: { $regex: q, $options: "i" } },
        { genericName: { $regex: q, $options: "i" } },
        { brandName: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    let medicines = await Medicine.find(query)
      .populate({
        path: "medicalStore",
        select:
          "storeName storeType phone address city state pincode latitude longitude open24x7 homeDeliveryAvailable discountAvailable discountPercentage isProfileComplete isActive",
      })
      .sort({ updatedAt: -1 });

    medicines = medicines.filter((medicine) => {
      if (!medicine.medicalStore) return false;
      if (!medicine.medicalStore.isActive) return false;
      if (!medicine.medicalStore.isProfileComplete) return false;

      if (city) {
        return medicine.medicalStore.city
          ?.toLowerCase()
          .includes(city.toLowerCase());
      }

      return true;
    });

    return res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    console.error("Search medicines error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to search medicines",
    });
  }
};
