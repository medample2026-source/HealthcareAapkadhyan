import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  UserCheck,
  Building2,
  CheckCircle,
  XCircle,
  Loader2,
  Ban,
  CalendarCheck,
  FileText,
  Siren,
  Ambulance,
  Activity,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import API from "../api/axios";

const COLORS = [
  "#06b6d4",
  "#10b981",
  "#8b5cf6",
  "#f97316",
  "#ef4444",
  "#6366f1",
];

const SuperAdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    users: {},
    hospitals: {},
    doctors: {},
    appointments: {},
    reports: {},
    sos: {},
    charts: {
      roleAnalytics: [],
      appointmentAnalytics: [],
      sosAnalytics: [],
      hospitalCapabilityAnalytics: [],
    },
    recent: {
      recentUsers: [],
      recentSosRequests: [],
      recentAppointments: [],
      recentReports: [],
    },
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [pendingRes, analyticsRes] = await Promise.all([
        API.get("/super-admin/pending-users"),
        API.get("/analytics/super-admin"),
      ]);

      setPendingUsers(pendingRes.data.users || []);
      setAnalytics(analyticsRes.data.analytics || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApprove = async (userId) => {
    try {
      setActionLoading(userId);
      await API.patch(`/super-admin/approve/${userId}`);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    if (
      !window.confirm("Are you sure you want to reject and remove this user?")
    ) {
      return;
    }

    try {
      setActionLoading(userId);
      await API.delete(`/super-admin/reject/${userId}`);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    } finally {
      setActionLoading(null);
    }
  };

  const userRoleData = analytics.charts?.roleAnalytics || [];

  const approvalData = [
    { name: "Approved", value: analytics.users?.approvedUsers || 0 },
    { name: "Pending", value: analytics.users?.pendingApprovals || 0 },
    { name: "Blocked", value: analytics.users?.blockedUsers || 0 },
  ];

  const appointmentData = analytics.charts?.appointmentAnalytics || [];
  const sosData = analytics.charts?.sosAnalytics || [];
  const hospitalCapabilityData =
    analytics.charts?.hospitalCapabilityAnalytics || [];

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatStatus = (status) => {
    return status?.replaceAll("_", " ") || "N/A";
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-cyan-700">
                <ShieldCheck size={18} />
                Super Admin Control Center
              </div>

              <h1 className="text-3xl font-black text-slate-900 md:text-4xl">
                Platform Analytics Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
                Monitor users, hospitals, doctors, appointments, reports,
                emergency SOS activity, and pending professional approvals.
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-cyan-600 to-emerald-500 p-5 text-white shadow-lg shadow-cyan-200">
              <p className="text-sm font-medium opacity-90">Pending Requests</p>
              <h2 className="text-4xl font-black">{pendingUsers.length}</h2>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            icon={<Users />}
            title="Total Users"
            value={analytics.users?.totalUsers || 0}
            color="from-cyan-500 to-blue-500"
          />

          <StatCard
            icon={<UserCheck />}
            title="Doctors"
            value={analytics.users?.totalDoctorUsers || 0}
            color="from-emerald-500 to-teal-500"
          />

          <StatCard
            icon={<Building2 />}
            title="Hospitals"
            value={analytics.hospitals?.totalHospitals || 0}
            color="from-violet-500 to-indigo-500"
          />

          <StatCard
            icon={<ShieldCheck />}
            title="Pending"
            value={analytics.users?.pendingApprovals || 0}
            color="from-orange-500 to-amber-500"
          />

          <StatCard
            icon={<Ban />}
            title="Blocked"
            value={analytics.users?.blockedUsers || 0}
            color="from-red-500 to-rose-500"
          />

          <StatCard
            icon={<CheckCircle />}
            title="Approved"
            value={analytics.users?.approvedUsers || 0}
            color="from-green-500 to-emerald-500"
          />
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            icon={<CalendarCheck />}
            title="Appointments"
            value={analytics.appointments?.totalAppointments || 0}
            color="from-blue-500 to-cyan-500"
          />

          <StatCard
            icon={<FileText />}
            title="Reports"
            value={analytics.reports?.totalReports || 0}
            color="from-indigo-500 to-violet-500"
          />

          <StatCard
            icon={<Siren />}
            title="SOS Total"
            value={analytics.sos?.totalSosRequests || 0}
            color="from-red-500 to-orange-500"
          />

          <StatCard
            icon={<AlertTriangle />}
            title="New SOS"
            value={analytics.sos?.newSosRequests || 0}
            color="from-rose-500 to-red-500"
          />

          <StatCard
            icon={<Activity />}
            title="Critical SOS"
            value={analytics.sos?.criticalSosRequests || 0}
            color="from-orange-500 to-red-500"
          />

          <StatCard
            icon={<Ambulance />}
            title="Ambulance"
            value={analytics.sos?.ambulanceDispatchedSosRequests || 0}
            color="from-purple-500 to-violet-500"
          />
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="User Role Analytics"
            description="Patients, doctors, hospital admins, and super admins."
          >
            <div className="overflow-x-auto">
              <BarChart width={520} height={280} data={userRoleData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} />
              </BarChart>
            </div>
          </ChartCard>

          <ChartCard
            title="Approval Status"
            description="Approved, pending, and blocked users overview."
          >
            <div className="overflow-x-auto">
              <PieChart width={520} height={280}>
                <Pie
                  data={approvalData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={95}
                  label
                >
                  {approvalData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </ChartCard>

          <ChartCard
            title="Appointment Status"
            description="Pending, accepted, completed, rejected, and cancelled."
          >
            <div className="overflow-x-auto">
              <BarChart width={520} height={280} data={appointmentData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} />
              </BarChart>
            </div>
          </ChartCard>

          <ChartCard
            title="SOS Emergency Status"
            description="New, critical, accepted, rejected, ambulance, and resolved."
          >
            <div className="overflow-x-auto">
              <BarChart width={520} height={280} data={sosData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} />
              </BarChart>
            </div>
          </ChartCard>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <MiniPanel
            title="Hospital Capabilities"
            description="Emergency, ambulance, and 24x7 hospitals."
          >
            {hospitalCapabilityData.length === 0 ? (
              <EmptyState text="No hospital capability data found." />
            ) : (
              <div className="space-y-3">
                {hospitalCapabilityData.map((item) => (
                  <InfoRow
                    key={item.name}
                    label={item.name}
                    value={item.value}
                  />
                ))}
              </div>
            )}
          </MiniPanel>

          <MiniPanel
            title="Recent SOS Requests"
            description="Latest emergency requests on the platform."
          >
            {analytics.recent?.recentSosRequests?.length === 0 ? (
              <EmptyState text="No recent SOS requests found." />
            ) : (
              <div className="space-y-3">
                {analytics.recent?.recentSosRequests?.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-red-100 bg-red-50/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          {item.incidentType}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {item.fullName || "Guest User"} • {item.phone}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.city || "N/A"}, {item.state || "N/A"}
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black capitalize text-red-600">
                        {formatStatus(item.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </MiniPanel>

          <MiniPanel
            title="Recent Reports"
            description="Latest uploaded patient medical reports."
          >
            {analytics.recent?.recentReports?.length === 0 ? (
              <EmptyState text="No recent reports found." />
            ) : (
              <div className="space-y-3">
                {analytics.recent?.recentReports?.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4"
                  >
                    <h3 className="text-sm font-black text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {item.reportType} • {item.patientUniqueId}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Uploaded by {item.uploadedBy?.fullName || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </MiniPanel>
        </div>

        <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl">
          <h2 className="text-xl font-black text-slate-900">
            Recent Appointments
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Latest appointment booking activities.
          </p>

          {analytics.recent?.recentAppointments?.length === 0 ? (
            <EmptyState text="No recent appointments found." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {analytics.recent?.recentAppointments?.map((item) => (
                <div
                  key={item._id}
                  className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black capitalize text-cyan-700">
                      {item.status}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                      <Clock size={13} />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900">
                    {item.patient?.fullName || "Patient"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Doctor: {item.doctor?.user?.fullName || "N/A"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Mode: {item.consultationMode} • Time: {item.appointmentTime}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Pending Applications
              </h2>
              <p className="text-sm text-slate-500">
                Only verified and approved users should enter professional
                dashboards.
              </p>
            </div>

            <button
              onClick={fetchDashboard}
              className="rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-2 text-sm font-bold text-cyan-700 transition hover:bg-cyan-100"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-cyan-600">
              <Loader2 className="animate-spin" size={34} />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-cyan-200 bg-cyan-50/60 p-10 text-center">
              <CheckCircle
                className="mx-auto mb-4 text-emerald-500"
                size={44}
              />
              <h3 className="text-xl font-black text-slate-900">
                No Pending Applications
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                All doctors and hospital admins are reviewed.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {pendingUsers.map((user) => (
                <div
                  key={user._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {user.fullName}
                      </h3>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-slate-500">{user.phone}</p>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        user.role === "doctor"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-violet-100 text-violet-700"
                      }`}
                    >
                      {user.role === "doctor" ? "Doctor" : "Hospital Admin"}
                    </span>
                  </div>

                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    <InfoBox
                      label="Email Verified"
                      value={user.isEmailVerified ? "Yes" : "No"}
                    />
                    <InfoBox
                      label="Approval Status"
                      value={user.isApproved ? "Approved" : "Pending"}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(user._id)}
                      disabled={actionLoading === user._id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:scale-[1.02] disabled:opacity-60"
                    >
                      {actionLoading === user._id ? (
                        <Loader2 className="animate-spin" size={17} />
                      ) : (
                        <CheckCircle size={17} />
                      )}
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(user._id)}
                      disabled={actionLoading === user._id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      <XCircle size={17} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-cyan-100/50 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white`}
      >
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h3 className="mt-1 text-3xl font-black text-slate-900">{value}</h3>
    </div>
  );
};

const ChartCard = ({ title, description, children }) => {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl">
      <h2 className="mb-2 text-xl font-black text-slate-900">{title}</h2>
      <p className="mb-6 text-sm text-slate-500">{description}</p>

      <div className="w-full overflow-hidden rounded-3xl bg-white">
        {children}
      </div>
    </div>
  );
};

const MiniPanel = ({ title, description, children }) => {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl">
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
      <p className="mb-6 text-sm text-slate-500">{description}</p>
      {children}
    </div>
  );
};

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-bold text-slate-600">{label}</p>
      <p className="text-lg font-black text-slate-900">{value}</p>
    </div>
  );
};

const InfoBox = ({ label, value }) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
};

const EmptyState = ({ text }) => {
  return (
    <div className="rounded-3xl border border-dashed border-cyan-200 bg-cyan-50/60 p-8 text-center text-sm font-semibold text-slate-500">
      {text}
    </div>
  );
};

export default SuperAdminDashboard;
