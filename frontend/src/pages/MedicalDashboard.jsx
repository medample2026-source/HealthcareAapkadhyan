import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  PackageSearch,
  QrCode,
  History,
  Users,
  Percent,
  MapPin,
  TrendingUp,
  Inbox,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldX,
  ArrowRight,
  Pill,
  BadgeIndianRupee,
  Target,
} from "lucide-react";
import API from "../api/axios";

const MedicalDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/medical-owner-dashboard/stats");

      setDashboardData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load medical dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-600 shadow-lg">
          <Loader2 className="animate-spin text-cyan-600" />
          Loading medical dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
        <div className="flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const store = dashboardData?.store;
  const hasStoreProfile = dashboardData?.hasStoreProfile;

  const cards = [
    {
      title: "Inventory Items",
      value: stats.inventoryCount || 0,
      desc: `${stats.availableMedicines || 0} available, ${
        stats.outOfStockMedicines || 0
      } out of stock`,
      icon: PackageSearch,
      path: "/medical-dashboard/inventory",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests || 0,
      desc: `${stats.acceptedRequests || 0} accepted, ${
        stats.completedRequests || 0
      } completed`,
      icon: Inbox,
      path: "/medical-dashboard/medicine-requests",
    },
    {
      title: "Monthly QR Scans",
      value: stats.monthlyScans || 0,
      desc: `${stats.uniquePatients || 0} unique patients this month`,
      icon: QrCode,
      path: "/medical-dashboard/scan-history",
    },
    {
      title: "Target Progress",
      value: `${stats.targetProgress || 0}%`,
      desc: `${stats.uniquePatients || 0}/${stats.monthlyTarget || 150} unique users`,
      icon: Target,
      path: "/medical-dashboard/scan-history",
    },
  ];

  const actions = [
    {
      title: "Store Profile",
      desc: "Update store details, address, discount, timing and delivery.",
      icon: Store,
      path: "/medical-dashboard/profile",
      badge: store?.isProfileComplete ? "Complete" : "Incomplete",
    },
    {
      title: "Manage Inventory",
      desc: "Add, update, search and manage medicine stock availability.",
      icon: PackageSearch,
      path: "/medical-dashboard/inventory",
      badge: `${stats.inventoryCount || 0} items`,
    },
    {
      title: "Medicine Requests",
      desc: "View patient medicine inquiries and update request status.",
      icon: Inbox,
      path: "/medical-dashboard/medicine-requests",
      badge: `${stats.pendingRequests || 0} pending`,
    },
    {
      title: "QR Discount Scan",
      desc: "Scan patient QR and record discount interactions.",
      icon: QrCode,
      path: "/medical-dashboard/scan-discount",
      badge: "Scan",
    },
    {
      title: "Scan History",
      desc: "Track monthly users, discount and 150-user progress.",
      icon: History,
      path: "/medical-dashboard/scan-history",
      badge: dashboardData?.monthKey || "Current",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur">
              <Store size={18} />
              Medical Owner Dashboard
            </div>

            <h1 className="text-3xl font-black">
              {store?.storeName || "Welcome Medical Owner"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-50">
              Manage medicine inventory, patient requests, QR discount scans and
              monthly 150-user interaction target from one place.
            </p>

            {store && (
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-cyan-50">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                  <MapPin size={15} />
                  {store.city || "City"}, {store.state || "State"}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                  {store.isActive ? (
                    <ShieldCheck size={15} />
                  ) : (
                    <ShieldX size={15} />
                  )}
                  {store.isActive ? "Active" : "Inactive"}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                  {store.isVerifiedByAdmin ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <AlertCircle size={15} />
                  )}
                  {store.isVerifiedByAdmin ? "Verified" : "Not Verified"}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-cyan-50">Monthly Target</p>
            <p className="mt-1 text-3xl font-black">
              {stats.uniquePatients || 0}/{stats.monthlyTarget || 150}
            </p>
            <p className="mt-1 text-xs text-cyan-50">
              Unique patient interactions
            </p>
          </div>
        </div>
      </div>

      {!hasStoreProfile && (
        <div className="rounded-[2rem] border border-orange-200 bg-orange-50 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-orange-900">
                Complete your store profile first
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-orange-700">
                Inventory, medicine requests and QR discount features work best
                after completing your medical store profile.
              </p>
            </div>

            <Link
              to="/medical-dashboard/profile"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-700"
            >
              Complete Profile
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <Link
            key={item.title}
            to={item.path}
            className="group rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-lg shadow-cyan-100/50 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition group-hover:scale-110">
              <item.icon />
            </div>

            <p className="text-sm font-bold text-slate-500">{item.title}</p>
            <h3 className="mt-1 text-3xl font-black text-slate-900">
              {item.value}
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {item.desc}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">Quick Actions</h2>
            <p className="text-sm text-slate-500">
              Continue managing your store operations.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {actions.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition group-hover:scale-110">
                    <item.icon />
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <TrendingUp />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Monthly Progress
                </h2>
                <p className="text-sm text-slate-500">
                  {dashboardData?.monthKey || "Current month"}
                </p>
              </div>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-500 transition-all"
                style={{ width: `${stats.targetProgress || 0}%` }}
              />
            </div>

            <div className="mt-3 flex justify-between text-sm font-black text-slate-700">
              <span>{stats.targetProgress || 0}% complete</span>
              <span>
                {stats.uniquePatients || 0}/{stats.monthlyTarget || 150}
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              <MiniInfo
                icon={<Users size={17} />}
                label="Unique Patients"
                value={stats.uniquePatients || 0}
              />
              <MiniInfo
                icon={<BadgeIndianRupee size={17} />}
                label="Total Bill Amount"
                value={`₹${stats.totalBillAmount || 0}`}
              />
              <MiniInfo
                icon={<Percent size={17} />}
                label="Discount Given"
                value={`₹${stats.totalDiscountGiven || 0}`}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <Inbox />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Recent Requests
                </h2>
                <p className="text-sm text-slate-500">
                  Latest medicine inquiries.
                </p>
              </div>
            </div>

            {dashboardData?.recentRequests?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentRequests.map((request) => (
                  <div
                    key={request._id}
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {request.medicineName}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {request.patientName} • {request.patientPhone}
                        </p>
                      </div>

                      <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black capitalize text-cyan-700">
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-5 text-center">
                <Pill className="mx-auto text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  No recent requests yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniInfo = ({ icon, label, value }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-cyan-600">{icon}</span>
        <p className="text-sm font-bold text-slate-500">{label}</p>
      </div>

      <p className="text-sm font-black text-slate-900">{value}</p>
    </div>
  );
};

export default MedicalDashboard;
