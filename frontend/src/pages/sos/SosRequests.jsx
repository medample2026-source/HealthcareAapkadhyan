import {
  AlertTriangle,
  Ambulance,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";

const statusOptions = [
  "new",
  "viewed",
  "accepted",
  "rejected",
  "contacted",
  "ambulance_dispatched",
  "resolved",
  "cancelled",
];

const severityOptions = ["", "Low", "Medium", "High", "Critical"];

const statusStyles = {
  new: "bg-red-50 text-red-700 border-red-100",
  viewed: "bg-blue-50 text-blue-700 border-blue-100",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-rose-50 text-rose-700 border-rose-100",
  contacted: "bg-orange-50 text-orange-700 border-orange-100",
  ambulance_dispatched: "bg-purple-50 text-purple-700 border-purple-100",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
};

const severityStyles = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Medium: "bg-yellow-50 text-yellow-700 border-yellow-100",
  High: "bg-orange-50 text-orange-700 border-orange-100",
  Critical: "bg-red-50 text-red-700 border-red-100",
};

const SosRequests = () => {
  const [sosRequests, setSosRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    severity: "",
    requesterType: "",
    search: "",
  });

  const [statusForm, setStatusForm] = useState({
    status: "viewed",
    statusNote: "",
    rejectionReason: "",
  });

  const fetchSosRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.severity) params.append("severity", filters.severity);
      if (filters.requesterType) {
        params.append("requesterType", filters.requesterType);
      }

      const queryString = params.toString();

      const res = await API.get(
        `/sos/all${queryString ? `?${queryString}` : ""}`,
      );

      setSosRequests(res.data.sosRequests || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch SOS requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSosRequests();
  }, [filters.status, filters.severity, filters.requesterType]);

  const filteredRequests = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    if (!keyword) return sosRequests;

    return sosRequests.filter((item) => {
      const name = item.fullName?.toLowerCase() || "";
      const phone = item.phone?.toLowerCase() || "";
      const incident = item.incidentType?.toLowerCase() || "";
      const address = item.manualAddress?.toLowerCase() || "";
      const city = item.city?.toLowerCase() || "";
      const state = item.state?.toLowerCase() || "";

      return (
        name.includes(keyword) ||
        phone.includes(keyword) ||
        incident.includes(keyword) ||
        address.includes(keyword) ||
        city.includes(keyword) ||
        state.includes(keyword)
      );
    });
  }, [sosRequests, filters.search]);

  const stats = useMemo(() => {
    return {
      total: sosRequests.length,
      new: sosRequests.filter((item) => item.status === "new").length,
      critical: sosRequests.filter((item) => item.severity === "Critical")
        .length,
      accepted: sosRequests.filter((item) => item.status === "accepted").length,
      ambulance: sosRequests.filter(
        (item) => item.status === "ambulance_dispatched",
      ).length,
      resolved: sosRequests.filter((item) => item.status === "resolved").length,
    };
  }, [sosRequests]);

  const openStatusModal = (request) => {
    setSelectedRequest(request);
    setStatusForm({
      status: request.status || "viewed",
      statusNote: request.statusNote || "",
      rejectionReason: request.rejectionReason || "",
    });
    setSuccess("");
    setError("");
  };

  const updateStatus = async (e) => {
    e.preventDefault();

    if (!selectedRequest?._id) return;

    if (
      statusForm.status === "rejected" &&
      !statusForm.rejectionReason.trim() &&
      !statusForm.statusNote.trim()
    ) {
      setError("Rejection reason or status note is required.");
      return;
    }

    try {
      setUpdatingId(selectedRequest._id);
      setError("");
      setSuccess("");

      const res = await API.patch(`/sos/${selectedRequest._id}/status`, {
        status: statusForm.status,
        statusNote: statusForm.statusNote,
        rejectionReason: statusForm.rejectionReason,
      });

      setSosRequests((prev) =>
        prev.map((item) =>
          item._id === selectedRequest._id ? res.data.sosRequest : item,
        ),
      );

      setSuccess("SOS status updated successfully.");
      setSelectedRequest(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update SOS status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const quickUpdateStatus = async ({
    request,
    status,
    statusNote,
    rejectionReason = "",
    successMessage,
  }) => {
    try {
      setUpdatingId(request._id);
      setError("");
      setSuccess("");

      const res = await API.patch(`/sos/${request._id}/status`, {
        status,
        statusNote,
        rejectionReason,
      });

      setSosRequests((prev) =>
        prev.map((item) =>
          item._id === request._id ? res.data.sosRequest : item,
        ),
      );

      setSuccess(successMessage || "SOS status updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update SOS status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setStatusForm({
      status: "rejected",
      statusNote: "",
      rejectionReason: "",
    });
    setSuccess("");
    setError("");
  };

  const openUrl = (url) => {
    if (!url) {
      setError("Location link is not available for this SOS request.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatDateTime = (date) => {
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
    <div className="min-h-screen">
      <div className="mb-8 overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-xl shadow-red-100/50">
        <div className="relative bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 px-6 py-8 text-white sm:px-8">
          <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                <ShieldAlert size={18} />
                SOS Monitoring Center
              </div>

              <h1 className="text-3xl font-black sm:text-4xl">
                Emergency SOS Requests
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-red-50">
                Monitor public and patient emergency requests, accept or reject
                cases, dispatch ambulance, open location, and update handling
                status.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchSosRequests}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-red-600 shadow-lg transition hover:scale-105"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-3xl border border-white bg-white p-5 shadow-lg shadow-slate-200/70">
          <p className="text-sm font-semibold text-slate-500">Total Requests</p>
          <h2 className="mt-1 text-3xl font-black text-slate-900">
            {stats.total}
          </h2>
        </div>

        <div className="rounded-3xl border border-white bg-white p-5 shadow-lg shadow-slate-200/70">
          <p className="text-sm font-semibold text-slate-500">New</p>
          <h2 className="mt-1 text-3xl font-black text-red-600">{stats.new}</h2>
        </div>

        <div className="rounded-3xl border border-white bg-white p-5 shadow-lg shadow-slate-200/70">
          <p className="text-sm font-semibold text-slate-500">Critical</p>
          <h2 className="mt-1 text-3xl font-black text-orange-600">
            {stats.critical}
          </h2>
        </div>

        <div className="rounded-3xl border border-white bg-white p-5 shadow-lg shadow-slate-200/70">
          <p className="text-sm font-semibold text-slate-500">Accepted</p>
          <h2 className="mt-1 text-3xl font-black text-emerald-600">
            {stats.accepted}
          </h2>
        </div>

        <div className="rounded-3xl border border-white bg-white p-5 shadow-lg shadow-slate-200/70">
          <p className="text-sm font-semibold text-slate-500">Ambulance</p>
          <h2 className="mt-1 text-3xl font-black text-purple-600">
            {stats.ambulance}
          </h2>
        </div>

        <div className="rounded-3xl border border-white bg-white p-5 shadow-lg shadow-slate-200/70">
          <p className="text-sm font-semibold text-slate-500">Resolved</p>
          <h2 className="mt-1 text-3xl font-black text-emerald-600">
            {stats.resolved}
          </h2>
        </div>
      </div>

      <div className="mb-6 rounded-[2rem] border border-white bg-white p-5 shadow-xl shadow-slate-200/70">
        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Search
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
                placeholder="Name, phone, city, incident..."
                className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Status
            </label>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
            >
              <option value="">All Status</option>
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {formatStatus(item)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Severity
            </label>

            <select
              value={filters.severity}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  severity: e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
            >
              <option value="">All Severity</option>
              {severityOptions.filter(Boolean).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Requester Type
            </label>

            <select
              value={filters.requesterType}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  requesterType: e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
            >
              <option value="">All Types</option>
              <option value="guest">Guest</option>
              <option value="patient">Patient</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white bg-white p-4 shadow-xl shadow-slate-200/70 sm:p-6">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <Loader2
                className="mx-auto animate-spin text-red-600"
                size={38}
              />
              <p className="mt-3 text-sm font-semibold text-slate-500">
                Loading SOS requests...
              </p>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center text-center">
            <div>
              <AlertTriangle className="mx-auto text-slate-300" size={48} />
              <h3 className="mt-4 text-xl font-black text-slate-900">
                No SOS Requests Found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                New emergency requests will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((item) => (
              <div
                key={item._id}
                className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${
                          statusStyles[item.status] ||
                          "border-slate-200 bg-slate-100 text-slate-700"
                        }`}
                      >
                        {formatStatus(item.status)}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${
                          severityStyles[item.severity] ||
                          "border-slate-200 bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.severity}
                      </span>

                      <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black capitalize text-cyan-700">
                        {item.requesterType}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500">
                        <Clock size={13} />
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900">
                      {item.incidentType}
                    </h3>

                    <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                      <p>
                        <span className="font-bold text-slate-900">Name:</span>{" "}
                        {item.fullName || "Guest User"}
                      </p>

                      <p>
                        <span className="font-bold text-slate-900">Phone:</span>{" "}
                        {item.phone}
                      </p>

                      <p>
                        <span className="font-bold text-slate-900">City:</span>{" "}
                        {item.city || "N/A"}
                      </p>

                      <p>
                        <span className="font-bold text-slate-900">State:</span>{" "}
                        {item.state || "N/A"}
                      </p>

                      <p>
                        <span className="font-bold text-slate-900">
                          Address:
                        </span>{" "}
                        {item.manualAddress || "Live location used"}
                      </p>

                      <p>
                        <span className="font-bold text-slate-900">
                          Accuracy:
                        </span>{" "}
                        {item.location?.accuracy
                          ? `${Math.round(item.location.accuracy)} meters`
                          : "N/A"}
                      </p>
                    </div>

                    {item.description && (
                      <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
                        <span className="font-bold text-slate-900">
                          Description:
                        </span>{" "}
                        {item.description}
                      </div>
                    )}

                    {item.statusNote && (
                      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
                        <span className="font-bold">Status Note:</span>{" "}
                        {item.statusNote}
                      </div>
                    )}

                    {item.acceptedByHospital && (
                      <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm leading-6 text-cyan-700">
                        <span className="font-bold">Accepted By:</span>{" "}
                        {item.acceptedByHospital.name}
                        {item.acceptedByHospital.city
                          ? `, ${item.acceptedByHospital.city}`
                          : ""}
                      </div>
                    )}

                    {item.rejectionReason && (
                      <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm leading-6 text-rose-700">
                        <span className="font-bold">Rejection Reason:</span>{" "}
                        {item.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="grid min-w-full gap-3 sm:grid-cols-2 xl:min-w-[300px] xl:grid-cols-1">
                    <a
                      href={`tel:${item.phone}`}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
                    >
                      <Phone size={17} />
                      Call Requester
                    </a>

                    <button
                      type="button"
                      onClick={() => openUrl(item.mapsLocationUrl)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800"
                    >
                      <MapPin size={17} />
                      Open Location
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openUrl(item.nearestSearchLinks?.hospitals)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-700 transition hover:bg-cyan-100"
                    >
                      <ExternalLink size={17} />
                      Nearby Hospitals
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        quickUpdateStatus({
                          request: item,
                          status: "accepted",
                          statusNote:
                            "Emergency request accepted by hospital/admin.",
                          successMessage: "Emergency request accepted.",
                        })
                      }
                      disabled={
                        updatingId === item._id ||
                        item.status === "accepted" ||
                        item.status === "resolved" ||
                        item.status === "cancelled"
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle size={17} />
                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        quickUpdateStatus({
                          request: item,
                          status: "ambulance_dispatched",
                          statusNote:
                            "Ambulance dispatched for emergency support.",
                          successMessage: "Ambulance dispatch status updated.",
                        })
                      }
                      disabled={
                        updatingId === item._id ||
                        item.status === "resolved" ||
                        item.status === "cancelled" ||
                        item.status === "rejected"
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-black text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Ambulance size={17} />
                      Dispatch Ambulance
                    </button>

                    <button
                      type="button"
                      onClick={() => openRejectModal(item)}
                      disabled={
                        updatingId === item._id ||
                        item.status === "resolved" ||
                        item.status === "cancelled" ||
                        item.status === "rejected"
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <XCircle size={17} />
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => openStatusModal(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-black text-orange-700 transition hover:bg-orange-100"
                    >
                      <Eye size={17} />
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-2xl font-black text-slate-900">
                Update SOS Status
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedRequest.incidentType} • {selectedRequest.phone}
              </p>
            </div>

            <form onSubmit={updateStatus} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Status
                </label>

                <select
                  value={statusForm.status}
                  onChange={(e) =>
                    setStatusForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                >
                  {statusOptions.map((item) => (
                    <option key={item} value={item}>
                      {formatStatus(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Status Note
                </label>

                <textarea
                  value={statusForm.statusNote}
                  onChange={(e) =>
                    setStatusForm((prev) => ({
                      ...prev,
                      statusNote: e.target.value,
                    }))
                  }
                  rows="4"
                  placeholder="Example: Patient contacted and nearest hospital informed."
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                />
              </div>

              {statusForm.status === "rejected" && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Rejection Reason *
                  </label>

                  <textarea
                    value={statusForm.rejectionReason}
                    onChange={(e) =>
                      setStatusForm((prev) => ({
                        ...prev,
                        rejectionReason: e.target.value,
                      }))
                    }
                    rows="3"
                    placeholder="Example: No emergency bed available right now."
                    className="w-full resize-none rounded-2xl border border-rose-200 px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingId === selectedRequest._id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {updatingId === selectedRequest._id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SosRequests;
