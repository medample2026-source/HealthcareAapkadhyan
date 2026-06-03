import { useEffect, useMemo, useState } from "react";
import {
  Store,
  Users,
  QrCode,
  Target,
  BadgeIndianRupee,
  Percent,
  Search,
  CalendarDays,
  Loader2,
  ShieldCheck,
  ShieldX,
  Eye,
  Power,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import API from "../../api/axios";

const getCurrentMonthKey = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const MedicalStoreAnalytics = () => {
  const [stores, setStores] = useState([]);
  const [summary, setSummary] = useState(null);

  const [monthKey, setMonthKey] = useState(getCurrentMonthKey());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedStoreData, setSelectedStoreData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (monthKey) params.append("monthKey", monthKey);
      if (search.trim()) params.append("search", search.trim());
      if (status) params.append("status", status);

      const res = await API.get(
        `/super-admin-medical/stores?${params.toString()}`,
      );

      setStores(res.data.medicalStores || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load medical store analytics.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreDetails = async (store) => {
    try {
      setSelectedStore(store);
      setSelectedStoreData(null);
      setDetailsLoading(true);
      setError("");

      const res = await API.get(
        `/super-admin-medical/stores/${store._id}?monthKey=${monthKey}`,
      );

      setSelectedStoreData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load store details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [monthKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleVerify = async (storeId) => {
    try {
      setActionLoading(storeId);
      setError("");
      setSuccess("");

      const res = await API.patch(
        `/super-admin-medical/stores/${storeId}/verify`,
      );

      setSuccess(res.data.message || "Store verified successfully.");
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify store.");
    } finally {
      setActionLoading("");
    }
  };

  const handleToggleStatus = async (storeId) => {
    try {
      setActionLoading(storeId);
      setError("");
      setSuccess("");

      const res = await API.patch(
        `/super-admin-medical/stores/${storeId}/status`,
      );

      setSuccess(res.data.message || "Store status updated successfully.");
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update store status.");
    } finally {
      setActionLoading("");
    }
  };

  const topStores = useMemo(() => {
    return [...stores]
      .sort(
        (a, b) =>
          Number(b.analytics?.uniquePatients || 0) -
          Number(a.analytics?.uniquePatients || 0),
      )
      .slice(0, 5);
  }, [stores]);

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur">
              <Store size={18} />
              Super Admin Medical Stores
            </div>

            <h1 className="text-3xl font-black">Medical Store Analytics</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-50">
              Monitor medical stores, QR scans, unique users, discount activity,
              and monthly 150-user target progress.
            </p>
          </div>

          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-cyan-50">Selected Month</p>
            <p className="mt-1 text-3xl font-black">{monthKey}</p>
            <p className="mt-1 text-xs text-cyan-50">Analytics cycle</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Stores"
          value={summary?.totalStores || 0}
          desc="Registered medical stores"
          icon={<Store />}
        />
        <StatCard
          title="Active Stores"
          value={summary?.activeStores || 0}
          desc="Currently active"
          icon={<ShieldCheck />}
        />
        <StatCard
          title="Total Scans"
          value={summary?.totalScans || 0}
          desc="Monthly QR interactions"
          icon={<QrCode />}
        />
        <StatCard
          title="Unique Users"
          value={summary?.totalUniqueUsers || 0}
          desc="Total unique interactions"
          icon={<Users />}
        />
        <StatCard
          title="Target Completed"
          value={summary?.targetCompletedStores || 0}
          desc="Stores reached 150 users"
          icon={<Target />}
        />
        <StatCard
          title="Profiles Complete"
          value={summary?.completedProfiles || 0}
          desc="Ready store profiles"
          icon={<CheckCircle2 />}
        />
        <StatCard
          title="Total Bills"
          value={`₹${summary?.totalBillAmount || 0}`}
          desc="Recorded bill amount"
          icon={<BadgeIndianRupee />}
        />
        <StatCard
          title="Discount Given"
          value={`₹${summary?.totalDiscountGiven || 0}`}
          desc="Total store discount"
          icon={<Percent />}
        />
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-lg shadow-cyan-100/40 backdrop-blur"
      >
        <div className="grid gap-4 xl:grid-cols-[220px_1fr_220px_auto]">
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
              placeholder="Search store, owner, city, phone..."
              className="ml-3 w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          >
            <option value="">All Stores</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="complete">Profile Complete</option>
            <option value="incomplete">Profile Incomplete</option>
          </select>

          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Search
          </button>
        </div>
      </form>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">
              All Medical Stores
            </h2>
            <p className="text-sm text-slate-500">
              Monthly target is 150 unique users. Stores can scan more than 150.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600">
                <Loader2 className="animate-spin text-cyan-600" />
                Loading medical stores...
              </div>
            </div>
          ) : stores.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <Store className="mx-auto text-slate-400" size={42} />
              <h3 className="mt-4 text-lg font-black text-slate-800">
                No medical stores found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Stores will appear here after medical owners create profiles.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {stores.map((store) => (
                <StoreCard
                  key={store._id}
                  store={store}
                  actionLoading={actionLoading === store._id}
                  onView={() => fetchStoreDetails(store)}
                  onVerify={() => handleVerify(store._id)}
                  onToggleStatus={() => handleToggleStatus(store._id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
            <h2 className="text-xl font-black text-slate-900">Top Stores</h2>
            <p className="mt-1 text-sm text-slate-500">
              Based on unique users for {monthKey}.
            </p>

            <div className="mt-5 space-y-3">
              {topStores.length === 0 ? (
                <p className="text-sm font-semibold text-slate-500">
                  No data available.
                </p>
              ) : (
                topStores.map((store, index) => (
                  <div key={store._id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          #{index + 1} {store.storeName}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {store.city}, {store.state}
                        </p>
                      </div>

                      <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">
                        {store.analytics?.uniquePatients || 0} users
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedStore && (
            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Store Details
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedStore.storeName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedStore(null);
                    setSelectedStoreData(null);
                  }}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600">
                  <Loader2 className="animate-spin text-cyan-600" />
                  Loading details...
                </div>
              ) : selectedStoreData ? (
                <div className="space-y-4">
                  <DetailRow
                    label="Store"
                    value={selectedStoreData.store?.storeName}
                  />
                  <DetailRow
                    label="Owner"
                    value={
                      selectedStoreData.store?.owner?.fullName ||
                      selectedStoreData.store?.ownerName ||
                      "N/A"
                    }
                  />
                  <DetailRow
                    label="Phone"
                    value={selectedStoreData.store?.phone || "N/A"}
                  />
                  <DetailRow
                    label="Monthly Scans"
                    value={selectedStoreData.analytics?.totalScans || 0}
                  />
                  <DetailRow
                    label="Unique Users"
                    value={selectedStoreData.analytics?.uniquePatients || 0}
                  />
                  <DetailRow
                    label="Target Progress"
                    value={`${selectedStoreData.analytics?.targetProgress || 0}%`}
                  />
                  <DetailRow
                    label="Total Discount"
                    value={`₹${selectedStoreData.analytics?.totalDiscountGiven || 0}`}
                  />

                  <div className="mt-5">
                    <h3 className="mb-3 text-sm font-black text-slate-800">
                      Recent Scan Records
                    </h3>

                    <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                      {selectedStoreData.scans?.length === 0 ? (
                        <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                          No scan records for this month.
                        </p>
                      ) : (
                        selectedStoreData.scans?.slice(0, 10).map((scan) => (
                          <div
                            key={scan._id}
                            className="rounded-2xl bg-slate-50 p-4"
                          >
                            <p className="text-sm font-black text-slate-900">
                              {scan.patientName || "Unknown Patient"}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              ID: {scan.patientUniqueId}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              Bill ₹{scan.billAmount} • Discount ₹
                              {scan.discountAmount}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-500">
                  Select a store to view details.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StoreCard = ({
  store,
  actionLoading,
  onView,
  onVerify,
  onToggleStatus,
}) => {
  const progress = store.analytics?.targetProgress || 0;
  const targetCompleted = store.analytics?.targetCompleted;

  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-lg">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
              {store.storeType}
            </span>

            {store.isActive ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                Active
              </span>
            ) : (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                Inactive
              </span>
            )}

            {store.isVerifiedByAdmin ? (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                Verified
              </span>
            ) : (
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                Not Verified
              </span>
            )}

            {targetCompleted && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                Target Completed
              </span>
            )}
          </div>

          <h3 className="text-xl font-black text-slate-900">
            {store.storeName}
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Owner: {store.ownerName || store.owner?.fullName || "N/A"}
          </p>

          <div className="mt-4 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
            <InfoLine
              icon={<MapPin size={16} />}
              text={`${store.city}, ${store.state}`}
            />
            <InfoLine icon={<Phone size={16} />} text={store.phone || "N/A"} />
            <InfoLine icon={<Mail size={16} />} text={store.email || "N/A"} />
            <InfoLine
              icon={<Target size={16} />}
              text={`${store.analytics?.uniquePatients || 0}/${store.monthlyTargetUsers || 150} unique users`}
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-black text-slate-600">
              <span>Target Progress</span>
              <span>{progress}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <MiniInfo label="Scans" value={store.analytics?.totalScans || 0} />
            <MiniInfo
              label="Users"
              value={store.analytics?.uniquePatients || 0}
            />
            <MiniInfo
              label="Bills"
              value={`₹${store.analytics?.totalBillAmount || 0}`}
            />
            <MiniInfo
              label="Discount"
              value={`₹${store.analytics?.totalDiscountGiven || 0}`}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 xl:flex-col">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800"
          >
            <Eye size={16} />
            View
          </button>

          {!store.isVerifiedByAdmin && (
            <button
              type="button"
              onClick={onVerify}
              disabled={actionLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
            >
              {actionLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
              Verify
            </button>
          )}

          <button
            type="button"
            onClick={onToggleStatus}
            disabled={actionLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition disabled:opacity-60 ${
              store.isActive
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
            }`}
          >
            {actionLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : store.isActive ? (
              <ShieldX size={16} />
            ) : (
              <Power size={16} />
            )}
            {store.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
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

const InfoLine = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-cyan-600">{icon}</span>
      <span className="truncate font-semibold">{text}</span>
    </div>
  );
};

const DetailRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="text-right text-sm font-black text-slate-900">{value}</p>
    </div>
  );
};

export default MedicalStoreAnalytics;
