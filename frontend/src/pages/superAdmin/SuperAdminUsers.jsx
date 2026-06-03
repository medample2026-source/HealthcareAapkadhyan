import { useEffect, useState } from "react";
import {
  Ban,
  Building2,
  CheckCircle,
  Loader2,
  MailCheck,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import API from "../../api/axios";

const roleOptions = [
  { label: "All Roles", value: "all" },
  { label: "Patients", value: "patient" },
  { label: "Doctors", value: "doctor" },
  { label: "Hospital Admins", value: "hospitalAdmin" },
  { label: "Medical Owners", value: "medicalOwner" },
];

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Blocked", value: "blocked" },
  { label: "Email Unverified", value: "unverified-email" },
];

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) params.search = search.trim();
      if (role !== "all") params.role = role;
      if (status !== "all") params.status = status;

      const res = await API.get("/super-admin/users", { params });

      setUsers(res.data.users || []);
      setStats(res.data.stats || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refreshAfterAction = async () => {
    await fetchUsers();
  };

  const approveUser = async (userId) => {
    try {
      setActionLoading(userId);
      await API.patch(`/super-admin/approve/${userId}`);
      await refreshAfterAction();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectUser = async (userId) => {
    if (!window.confirm("Reject and remove this professional account?")) return;

    try {
      setActionLoading(userId);
      await API.delete(`/super-admin/reject/${userId}`);
      await refreshAfterAction();
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleBlock = async (user) => {
    try {
      setActionLoading(user._id);

      if (user.isBlocked) {
        await API.patch(`/super-admin/unblock/${user._id}`);
      } else {
        await API.patch(`/super-admin/block/${user._id}`);
      }

      await refreshAfterAction();
    } catch (err) {
      alert(err.response?.data?.message || "Block action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user permanently?")) return;

    try {
      setActionLoading(userId);
      await API.delete(`/super-admin/delete/${userId}`);
      await refreshAfterAction();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleEmailVerification = async (user) => {
    try {
      setActionLoading(user._id);
      await API.patch(`/super-admin/verify/${user._id}`, {
        isEmailVerified: !user.isEmailVerified,
      });
      await refreshAfterAction();
    } catch (err) {
      alert(err.response?.data?.message || "Verification update failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-cyan-700">
                <Users size={18} />
                Registered Users Directory
              </div>

              <h1 className="text-3xl font-black text-slate-900 md:text-4xl">
                Find and manage all users
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
                Search patients, doctors, hospital admins, and medical owners.
                Approve, reject, block, delete, or manually verify accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              className="rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-200 transition hover:scale-[1.02]"
            >
              Refresh Users
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <StatCard icon={<Users />} title="Total" value={stats.totalUsers || 0} />
          <StatCard icon={<UserCheck />} title="Patients" value={stats.totalPatients || 0} />
          <StatCard icon={<ShieldCheck />} title="Doctors" value={stats.totalDoctors || 0} />
          <StatCard icon={<Building2 />} title="Hospitals" value={stats.totalHospitals || 0} />
          <StatCard icon={<Store />} title="Medical" value={stats.totalMedicalOwners || 0} />
          <StatCard icon={<MailCheck />} title="Pending" value={stats.pendingApprovals || 0} />
          <StatCard icon={<Ban />} title="Blocked" value={stats.blockedUsers || 0} />
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
          <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
            <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchUsers();
                }}
                placeholder="Search name, email, or phone..."
                className="ml-3 w-full bg-transparent text-sm outline-none"
              />
            </div>

            <FilterSelect value={role} onChange={setRole} options={roleOptions} />
            <FilterSelect value={status} onChange={setStatus} options={statusOptions} />

            <button
              type="button"
              onClick={fetchUsers}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Search
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-cyan-600">
              <Loader2 className="animate-spin" size={34} />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-cyan-200 bg-cyan-50/60 p-10 text-center">
              <h3 className="text-xl font-black text-slate-900">
                No users found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Try changing search or filter options.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  loading={actionLoading === user._id}
                  onApprove={approveUser}
                  onReject={rejectUser}
                  onBlock={toggleBlock}
                  onDelete={deleteUser}
                  onVerifyEmail={toggleEmailVerification}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const FilterSelect = ({ value, onChange, options }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const UserCard = ({
  user,
  loading,
  onApprove,
  onReject,
  onBlock,
  onDelete,
  onVerifyEmail,
}) => {
  const isProfessional = ["doctor", "hospitalAdmin", "medicalOwner"].includes(
    user.role,
  );

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr_1.6fr] xl:items-center">
        <div>
          <h3 className="text-lg font-black text-slate-900">
            {user.fullName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {user.email || "No email"}
          </p>
          {user.phone && <p className="text-sm text-slate-500">{user.phone}</p>}
          <p className="mt-2 text-xs font-bold text-slate-400">
            Registered {new Date(user.createdAt).toLocaleDateString("en-IN")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge label={formatRole(user.role)} tone="cyan" />
          <Badge
            label={user.isApproved ? "Approved" : "Pending"}
            tone={user.isApproved ? "green" : "orange"}
          />
          <Badge
            label={user.isBlocked ? "Blocked" : "Active"}
            tone={user.isBlocked ? "red" : "slate"}
          />
          <Badge
            label={user.isEmailVerified ? "Email Verified" : "Email Not Verified"}
            tone={user.isEmailVerified ? "green" : "orange"}
          />
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          {isProfessional && !user.isApproved && (
            <>
              <ActionButton
                label="Approve"
                icon={<CheckCircle size={14} />}
                tone="green"
                disabled={loading}
                onClick={() => onApprove(user._id)}
              />
              <ActionButton
                label="Reject"
                icon={<XCircle size={14} />}
                tone="red"
                disabled={loading}
                onClick={() => onReject(user._id)}
              />
            </>
          )}

          <ActionButton
            label={user.isEmailVerified ? "Unverify Email" : "Verify Email"}
            icon={<MailCheck size={14} />}
            tone="cyan"
            disabled={loading}
            onClick={() => onVerifyEmail(user)}
          />

          <ActionButton
            label={user.isBlocked ? "Unblock" : "Block"}
            icon={<Ban size={14} />}
            tone="orange"
            disabled={loading}
            onClick={() => onBlock(user)}
          />

          <ActionButton
            label="Delete"
            icon={<Trash2 size={14} />}
            tone="red"
            disabled={loading}
            onClick={() => onDelete(user._id)}
          />
        </div>
      </div>
    </article>
  );
};

const ActionButton = ({ label, icon, tone, disabled, onClick }) => {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    red: "bg-red-50 text-red-600 hover:bg-red-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    cyan: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition disabled:opacity-60 ${styles[tone]}`}
    >
      {disabled ? <Loader2 className="animate-spin" size={14} /> : icon}
      {label}
    </button>
  );
};

const Badge = ({ label, tone }) => {
  const styles = {
    cyan: "bg-cyan-100 text-cyan-700",
    green: "bg-emerald-100 text-emerald-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[tone]}`}>
      {label}
    </span>
  );
};

const StatCard = ({ icon, title, value }) => {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-cyan-100/50 backdrop-blur-xl">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h3 className="mt-1 text-3xl font-black text-slate-900">{value}</h3>
    </div>
  );
};

const formatRole = (role) => {
  const labels = {
    patient: "Patient",
    doctor: "Doctor",
    hospitalAdmin: "Hospital Admin",
    medicalOwner: "Medical Owner",
  };

  return labels[role] || role;
};

export default SuperAdminUsers;
