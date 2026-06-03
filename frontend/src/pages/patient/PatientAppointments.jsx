import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock,
  Stethoscope,
  Loader2,
  XCircle,
  CheckCircle,
  AlertCircle,
  Video,
  Building2,
  IndianRupee,
  RefreshCcw,
  CalendarDays,
  FileText,
} from "lucide-react";
import API from "../../api/axios";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.get("/appointments/my-appointments");
      setAppointments(res.data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );

    if (!confirmCancel) return;

    try {
      setActionLoading(appointmentId);
      setError("");
      setMessage("");

      await API.patch(`/appointments/cancel/${appointmentId}`);

      setMessage("Appointment cancelled successfully");
      await fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter((item) => item.status === "pending").length,
    accepted: appointments.filter((item) => item.status === "accepted").length,
    completed: appointments.filter((item) => item.status === "completed")
      .length,
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-100">
              Patient Appointments
            </p>

            <h1 className="text-3xl font-black md:text-4xl">
              Manage your doctor appointments
            </h1>

            <p className="mt-3 max-w-2xl text-cyan-50">
              View appointment requests, doctor responses, online meeting links,
              notes, and appointment status.
            </p>
          </div>

          <button
            onClick={fetchAppointments}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/20 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/30"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CalendarCheck />}
          title="Total"
          value={stats.total}
          color="from-cyan-500 to-blue-500"
        />
        <StatCard
          icon={<Clock />}
          title="Pending"
          value={stats.pending}
          color="from-orange-500 to-amber-500"
        />
        <StatCard
          icon={<CheckCircle />}
          title="Accepted"
          value={stats.accepted}
          color="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon={<CalendarDays />}
          title="Completed"
          value={stats.completed}
          color="from-violet-500 to-indigo-500"
        />
      </section>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900">
            My Appointment Requests
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track all your doctor consultation requests in one place.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-cyan-600" size={40} />
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-cyan-200 bg-cyan-50/60 p-10 text-center">
            <Stethoscope className="mx-auto mb-4 text-cyan-600" size={46} />
            <h3 className="text-xl font-black text-slate-900">
              No appointments found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Book a doctor appointment from the public doctors page.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                actionLoading={actionLoading}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const AppointmentCard = ({ appointment, actionLoading, onCancel }) => {
  const doctorName = appointment.doctor?.user?.fullName || "Doctor";
  const specialization = appointment.doctor?.specialization || "Specialist";

  const date = appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";

  const canCancel = ["pending", "accepted"].includes(appointment.status);

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <Stethoscope size={28} />
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">
                Dr. {doctorName}
              </h3>

              <StatusBadge status={appointment.status} />
            </div>

            <p className="text-sm font-bold text-cyan-700">{specialization}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SmallInfo
                icon={<CalendarDays size={16} />}
                label="Date"
                value={date}
              />

              <SmallInfo
                icon={<Clock size={16} />}
                label="Time"
                value={appointment.appointmentTime}
              />

              <SmallInfo
                icon={
                  appointment.consultationMode === "online" ? (
                    <Video size={16} />
                  ) : (
                    <Building2 size={16} />
                  )
                }
                label="Mode"
                value={appointment.consultationMode}
              />

              {appointment.doctor?.consultationFee && (
                <SmallInfo
                  icon={<IndianRupee size={16} />}
                  label="Fee"
                  value={`₹${appointment.doctor.consultationFee}`}
                />
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
                <FileText size={16} />
                Reason / Symptoms
              </div>
              <p className="text-sm leading-6 text-slate-600">
                {appointment.reason}
              </p>
            </div>

            {appointment.doctorNote && (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                <p className="mb-1 text-sm font-black text-emerald-800">
                  Doctor Note
                </p>
                <p className="text-sm leading-6 text-emerald-700">
                  {appointment.doctorNote}
                </p>
              </div>
            )}

            {appointment.meetingLink && (
              <a
                href={appointment.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700"
              >
                <Video size={17} />
                Join Online Consultation
              </a>
            )}
          </div>
        </div>

        {canCancel && (
          <button
            onClick={() => onCancel(appointment._id)}
            disabled={actionLoading === appointment._id}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-60"
          >
            {actionLoading === appointment._id ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <XCircle size={17} />
            )}
            Cancel
          </button>
        )}
      </div>
    </article>
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

const SmallInfo = ({ icon, label, value }) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
        <span className="text-cyan-600">{icon}</span>
        {label}
      </div>
      <p className="text-sm font-bold capitalize text-slate-700">
        {value || "Not set"}
      </p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-orange-100 text-orange-700",
    accepted: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-violet-100 text-violet-700",
    cancelled: "bg-slate-100 text-slate-600",
  };

  const icons = {
    pending: <AlertCircle size={14} />,
    accepted: <CheckCircle size={14} />,
    rejected: <XCircle size={14} />,
    completed: <CheckCircle size={14} />,
    cancelled: <XCircle size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black capitalize ${
        styles[status] || styles.pending
      }`}
    >
      {icons[status] || icons.pending}
      {status}
    </span>
  );
};

export default PatientAppointments;
