const User = require("../models/User");
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Report = require("../models/Report");
const SosRequest = require("../models/SosRequest");

exports.getSuperAdminAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPatients,
      totalDoctorUsers,
      totalHospitalAdminUsers,
      totalMedicalOwnerUsers,
      approvedUsers,
      blockedUsers,
      pendingApprovals,
      totalHospitals,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      acceptedAppointments,
      completedAppointments,
      rejectedAppointments,
      cancelledAppointments,
      totalReports,
      totalSosRequests,
      newSosRequests,
      criticalSosRequests,
      acceptedSosRequests,
      rejectedSosRequests,
      ambulanceDispatchedSosRequests,
      resolvedSosRequests,
      cancelledSosRequests,
      emergencyAvailableHospitals,
      ambulanceAvailableHospitals,
      open24x7Hospitals,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "hospitalAdmin" }),
      User.countDocuments({ role: "medicalOwner" }),
      User.countDocuments({ isApproved: true }),
      User.countDocuments({ isBlocked: true }),
      User.countDocuments({
        role: { $in: ["doctor", "hospitalAdmin", "medicalOwner"] },
        isApproved: false,
      }),

      Hospital.countDocuments(),
      Doctor.countDocuments(),

      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.countDocuments({ status: "accepted" }),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({ status: "rejected" }),
      Appointment.countDocuments({ status: "cancelled" }),

      Report.countDocuments(),

      SosRequest.countDocuments(),
      SosRequest.countDocuments({ status: "new" }),
      SosRequest.countDocuments({
        severity: "Critical",
        status: { $nin: ["resolved", "cancelled"] },
      }),
      SosRequest.countDocuments({ status: "accepted" }),
      SosRequest.countDocuments({ status: "rejected" }),
      SosRequest.countDocuments({ status: "ambulance_dispatched" }),
      SosRequest.countDocuments({ status: "resolved" }),
      SosRequest.countDocuments({ status: "cancelled" }),

      Hospital.countDocuments({ emergencyAvailable: true }),
      Hospital.countDocuments({ ambulanceAvailable: true }),
      Hospital.countDocuments({ open24x7: true }),
    ]);

    const recentUsers = await User.find()
      .select(
        "fullName email phone role isApproved isBlocked createdAt updatedAt",
      )
      .sort({ createdAt: -1 })
      .limit(8);

    const recentSosRequests = await SosRequest.find()
      .populate("user", "fullName email phone role")
      .populate("acceptedByHospital", "name city state contactNumber")
      .sort({ createdAt: -1 })
      .limit(8);

    const recentAppointments = await Appointment.find()
      .populate("patient", "fullName email phone")
      .populate({
        path: "doctor",
        select: "specialization user",
        populate: {
          path: "user",
          select: "fullName email phone",
        },
      })
      .sort({ createdAt: -1 })
      .limit(8);

    const recentReports = await Report.find()
      .populate("patient", "fullName email phone")
      .populate("uploadedBy", "fullName email role")
      .sort({ createdAt: -1 })
      .limit(8);

    const roleAnalytics = [
      {
        name: "Patients",
        value: totalPatients,
      },
      {
        name: "Doctors",
        value: totalDoctorUsers,
      },
      {
        name: "Hospital Admins",
        value: totalHospitalAdminUsers,
      },
      {
        name: "Medical Owners",
        value: totalMedicalOwnerUsers,
      },
      {
        name: "Super Admins",
        value: await User.countDocuments({ role: "superAdmin" }),
      },
    ];

    const appointmentAnalytics = [
      {
        name: "Pending",
        value: pendingAppointments,
      },
      {
        name: "Accepted",
        value: acceptedAppointments,
      },
      {
        name: "Completed",
        value: completedAppointments,
      },
      {
        name: "Rejected",
        value: rejectedAppointments,
      },
      {
        name: "Cancelled",
        value: cancelledAppointments,
      },
    ];

    const sosAnalytics = [
      {
        name: "New",
        value: newSosRequests,
      },
      {
        name: "Critical",
        value: criticalSosRequests,
      },
      {
        name: "Accepted",
        value: acceptedSosRequests,
      },
      {
        name: "Rejected",
        value: rejectedSosRequests,
      },
      {
        name: "Ambulance",
        value: ambulanceDispatchedSosRequests,
      },
      {
        name: "Resolved",
        value: resolvedSosRequests,
      },
    ];

    const hospitalCapabilityAnalytics = [
      {
        name: "Emergency Available",
        value: emergencyAvailableHospitals,
      },
      {
        name: "Ambulance Available",
        value: ambulanceAvailableHospitals,
      },
      {
        name: "Open 24x7",
        value: open24x7Hospitals,
      },
    ];

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          totalUsers,
          totalPatients,
          totalDoctorUsers,
          totalHospitalAdminUsers,
          totalMedicalOwnerUsers,
          approvedUsers,
          blockedUsers,
          pendingApprovals,
        },

        hospitals: {
          totalHospitals,
          emergencyAvailableHospitals,
          ambulanceAvailableHospitals,
          open24x7Hospitals,
        },

        doctors: {
          totalDoctors,
        },

        appointments: {
          totalAppointments,
          pendingAppointments,
          acceptedAppointments,
          completedAppointments,
          rejectedAppointments,
          cancelledAppointments,
        },

        reports: {
          totalReports,
        },

        sos: {
          totalSosRequests,
          newSosRequests,
          criticalSosRequests,
          acceptedSosRequests,
          rejectedSosRequests,
          ambulanceDispatchedSosRequests,
          resolvedSosRequests,
          cancelledSosRequests,
        },

        charts: {
          roleAnalytics,
          appointmentAnalytics,
          sosAnalytics,
          hospitalCapabilityAnalytics,
        },

        recent: {
          recentUsers,
          recentSosRequests,
          recentAppointments,
          recentReports,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
