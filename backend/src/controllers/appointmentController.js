const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

exports.bookAppointment = async (req, res) => {
  try {
    const patientId = req.user._id;

    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can book appointments",
      });
    }

    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      consultationMode,
      reason,
    } = req.body;

    const doctor = await Doctor.findById(doctorId).populate(
      "user",
      "fullName email isApproved isBlocked",
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctor.user.isApproved || doctor.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "This doctor is not available for booking",
      });
    }

    if (!doctor.consultationModes.includes(consultationMode)) {
      return res.status(400).json({
        success: false,
        message: `Doctor does not support ${consultationMode} consultation`,
      });
    }

    const existingAppointment = await Appointment.findOne({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      appointmentTime,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "You already have an appointment request for this slot",
      });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      hospital: doctor.hospital || null,
      appointmentDate,
      appointmentTime,
      consultationMode,
      reason,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "fullName email phone role")
      .populate({
        path: "doctor",
        populate: [
          {
            path: "user",
            select: "fullName email phone role",
          },
          {
            path: "hospital",
            select: "name city state contactNumber",
          },
        ],
      })
      .populate("hospital", "name city state contactNumber");

    res.status(201).json({
      success: true,
      message: "Appointment request sent successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getHospitalAppointments = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ admin: req.user._id });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital profile not found",
      });
    }

    const hospitalDoctors = await Doctor.find({ hospital: hospital._id }).select(
      "_id",
    );

    const doctorIds = hospitalDoctors.map((doctor) => doctor._id);

    const appointments = await Appointment.find({
      $or: [{ hospital: hospital._id }, { doctor: { $in: doctorIds } }],
    })
      .populate("patient", "fullName email phone role")
      .populate("hospital", "name city state contactNumber")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "fullName email phone role",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      hospital,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({
        path: "doctor",
        populate: [
          {
            path: "user",
            select: "fullName email phone",
          },
          {
            path: "hospital",
            select: "name city state contactNumber",
          },
        ],
      })
      .populate("hospital", "name city state contactNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointments = await Appointment.find({ doctor: doctorProfile._id })
      .populate("patient", "fullName email phone role")
      .populate({
        path: "doctor",
        populate: [
          {
            path: "user",
            select: "fullName email phone",
          },
          {
            path: "hospital",
            select: "name city state contactNumber",
          },
        ],
      })
      .populate("hospital", "name city state contactNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, doctorNote, meetingLink } = req.body;

    const allowedStatuses = ["accepted", "rejected", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status",
      });
    }

    const doctorProfile = await Doctor.findOne({ user: req.user._id });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctorProfile._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = status;

    if (doctorNote !== undefined) {
      appointment.doctorNote = doctorNote;
    }

    if (meetingLink !== undefined) {
      appointment.meetingLink = meetingLink;
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "fullName email phone role")
      .populate({
        path: "doctor",
        populate: [
          {
            path: "user",
            select: "fullName email phone",
          },
          {
            path: "hospital",
            select: "name city state contactNumber",
          },
        ],
      })
      .populate("hospital", "name city state contactNumber");

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment: updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.cancelMyAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (!["pending", "accepted"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "Only pending or accepted appointments can be cancelled",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
