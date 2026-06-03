import { useEffect, useState } from "react";
import {
  History,
  Loader2,
  Search,
  Trash2,
  Users,
  QrCode,
  BadgeIndianRupee,
  Percent,
  Target,
  CalendarDays,
} from "lucide-react";
import API from "../../api/axios";

const getCurrentMonthKey = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState(null);

  const [monthKey, setMonthKey] = useState(getCurrentMonthKey());
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchStats = async () => {
    try {
      setStatsLoading(true);

      const res = await API.get(`/medical-scans/my/stats?monthKey=${monthKey}`);

      setStats(res.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load scan stats.");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchScans = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (monthKey) params.append("monthKey", monthKey);
      if (search.trim()) params.append("search", search.trim());

      const res = await API.get(`/medical-scans/my?${params.toString()}`);

      setScans(res.data.scans || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load scan history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchScans();
  }, [monthKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchScans();
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this scan record?",
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setSuccess("");

      const res = await API.delete(`/medical-scans/${id}`);

      setSuccess(res.data.message || "Scan deleted successfully.");
      fetchStats();
      fetchScans();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete scan record.");
    }
  };

  const progress = stats?.targetProgress || 0;

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur">
              <History size={18} />
              Scan History
            </div>

            <h1 className="text-3xl font-black">
              Monthly QR Interaction History
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-50">
              Track QR scans, unique customers, discounts, bill amount, and
              monthly target progress.
            </p>
          </div>

          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-cyan-50">Selected Month</p>
            <p className="mt-1 text-3xl font-black">{monthKey}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Scans"
          value={statsLoading ? "..." : stats?.totalScans || 0}
          desc="All interactions"
          icon={<QrCode />}
        />
        <StatCard
          title="Unique Users"
          value={statsLoading ? "..." : stats?.uniquePatients || 0}
          desc="Monthly unique customers"
          icon={<Users />}
        />
        <StatCard
          title="Total Bills"
          value={statsLoading ? "..." : `₹${stats?.totalBillAmount || 0}`}
          desc="Recorded bill amount"
          icon={<BadgeIndianRupee />}
        />
        <StatCard
          title="Discount Given"
          value={statsLoading ? "..." : `₹${stats?.totalDiscountGiven || 0}`}
          desc="Total discount"
          icon={<Percent />}
        />
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Target />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              Monthly Target Progress
            </h2>
            <p className="text-sm text-slate-500">
              Target is {stats?.monthlyTarget || 150} unique users per month.
              More scans are allowed.
            </p>
          </div>
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between text-sm font-black text-slate-700">
          <span>{progress}% completed</span>
          <span>
            {stats?.uniquePatients || 0}/{stats?.monthlyTarget || 150} users
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-lg shadow-cyan-100/40 backdrop-blur"
      >
        <div className="grid gap-4 lg:grid-cols-[220px_1fr_auto]">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
            <CalendarDays size={18} className="text-slate-400" />
            <input
              type="month"
              value={monthKey}
              onChange={(e) => setMonthKey(e.target.value)}
              className="ml-3 w-full bg-transparent text-sm font-semibold outline-none"
            />
          </div>

          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient ID, name, or phone..."
              className="ml-3 w-full bg-transparent text-sm outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Search
          </button>
        </div>
      </form>

      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-900">Scan Records</h2>
          <p className="text-sm text-slate-500">
            All saved QR discount interactions.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600">
              <Loader2 className="animate-spin text-cyan-600" />
              Loading scan history...
            </div>
          </div>
        ) : scans.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <History className="mx-auto text-slate-400" size={42} />
            <h3 className="mt-4 text-lg font-black text-slate-800">
              No scan records found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Scan records will appear here after saving QR discount
              interactions.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {scans.map((scan) => (
              <div
                key={scan._id}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                        {scan.scanSource}
                      </span>

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                        {scan.monthKey}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900">
                      {scan.patientName || "Unknown Patient"}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      ID: {scan.patientUniqueId}
                    </p>

                    {scan.patientPhone && (
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        Phone: {scan.patientPhone}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(scan._id)}
                    className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniInfo label="Bill" value={`₹${scan.billAmount}`} />
                  <MiniInfo
                    label="Discount"
                    value={`₹${scan.discountAmount}`}
                  />
                  <MiniInfo label="Final" value={`₹${scan.finalAmount}`} />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <MiniInfo
                    label="Discount %"
                    value={`${scan.discountPercentage}%`}
                  />
                  <MiniInfo
                    label="Date"
                    value={new Date(scan.createdAt).toLocaleString()}
                  />
                </div>

                {scan.note && (
                  <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                    {scan.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, desc, icon }) => {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-lg shadow-cyan-100/50 backdrop-blur">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h3 className="mt-1 text-2xl font-black text-slate-900">{value}</h3>
      <p className="mt-1 text-xs font-medium text-slate-500">{desc}</p>
    </div>
  );
};

const MiniInfo = ({ label, value }) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
};

export default ScanHistory;
