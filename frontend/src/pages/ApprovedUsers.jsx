import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Search,
  Users,
  UserCheck,
  Building2,
  Ban,
  Trash2,
  Loader2,
  CheckCircle,
} from "lucide-react";
import API from "../api/axios";

const ApprovedUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchApprovedUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/super-admin/approved-users");
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load approved users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.phone?.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleBlockToggle = async (user) => {
    try {
      setActionLoading(user._id);

      if (user.isBlocked) {
        await API.patch(`/super-admin/unblock/${user._id}`);
      } else {
        await API.patch(`/super-admin/block/${user._id}`);
      }

      setUsers((prev) =>
        prev.map((item) =>
          item._id === user._id
            ? { ...item, isBlocked: !item.isBlocked }
            : item,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user permanently?",
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(userId);
      await API.delete(`/super-admin/delete/${userId}`);

      setUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const doctorCount = users.filter((u) => u.role === "doctor").length;
  const hospitalCount = users.filter((u) => u.role === "hospitalAdmin").length;
  const blockedCount = users.filter((u) => u.isBlocked).length;

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                <ShieldCheck size={18} />
                Approved Users Control
              </div>

              <h1 className="text-3xl font-black text-slate-900 md:text-4xl">
                Approved Users Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
                Manage approved doctors and hospital admins. Block, unblock, or
                remove accounts when needed.
              </p>
            </div>

            <button
              onClick={fetchApprovedUsers}
              className="rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-200 transition hover:scale-[1.02]"
            >
              Refresh Users
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users />}
            title="Approved Users"
            value={users.length}
            color="from-cyan-500 to-blue-500"
          />
          <StatCard
            icon={<UserCheck />}
            title="Doctors"
            value={doctorCount}
            color="from-emerald-500 to-teal-500"
          />
          <StatCard
            icon={<Building2 />}
            title="Hospitals"
            value={hospitalCount}
            color="from-violet-500 to-indigo-500"
          />
          <StatCard
            icon={<Ban />}
            title="Blocked"
            value={blockedCount}
            color="from-red-500 to-rose-500"
          />
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Users Directory
              </h2>
              <p className="text-sm text-slate-500">
                Search and manage active professional accounts.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user..."
                  className="ml-3 w-full bg-transparent text-sm outline-none"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm outline-none"
              >
                <option value="all">All Roles</option>
                <option value="doctor">Doctors</option>
                <option value="hospitalAdmin">Hospital Admins</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-cyan-600">
              <Loader2 className="animate-spin" size={34} />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-cyan-200 bg-cyan-50/60 p-10 text-center">
              <CheckCircle
                className="mx-auto mb-4 text-emerald-500"
                size={44}
              />
              <h3 className="text-xl font-black text-slate-900">
                No Users Found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                No approved users match your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="hidden grid-cols-6 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500 lg:grid">
                <span className="col-span-2">User</span>
                <span>Role</span>
                <span>Status</span>
                <span>Verified</span>
                <span>Actions</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="grid gap-4 px-5 py-5 transition hover:bg-slate-50 lg:grid-cols-6 lg:items-center"
                  >
                    <div className="lg:col-span-2">
                      <h3 className="font-black text-slate-900">
                        {user.fullName}
                      </h3>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-slate-500">{user.phone}</p>
                      )}
                    </div>

                    <div>
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

                    <div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          user.isBlocked
                            ? "bg-red-100 text-red-700"
                            : "bg-cyan-100 text-cyan-700"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>

                    <div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                        {user.isEmailVerified ? "Verified" : "Not Verified"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleBlockToggle(user)}
                        disabled={actionLoading === user._id}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition disabled:opacity-60 ${
                          user.isBlocked
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                        }`}
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Ban size={14} />
                        )}
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>

                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={actionLoading === user._id}
                        className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-cyan-100/50 backdrop-blur-xl">
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

export default ApprovedUsers;
