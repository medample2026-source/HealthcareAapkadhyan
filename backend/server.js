require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const connectDB = require("./src/config/db");

const contactRoutes = require("./src/routes/contactRoutes");
const authRoutes = require("./src/routes/authRoutes");
const superAdminRoutes = require("./src/routes/superAdminRoutes");
const doctorRoutes = require("./src/routes/doctorRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const hospitalRoutes = require("./src/routes/hospitalRoutes");
const patientRoutes = require("./src/routes/patientRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const sosRoutes = require("./src/routes/sosRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const medicalStoreRoutes = require("./src/routes/medicalStoreRoutes");
const medicineRoutes = require("./src/routes/medicineRoutes");
const medicalScanRoutes = require("./src/routes/medicalScanRoutes");
const superAdminMedicalRoutes = require("./src/routes/superAdminMedicalRoutes");
const medicineRequestRoutes = require("./src/routes/medicineRequestRoutes");
const medicalOwnerDashboardRoutes = require("./src/routes/medicalOwnerDashboardRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const partnerInquiryRoutes = require("./src/routes/partnerInquiryRoutes");

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// ==========================
// DATABASE CONNECTION
// ==========================
connectDB();

// ==========================
// SECURITY MIDDLEWARES
// ==========================
app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// ==========================
// RATE LIMITING
// ==========================
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
      message: "Too many requests. Please try again later.",
    },
  }),
);

// ==========================
// ROUTES
// ==========================
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/medical-stores", medicalStoreRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/medical-scans", medicalScanRoutes);
app.use("/api/super-admin-medical", superAdminMedicalRoutes);
app.use("/api/medicine-requests", medicineRequestRoutes);
app.use("/api/medical-owner-dashboard", medicalOwnerDashboardRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/partner-inquiries", partnerInquiryRoutes);

// ==========================
// HEALTH CHECK
// ==========================
app.get("/", (req, res) => {
  res.send("Healthcare backend API running successfully");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Healthcare backend API running successfully",
  });
});

// ==========================
// 404 HANDLER
// ==========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
