import { useEffect, useMemo, useState } from "react";
import {
  Inbox,
  Search,
  Loader2,
  Phone,
  UserRound,
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  PackageCheck,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import API from "../../api/axios";

const statusOptions = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Completed", value: "completed" },
];

const MedicineRequests = () => {
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState(null);

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const [ownerNote, setOwnerNote] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (status) params.append("status", status);
      if (search.trim()) params.append("search", search.trim());

      const res = await API.get(
        `/medicine-requests/my-store?${params.toString()}`,
      );

      setRequests(res.data.requests || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await API.get("/medicine-requests/my-store/summary");
      setSummary(res.data.summary || null);
    } catch {
      setSummary(null);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchSummary();
  }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const updateStatus = async (requestId, newStatus) => {
    try {
      setActionLoading(requestId);
      setError("");
      setSuccess("");

      const res = await API.patch(`/medicine-requests/${requestId}/status`, {
        status: newStatus,
        ownerNote,
      });

      setSuccess(res.data.message || "Request updated successfully.");
      setOwnerNote("");
      fetchRequests();
      fetchSummary();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update request.");
    } finally {
      setActionLoading("");
    }
  };

  const pendingCount = useMemo(() => {
    return summary?.pending || 0;
  }, [summary]);

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur">
              <Inbox size={18} />
              Medicine Requests
            </div>

            <h1 className="text-3xl font-black">Incoming Medicine Inquiries</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-50">
              Manage patient medicine requests, accept requests, reject
              unavailable items, and mark completed after delivery or pickup.
            </p>
          </div>

          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-cyan-50">
              Pending Requests
            </p>
            <p className="mt-1 text-3xl font-black">{pendingCount}</p>
            <p className="mt-1 text-xs text-cyan-50">Needs your response</p>
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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total" value={summary?.total || 0} icon={<Inbox />} />
        <StatCard
          title="Pending"
          value={summary?.pending || 0}
          icon={<Clock />}
        />
        <StatCard
          title="Accepted"
          value={summary?.accepted || 0}
          icon={<CheckCircle2 />}
        />
        <StatCard
          title="Rejected"
          value={summary?.rejected || 0}
          icon={<XCircle />}
        />
        <StatCard
          title="Completed"
          value={summary?.completed || 0}
          icon={<PackageCheck />}
        />
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-lg shadow-cyan-100/40 backdrop-blur"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, phone, medicine..."
              className="ml-3 w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          >
            {statusOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

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
          <h2 className="text-xl font-black text-slate-900">Request List</h2>
          <p className="text-sm text-slate-500">
            Patient requests sent from public medicine search.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600">
              <Loader2 className="animate-spin text-cyan-600" />
              Loading requests...
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <Inbox className="mx-auto text-slate-400" size={42} />
            <h3 className="mt-4 text-lg font-black text-slate-800">
              No medicine requests found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Requests will appear here when patients send inquiries.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {requests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                ownerNote={ownerNote}
                setOwnerNote={setOwnerNote}
                actionLoading={actionLoading === request._id}
                onUpdateStatus={updateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RequestCard = ({
  request,
  ownerNote,
  setOwnerNote,
  actionLoading,
  onUpdateStatus,
}) => {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-lg">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={request.status} />
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
          Qty: {request.requestedQuantity}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
          <Pill />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black text-slate-900">
            {request.medicineName}
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {request.medicine?.brandName || "No brand"}{" "}
            {request.medicine?.strength ? `• ${request.medicine.strength}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoLine icon={<UserRound size={16} />} text={request.patientName} />
          <InfoLine icon={<Phone size={16} />} text={request.patientPhone} />
        </div>

        {request.message && (
          <p className="mt-4 flex gap-2 text-sm leading-6 text-slate-600">
            <MessageSquare size={17} className="mt-1 shrink-0 text-cyan-600" />
            <span>{request.message}</span>
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MiniInfo label="Price" value={`₹${request.medicine?.price || 0}`} />
        <MiniInfo label="Stock" value={request.medicine?.quantity ?? "N/A"} />
        <MiniInfo
          label="Date"
          value={new Date(request.createdAt).toLocaleDateString()}
        />
      </div>

      {request.status === "pending" && (
        <>
          <textarea
            value={ownerNote}
            onChange={(e) => setOwnerNote(e.target.value)}
            placeholder="Optional note for this request..."
            rows={3}
            className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onUpdateStatus(request._id, "accepted")}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
            >
              {actionLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Accept
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onUpdateStatus(request._id, "rejected")}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-60"
            >
              <XCircle size={16} />
              Reject
            </button>

            <a
              href={`tel:${request.patientPhone}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800"
            >
              <Phone size={16} />
              Call
            </a>
          </div>
        </>
      )}

      {request.status === "accepted" && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => onUpdateStatus(request._id, "completed")}
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-700 transition hover:bg-cyan-100 disabled:opacity-60"
          >
            {actionLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <PackageCheck size={16} />
            )}
            Mark Completed
          </button>

          <a
            href={`tel:${request.patientPhone}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800"
          >
            <Phone size={16} />
            Call
          </a>
        </div>
      )}

      {request.ownerNote && (
        <p className="mt-4 rounded-2xl bg-cyan-50 p-4 text-sm font-semibold leading-6 text-cyan-700">
          Owner note: {request.ownerNote}
        </p>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-orange-50 text-orange-700",
    accepted: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
    completed: "bg-cyan-50 text-cyan-700",
    cancelled: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black capitalize ${
        styles[status] || styles.pending
      }`}
    >
      {status}
    </span>
  );
};

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-lg shadow-cyan-100/50 backdrop-blur">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h3 className="mt-1 text-2xl font-black text-slate-900">{value}</h3>
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
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
      <span className="text-cyan-600">{icon}</span>
      <span>{text || "N/A"}</span>
    </div>
  );
};

export default MedicineRequests;
