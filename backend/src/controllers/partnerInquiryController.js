const PartnerInquiry = require("../models/PartnerInquiry");

exports.createPartnerInquiry = async (req, res) => {
  try {
    const {
      organizationName,
      contactPerson,
      email,
      phone,
      organizationType,
      website,
      city,
      state,
      partnershipInterest,
      message,
    } = req.body;

    if (
      !organizationName ||
      !contactPerson ||
      !email ||
      !phone ||
      !organizationType ||
      !city ||
      !state ||
      !partnershipInterest ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required partnership fields",
      });
    }

    const inquiry = await PartnerInquiry.create({
      organizationName,
      contactPerson,
      email,
      phone,
      organizationType,
      website,
      city,
      state,
      partnershipInterest,
      message,
    });

    return res.status(201).json({
      success: true,
      message:
        "Partnership inquiry submitted successfully. Our team will contact you soon.",
      inquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit partnership inquiry",
    });
  }
};

exports.getPartnerInquiries = async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { organizationName: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { organizationType: { $regex: search, $options: "i" } },
      ];
    }

    const inquiries = await PartnerInquiry.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load partner inquiries",
    });
  }
};

exports.updatePartnerInquiryStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const allowedStatuses = ["new", "contacted", "approved", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry status",
      });
    }

    const inquiry = await PartnerInquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Partner inquiry not found",
      });
    }

    inquiry.status = status;

    if (adminNote !== undefined) {
      inquiry.adminNote = adminNote;
    }

    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: "Partner inquiry status updated",
      inquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update partner inquiry",
    });
  }
};
