import { Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Partners from "../pages/Partners";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail";

import PatientDashboard from "../pages/PatientDashboard";
import DoctorDashboard from "../pages/DoctorDashboard";
import HospitalDashboard from "../pages/HospitalDashboard";
import MedicalDashboard from "../pages/MedicalDashboard";
import SuperAdminDashboard from "../pages/SuperAdminDashboard";

import NotFound from "../pages/NotFound";
import RoleBasedRoute from "./RoleBasedRoute";

import ApprovedUsers from "../pages/ApprovedUsers";

import DoctorProfile from "../pages/doctor/DoctorProfile";
import Doctors from "../pages/Doctors";
import DoctorDetails from "../pages/DoctorDetails";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";
import DoctorReports from "../pages/doctor/DoctorReports";

import PatientAppointments from "../pages/patient/PatientAppointments";
import PatientProfile from "../pages/patient/PatientProfile";
import PatientReports from "../pages/patient/PatientReports";

import HospitalProfile from "../pages/hospital/HospitalProfile";
import HospitalAppointments from "../pages/hospital/HospitalAppointments";
import HospitalReports from "../pages/hospital/HospitalReports";
import Hospitals from "../pages/Hospitals";
import HospitalDetails from "../pages/HospitalDetails";

import SuperAdminReports from "../pages/superAdmin/SuperAdminReports";
import SuperAdminUsers from "../pages/superAdmin/SuperAdminUsers";

import EmergencyProfile from "../pages/EmergencyProfile";
import PatientQrProfile from "../pages/PatientQrProfile";
import EmergencySOS from "../pages/emergency/EmergencySOS";
import SosRequests from "../pages/sos/SosRequests";

import MedicalProfile from "../pages/MedicalProfile";
import MedicalInventory from "../pages/medical/MedicalInventory";
import MedicineSearch from "../pages/medicines/MedicineSearch";
import ScanDiscount from "../pages/medical/ScanDiscount";
import ScanHistory from "../pages/medical/ScanHistory";
import MedicalStoreAnalytics from "../pages/superAdmin/MedicalStoreAnalytics";
import MedicineRequests from "../pages/medical/MedicineRequests";
import StorePreview from "../pages/medical/StorePreview";
import PatientMedicineRequests from "../pages/patient/PatientMedicineRequests";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />

        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/hospitals/:id" element={<HospitalDetails />} />

        <Route path="/emergency/:patientId" element={<EmergencyProfile />} />
        <Route path="/patient-card/:patientId" element={<PatientQrProfile />} />
        <Route path="/emergency-sos" element={<EmergencySOS mode="public" />} />

        <Route path="/medicines" element={<MedicineSearch />} />
      </Route>

      {/* Protected Dashboard Layout */}
      <Route
        element={
          <RoleBasedRoute
            allowedRoles={[
              "patient",
              "doctor",
              "hospitalAdmin",
              "medicalOwner",
              "superAdmin",
            ]}
          >
            <DashboardLayout />
          </RoleBasedRoute>
        }
      >
        {/* Main Dashboards */}
        <Route
          path="/patient-dashboard"
          element={
            <RoleBasedRoute allowedRoles={["patient"]}>
              <PatientDashboard />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/doctor-dashboard"
          element={
            <RoleBasedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/hospital-dashboard"
          element={
            <RoleBasedRoute allowedRoles={["hospitalAdmin"]}>
              <HospitalDashboard />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/medical-dashboard"
          element={
            <RoleBasedRoute allowedRoles={["medicalOwner"]}>
              <MedicalDashboard />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/super-admin-dashboard"
          element={
            <RoleBasedRoute allowedRoles={["superAdmin"]}>
              <SuperAdminDashboard />
            </RoleBasedRoute>
          }
        />

        {/* Super Admin Pages */}
        <Route
          path="/super-admin-dashboard/approved-users"
          element={
            <RoleBasedRoute allowedRoles={["superAdmin"]}>
              <ApprovedUsers />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/super-admin-dashboard/users"
          element={
            <RoleBasedRoute allowedRoles={["superAdmin"]}>
              <SuperAdminUsers />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/super-admin-dashboard/medical-stores"
          element={
            <RoleBasedRoute allowedRoles={["superAdmin"]}>
              <MedicalStoreAnalytics />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/super-admin-dashboard/reports"
          element={
            <RoleBasedRoute allowedRoles={["superAdmin"]}>
              <SuperAdminReports />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/super-admin-dashboard/sos-requests"
          element={
            <RoleBasedRoute allowedRoles={["superAdmin"]}>
              <SosRequests />
            </RoleBasedRoute>
          }
        />

        {/* Patient Pages */}
        <Route
          path="/patient-dashboard/appointments"
          element={
            <RoleBasedRoute allowedRoles={["patient"]}>
              <PatientAppointments />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/patient-dashboard/reports"
          element={
            <RoleBasedRoute allowedRoles={["patient"]}>
              <PatientReports />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/patient-dashboard/medicine-requests"
          element={
            <RoleBasedRoute allowedRoles={["patient"]}>
              <PatientMedicineRequests />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/patient-dashboard/profile"
          element={
            <RoleBasedRoute allowedRoles={["patient"]}>
              <PatientProfile />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/patient-dashboard/emergency-sos"
          element={
            <RoleBasedRoute allowedRoles={["patient"]}>
              <EmergencySOS mode="patient" />
            </RoleBasedRoute>
          }
        />

        {/* Doctor Pages */}
        <Route
          path="/doctor-dashboard/appointments"
          element={
            <RoleBasedRoute allowedRoles={["doctor"]}>
              <DoctorAppointments />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/doctor-dashboard/reports"
          element={
            <RoleBasedRoute allowedRoles={["doctor"]}>
              <DoctorReports />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/doctor-dashboard/profile"
          element={
            <RoleBasedRoute allowedRoles={["doctor"]}>
              <DoctorProfile />
            </RoleBasedRoute>
          }
        />

        {/* Hospital Admin Pages */}
        <Route
          path="/hospital-dashboard/appointments"
          element={
            <RoleBasedRoute allowedRoles={["hospitalAdmin"]}>
              <HospitalAppointments />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/hospital-dashboard/reports"
          element={
            <RoleBasedRoute allowedRoles={["hospitalAdmin"]}>
              <HospitalReports />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/hospital-dashboard/profile"
          element={
            <RoleBasedRoute allowedRoles={["hospitalAdmin"]}>
              <HospitalProfile />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/hospital-dashboard/sos-requests"
          element={
            <RoleBasedRoute allowedRoles={["hospitalAdmin"]}>
              <SosRequests />
            </RoleBasedRoute>
          }
        />

        {/* Medical Owner Pages */}
        <Route
          path="/medical-dashboard/profile"
          element={
            <RoleBasedRoute allowedRoles={["medicalOwner"]}>
              <MedicalProfile />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/medical-dashboard/inventory"
          element={
            <RoleBasedRoute allowedRoles={["medicalOwner"]}>
              <MedicalInventory />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/medical-dashboard/medicine-requests"
          element={
            <RoleBasedRoute allowedRoles={["medicalOwner"]}>
              <MedicineRequests />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/medical-dashboard/scan-discount"
          element={
            <RoleBasedRoute allowedRoles={["medicalOwner"]}>
              <ScanDiscount />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/medical-dashboard/scan-history"
          element={
            <RoleBasedRoute allowedRoles={["medicalOwner"]}>
              <ScanHistory />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/medical-dashboard/store-preview"
          element={
            <RoleBasedRoute allowedRoles={["medicalOwner"]}>
              <StorePreview />
            </RoleBasedRoute>
          }
        />
      </Route>

      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
