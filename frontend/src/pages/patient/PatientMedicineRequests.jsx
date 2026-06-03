import { useEffect, useState } from "react";
import {
  Pill,
  Store,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  AlertCircle,
  Loader2,
  MessageSquare,
  BadgeIndianRupee,
} from "lucide-react";
import API from "../../api/axios";

const PatientMedicineRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/medicine-requests/my-requests");

      setRequests(res.data.requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load your medicine requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur">
            <Pill size={18} />
            My Medicine Requests
          </div>

          <h1 className="text-3xl font-black">Track Your Medicine Requests</h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-50">
            Check whether your medicine inquiry is pending, accepted, rejected,
            or completed by the medical store.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-900">Request History</h2>
          <p className="text-sm text-slate-500">
            Your latest medicine inquiries from nearby medical stores.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600">
              <Loader2 className="animate-spin text-cyan-600" />
              Loading your requests...
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <Pill className="mx-auto text-slate-400" size={44} />

            <h3 className="mt-4 text-lg font-black text-slate-800">
              No medicine requests yet
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              When you request medicine from the public medicine search page,
              your request status will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {requests.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RequestCard = ({ request }) => {
  const store = request.medicalStore;
  const medicine = request.medicine;

  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-lg">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />

            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
              Qty: {request.requestedQuantity || 1}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {new Date(request.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <Pill />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                {request.medicineName}
              </h3>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                {medicine?.brandName || "No brand"}
                {medicine?.strength ? ` • ${medicine.strength}` : ""}
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Category: {medicine?.category || "N/A"}
              </p>
            </div>
          </div>

          {request.message && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="flex gap-2 text-sm leading-6 text-slate-600">
                <MessageSquare
                  size={17}
                  className="mt-1 shrink-0 text-cyan-600"
                />
                <span>{request.message}</span>
              </p>
            </div>
          )}

          {request.ownerNote && (
            <div className="mt-4 rounded-2xl bg-cyan-50 p-4">
              <p className="text-sm font-black text-cyan-800">Store Response</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-cyan-700">
                {request.ownerNote}
              </p>
            </div>
          )}
        </div>

        <div className="w-full rounded-3xl bg-gradient-to-br from-cyan-50 to-emerald-50 p-5 lg:w-[340px]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm">
              <Store />
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900">
                {store?.storeName || "Medical Store"}
              </h4>

              <p className="text-sm font-semibold text-slate-500">
                {store?.storeType || "Store"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <InfoLine
              icon={<Phone size={16} />}
              text={store?.phone || "Phone not available"}
            />

            <InfoLine
              icon={<MapPin size={16} />}
              text={
                store
                  ? `${store.address || ""}, ${store.city || ""}, ${
                      store.state || ""
                    } - ${store.pincode || ""}`
                  : "Address not available"
              }
            />

            <InfoLine
              icon={<BadgeIndianRupee size={16} />}
              text={`Price: ₹${medicine?.price || 0}`}
            />
          </div>

          {store?.phone && (
            <a
              href={`tel:${store.phone}`}
              className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              <Phone size={17} />
              Call Store
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    pending: {
      label: "Pending",
      icon: <Clock size={14} />,
      className: "bg-orange-50 text-orange-700",
    },
    accepted: {
      label: "Accepted",
      icon: <CheckCircle2 size={14} />,
      className: "bg-emerald-50 text-emerald-700",
    },
    rejected: {
      label: "Rejected",
      icon: <XCircle size={14} />,
      className: "bg-red-50 text-red-700",
    },
    completed: {
      label: "Completed",
      icon: <PackageCheck size={14} />,
      className: "bg-cyan-50 text-cyan-700",
    },
    cancelled: {
      label: "Cancelled",
      icon: <XCircle size={14} />,
      className: "bg-slate-100 text-slate-700",
    },
  };

  const item = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${item.className}`}
    >
      {item.icon}
      {item.label}
    </span>
  );
};

const InfoLine = ({ icon, text }) => {
  return (
    <div className="flex items-start gap-2 text-sm font-semibold leading-6 text-slate-600">
      <span className="mt-1 shrink-0 text-cyan-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
};

export default PatientMedicineRequests;
