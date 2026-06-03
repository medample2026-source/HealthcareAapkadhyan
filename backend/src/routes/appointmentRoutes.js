const express = require("express");

const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getHospitalAppointments,
  updateAppointmentStatus,
  cancelMyAppointment,
} = require("../controllers/appointmentController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/book", protect, authorizeRoles("patient"), bookAppointment);

router.get(
  "/my-appointments",
  protect,
  authorizeRoles("patient"),
  getMyAppointments,
);

router.patch(
  "/cancel/:appointmentId",
  protect,
  authorizeRoles("patient"),
  cancelMyAppointment,
);

router.get("/doctor", protect, authorizeRoles("doctor"), getDoctorAppointments);

router.get(
  "/hospital",
  protect,
  authorizeRoles("hospitalAdmin"),
  getHospitalAppointments,
);

router.patch(
  "/doctor/status/:appointmentId",
  protect,
  authorizeRoles("doctor"),
  updateAppointmentStatus,
);

module.exports = router;
