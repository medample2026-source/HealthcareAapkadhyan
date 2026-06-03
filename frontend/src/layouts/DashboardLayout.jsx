import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Users,
  Siren,
  AlertTriangle,
  Store,
  PackageSearch,
  QrCode,
  History,
  Inbox,
  Pill,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { BRAND_LOGO_URL, BRAND_NAME } from "../constants/brand";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [pendingMedicineRequests, setPendingMedicineRequests] = useState(0);

  const [sosAlert, setSosAlert] = useState({
    newCount: 0,
    criticalCount: 0,
    latest: null,
  });

  const dashboardPath =
    user?.role === "doctor"
      ? "/doctor-dashboard"
      : user?.role === "hospitalAdmin"
        ? "/hospital-dashboard"
        : user?.role === "superAdmin"
          ? "/super-admin-dashboard"
          : user?.role === "medicalOwner"
            ? "/medical-dashboard"
            : "/patient-dashboard";

  const canMonitorSos =
    user?.role === "superAdmin" || user?.role === "hospitalAdmin";

  const normalLinks = [
    {
      name: "Dashboard",
      path: dashboardPath,
      icon: LayoutDashboard,
    },
    {
      name: "Appointments",
      path: `${dashboardPath}/appointments`,
      icon: CalendarCheck,
    },
    {
      name: "Reports",
      path: `${dashboardPath}/reports`,
      icon: FileText,
    },
    {
      name: "Profile",
      path: `${dashboardPath}/profile`,
      icon: User,
    },
  ];

  const patientExtraLinks =
    user?.role === "patient"
      ? [
          {
            name: "Find Medicines",
            path: "/medicines",
            icon: Search,
          },
          {
            name: "Medicine Requests",
            path: "/patient-dashboard/medicine-requests",
            icon: Pill,
          },
          {
            name: "Emergency SOS",
            path: "/patient-dashboard/emergency-sos",
            icon: Siren,
          },
        ]
      : [];

  const hospitalExtraLinks =
    user?.role === "hospitalAdmin"
      ? [
          {
            name: "SOS Requests",
            path: "/hospital-dashboard/sos-requests",
            icon: Siren,
          },
        ]
      : [];

  const medicalOwnerLinks = [
    {
      name: "Dashboard",
      path: "/medical-dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Store Profile",
      path: "/medical-dashboard/profile",
      icon: Store,
    },
    {
      name: "Store Preview",
      path: "/medical-dashboard/store-preview",
      icon: Store,
    },
    {
      name: "Inventory",
      path: "/medical-dashboard/inventory",
      icon: PackageSearch,
    },
    {
      name: "Medicine Requests",
      path: "/medical-dashboard/medicine-requests",
      icon: Inbox,
      badge: pendingMedicineRequests,
    },
    {
      name: "QR Discount",
      path: "/medical-dashboard/scan-discount",
      icon: QrCode,
    },
    {
      name: "Scan History",
      path: "/medical-dashboard/scan-history",
      icon: History,
    },
  ];

  const superAdminLinks = [
    {
      name: "Dashboard",
      path: "/super-admin-dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Pending Applications",
      path: "/super-admin-dashboard",
      icon: ShieldCheck,
    },
    {
      name: "All Users",
      path: "/super-admin-dashboard/users",
      icon: Users,
    },
    {
      name: "Approved Users",
      path: "/super-admin-dashboard/approved-users",
      icon: User,
    },
    {
      name: "Medical Stores",
      path: "/super-admin-dashboard/medical-stores",
      icon: Store,
    },
    {
      name: "Reports",
      path: "/super-admin-dashboard/reports",
      icon: FileText,
    },
    {
      name: "SOS Requests",
      path: "/super-admin-dashboard/sos-requests",
      icon: Siren,
    },
  ];

  const links =
    user?.role === "superAdmin"
      ? superAdminLinks
      : user?.role === "medicalOwner"
        ? medicalOwnerLinks
        : [...normalLinks, ...patientExtraLinks, ...hospitalExtraLinks];

  const fetchPendingMedicineRequests = async () => {
    try {
      if (user?.role !== "medicalOwner") return;

      const res = await API.get("/medicine-requests/my-store/summary");

      setPendingMedicineRequests(res.data.summary?.pending || 0);
    } catch (error) {
      setPendingMedicineRequests(0);
      console.log("Pending medicine request count fetch failed");
    }
  };

  const fetchSosAlert = async () => {
    try {
      if (!canMonitorSos) return;

      const res = await API.get("/sos/all");

      const requests = res.data.sosRequests || [];

      const newRequests = requests.filter((item) => item.status === "new");

      const criticalRequests = requests.filter(
        (item) => item.severity === "Critical" && item.status !== "resolved",
      );

      setSosAlert({
        newCount: newRequests.length,
        criticalCount: criticalRequests.length,
        latest: newRequests[0] || criticalRequests[0] || null,
      });
    } catch (error) {
      console.log("SOS alert fetch failed");
    }
  };

  useEffect(() => {
    fetchPendingMedicineRequests();

    if (user?.role !== "medicalOwner") return;

    const interval = setInterval(() => {
      fetchPendingMedicineRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.role]);

  useEffect(() => {
    fetchSosAlert();

    if (!canMonitorSos) return;

    const interval = setInterval(() => {
      fetchSosAlert();
    }, 30000);

    return () => clearInterval(interval);
  }, [canMonitorSos, user?.role]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/60 bg-white/80 px-4 py-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <img
            src={BRAND_LOGO_URL}
            alt={`${BRAND_NAME} Logo`}
            className="h-10 w-10 object-contain"
          />
          {BRAND_NAME}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-xl p-2 text-slate-700 hover:bg-cyan-50"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 border-r border-white/60 bg-white/90 p-5 shadow-xl backdrop-blur-xl transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <img
              src={BRAND_LOGO_URL}
              alt={`${BRAND_NAME} Logo`}
              className="h-14 w-14 object-contain"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">{BRAND_NAME}</h2>
            <p className="text-xs font-medium capitalize text-slate-500">
              {user?.role} panel
            </p>
          </div>
        </div>

        {canMonitorSos && sosAlert.newCount > 0 && (
          <div className="mb-5 rounded-3xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white">
                <AlertTriangle size={18} />
              </div>

              <div>
                <h3 className="text-sm font-black text-red-700">
                  {sosAlert.newCount} New SOS Alert
                </h3>
                <p className="mt-1 text-xs leading-5 text-red-600">
                  Critical emergency requests need attention.
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-2">
          {links.map((item) => {
            const Icon = item.icon;

            const showSosBadge =
              item.name === "SOS Requests" && sosAlert.newCount > 0;

            const showNormalBadge = item.badge && Number(item.badge) > 0;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={
                  item.name === "Dashboard" ||
                  item.name === "Pending Applications"
                }
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-600 to-emerald-500 text-white shadow-lg shadow-cyan-100"
                      : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-700"
                  }`
                }
              >
                <Icon size={19} />

                <span className="flex-1">{item.name}</span>

                {showNormalBadge && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-black text-white shadow-lg shadow-red-200">
                    {Number(item.badge) > 99 ? "99+" : item.badge}
                  </span>
                )}

                {showSosBadge && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-black text-white shadow-lg shadow-red-200">
                    {sosAlert.newCount > 99 ? "99+" : sosAlert.newCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="lg:pl-72">
        <header className="hidden border-b border-white/60 bg-white/70 px-8 py-5 backdrop-blur-xl lg:block">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome, {user?.fullName || "User"}
              </h1>

              <p className="text-sm text-slate-500">
                {user?.role === "superAdmin"
                  ? "Manage platform approvals, users, reports, emergency SOS, and system control."
                  : user?.role === "hospitalAdmin"
                    ? "Manage hospital profile, appointments, reports, and emergency SOS requests."
                    : user?.role === "patient"
                      ? "Manage your healthcare activities, medicine requests, and emergency support securely."
                      : user?.role === "medicalOwner"
                        ? "Manage medicines, inventory, QR discounts, and monthly customer interactions."
                        : "Manage your healthcare activities securely."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {canMonitorSos && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      user?.role === "superAdmin"
                        ? "/super-admin-dashboard/sos-requests"
                        : "/hospital-dashboard/sos-requests",
                    )
                  }
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-2 text-sm font-black shadow-sm transition hover:scale-105 ${
                    sosAlert.newCount > 0
                      ? "border-red-100 bg-red-50 text-red-700"
                      : "border-emerald-100 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <Siren size={18} />

                  <span>
                    {sosAlert.newCount > 0
                      ? `${sosAlert.newCount} New SOS`
                      : "No New SOS"}
                  </span>
                </button>
              )}

              <div className="rounded-2xl border border-cyan-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                {user?.email}
              </div>
            </div>
          </div>

          {canMonitorSos && sosAlert.latest && sosAlert.newCount > 0 && (
            <div className="mt-5 rounded-3xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white">
                    <AlertTriangle />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-red-700">
                      Latest Emergency: {sosAlert.latest.incidentType}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {sosAlert.latest.fullName || "Guest User"} •{" "}
                      {sosAlert.latest.phone} •{" "}
                      {formatTime(sosAlert.latest.createdAt)}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-red-600">
                      Critical active cases: {sosAlert.criticalCount}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      user?.role === "superAdmin"
                        ? "/super-admin-dashboard/sos-requests"
                        : "/hospital-dashboard/sos-requests",
                    )
                  }
                  className="rounded-full bg-red-600 px-5 py-2 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
                >
                  Open SOS Center
                </button>
              </div>
            </div>
          )}
        </header>

        <section className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
