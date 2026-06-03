const SosRequest = require("../models/SosRequest");
const Hospital = require("../models/Hospital");

const generateMapsLinks = ({ latitude, longitude, manualAddress }) => {
  const hasCoordinates = latitude && longitude;

  const locationQuery = hasCoordinates
    ? `${latitude},${longitude}`
    : encodeURIComponent(manualAddress || "");

  const mapsLocationUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : manualAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          manualAddress,
        )}`
      : "";

  const hospitals = locationQuery
    ? `https://www.google.com/maps/search/hospitals+near+${locationQuery}`
    : "";

  const clinics = locationQuery
    ? `https://www.google.com/maps/search/clinics+near+${locationQuery}`
    : "";

  const pharmacies = locationQuery
    ? `https://www.google.com/maps/search/pharmacies+near+${locationQuery}`
    : "";

  return {
    mapsLocationUrl,
    nearestSearchLinks: {
      hospitals,
      clinics,
      pharmacies,
    },
  };
};

const generateEmergencyMessage = ({
  fullName,
  phone,
  incidentType,
  severity,
  description,
  mapsLocationUrl,
  manualAddress,
}) => {
  return `EMERGENCY SOS!

${fullName ? `Name: ${fullName}` : "Name: Guest User"}
Phone: ${phone}
Incident: ${incidentType}
Severity: ${severity}

Description:
${description || "No extra description provided."}

Location:
${mapsLocationUrl || manualAddress || "Location not available"}

Please provide urgent medical help.`;
};

exports.createPublicSosRequest = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      incidentType,
      severity,
      description,
      latitude,
      longitude,
      accuracy,
      manualAddress,
      city,
      state,
    } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!incidentType) {
      return res.status(400).json({
        success: false,
        message: "Incident type is required",
      });
    }

    if ((!latitude || !longitude) && !manualAddress && !city) {
      return res.status(400).json({
        success: false,
        message: "Location, city, or manual address is required",
      });
    }

    const { mapsLocationUrl, nearestSearchLinks } = generateMapsLinks({
      latitude,
      longitude,
      manualAddress: manualAddress || city,
    });

    const emergencyMessage = generateEmergencyMessage({
      fullName,
      phone,
      incidentType,
      severity: severity || "Critical",
      description,
      mapsLocationUrl,
      manualAddress: manualAddress || `${city || ""} ${state || ""}`,
    });

    const sosRequest = await SosRequest.create({
      requesterType: "guest",
      fullName,
      phone,
      incidentType,
      severity: severity || "Critical",
      description,
      location: {
        latitude: latitude || null,
        longitude: longitude || null,
        accuracy: accuracy || null,
      },
      manualAddress,
      city,
      state,
      mapsLocationUrl,
      nearestSearchLinks,
      emergencyMessage,
    });

    res.status(201).json({
      success: true,
      message: "Emergency SOS request created successfully",
      sosRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createPatientSosRequest = async (req, res) => {
  try {
    const {
      phone,
      incidentType,
      severity,
      description,
      latitude,
      longitude,
      accuracy,
      manualAddress,
      city,
      state,
    } = req.body;

    if (!incidentType) {
      return res.status(400).json({
        success: false,
        message: "Incident type is required",
      });
    }

    if ((!latitude || !longitude) && !manualAddress && !city) {
      return res.status(400).json({
        success: false,
        message: "Location, city, or manual address is required",
      });
    }

    const finalPhone = phone || req.user.phone;

    if (!finalPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const { mapsLocationUrl, nearestSearchLinks } = generateMapsLinks({
      latitude,
      longitude,
      manualAddress: manualAddress || city,
    });

    const emergencyMessage = generateEmergencyMessage({
      fullName: req.user.fullName,
      phone: finalPhone,
      incidentType,
      severity: severity || "Critical",
      description,
      mapsLocationUrl,
      manualAddress: manualAddress || `${city || ""} ${state || ""}`,
    });

    const sosRequest = await SosRequest.create({
      user: req.user._id,
      requesterType: "patient",
      fullName: req.user.fullName,
      phone: finalPhone,
      incidentType,
      severity: severity || "Critical",
      description,
      location: {
        latitude: latitude || null,
        longitude: longitude || null,
        accuracy: accuracy || null,
      },
      manualAddress,
      city,
      state,
      mapsLocationUrl,
      nearestSearchLinks,
      emergencyMessage,
    });

    res.status(201).json({
      success: true,
      message: "Patient emergency SOS request created successfully",
      sosRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMySosRequests = async (req, res) => {
  try {
    const sosRequests = await SosRequest.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: sosRequests.length,
      sosRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllSosRequests = async (req, res) => {
  try {
    const { status, severity, requesterType } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (requesterType) filter.requesterType = requesterType;

    if (req.user.role === "hospitalAdmin") {
      const hospital = await Hospital.findOne({ admin: req.user._id });

      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: "Hospital profile not found for this admin",
        });
      }

      const cityRegex = hospital.city ? new RegExp(hospital.city, "i") : null;

      const stateRegex = hospital.state
        ? new RegExp(hospital.state, "i")
        : null;

      const locationFilters = [];

      if (cityRegex) {
        locationFilters.push({ city: cityRegex });
        locationFilters.push({ manualAddress: cityRegex });
      }

      if (stateRegex) {
        locationFilters.push({ state: stateRegex });
        locationFilters.push({ manualAddress: stateRegex });
      }

      if (locationFilters.length > 0) {
        filter.$or = locationFilters;
      } else {
        filter._id = null;
      }
    }

    const sosRequests = await SosRequest.find(filter)
      .populate("user", "fullName email phone role")
      .populate("handledBy", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sosRequests.length,
      sosRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateSosStatus = async (req, res) => {
  try {
    const { status, statusNote } = req.body;

    const allowedStatuses = [
      "new",
      "viewed",
      "accepted",
      "rejected",
      "contacted",
      "ambulance_dispatched",
      "resolved",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS status",
      });
    }

    const sosRequest = await SosRequest.findById(req.params.id);

    if (!sosRequest) {
      return res.status(404).json({
        success: false,
        message: "SOS request not found",
      });
    }

    sosRequest.status = status;
    sosRequest.statusNote = statusNote || sosRequest.statusNote;
    sosRequest.handledBy = req.user._id;

    await sosRequest.save();

    res.status(200).json({
      success: true,
      message: "SOS status updated successfully",
      sosRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
