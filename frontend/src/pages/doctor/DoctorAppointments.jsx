import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock,
  User,
  Mail,
  Phone,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  Building2,
  RefreshCcw,
  CalendarDays,
  FileText,
  MessageSquare,
  Link as LinkIcon,
  Send,
  ClipboardCheck,
} from "lucide-react";
import API from "../../api/axios";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionType, setActionType] = useState("");
  const [doctorNote, setDoctorNote] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.get("/appointments/doctor");
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

  const openActionModal = (appointment, type) => {
    setSelectedAppointment(appointment);
    setActionType(type);
    setDoctorNote(appointment.doctorNote || "");
    setMeetingLink(appointment.meetingLink || "");
    setError("");
    setMessage("");
  };

  const closeActionModal = () => {
    setSelectedAppointment(null);
    setActionType("");
    setDoctorNote("");
    setMeetingLink("");
  };

  const handleStatusUpdate = async () => {
    if (!selectedAppointment || !actionType) return;

    try {
      setActionLoading(selectedAppointment._id);
      setError("");
      setMessage("");

      const payload = {
        status: actionType,
        doctorNote,
      };

      if (meetingLink.trim()) {
        payload.meetingLink = meetingLink.trim();
      }

      await API.patch(
        `/appointments/doctor/status/${selectedAppointment._id}`,
        payload,
      );

      setMessage(`Appointment ${actionType} successfully`);
      closeActionModal();
      await fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update appointment");
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
              Doctor Appointments
            </p>

            <h1 className="text-3xl font-black md:text-4xl">
              Manage patient appointment requests
            </h1>

            <p className="mt-3 max-w-2xl text-cyan-50">
              Review patient symptoms, accept or reject requests, add meeting
              links, and mark consultations as completed.
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
          icon={<ClipboardCheck />}
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
            Patient Requests
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View and manage appointment requests from patients.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-cyan-600" size={40} />
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-cyan-200 bg-cyan-50/60 p-10 text-center">
            <CalendarCheck className="mx-auto mb-4 text-cyan-600" size={46} />
            <h3 className="text-xl font-black text-slate-900">
              No appointment requests found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              New patient requests will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {appointments.map((appointment) => (
              <DoctorAppointmentCard
                key={appointment._id}
                appointment={appointment}
                actionLoading={actionLoading}
                onAction={openActionModal}
              />
            ))}
          </div>
        )}
      </section>

      {selectedAppointment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="mb-6">
              <p className="mb-2 text-sm font-black uppercase tracking-wide text-cyan-700">
                Appointment Action
              </p>

              <h2 className="text-2xl font-black capitalize text-slate-900">
                {actionType} appointment
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Patient: {selectedAppointment.patient?.fullName || "Patient"}
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <MessageSquare size={16} />
                  Doctor Note
                </label>

                <textarea
                  value={doctorNote}
                  onChange={(e) => setDoctorNote(e.target.value)}
                  rows="4"
                  placeholder={
                    actionType === "accepted"
                      ? "Example: Appointment accepted. Please join on time."
                      : actionType === "rejected"
                        ? "Example: Sorry, I am not available at this time."
                        : "Example: Consultation completed successfully."
                  }
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              {actionType === "accepted" &&
                selectedAppointment.consultationMode === "online" && (
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <LinkIcon size={16} />
                      Online Meeting Link
                    </label>

                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/your-link"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                    />
                  </div>
                )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="flex-1 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={actionLoading === selectedAppointment._id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-100 transition hover:scale-[1.01] disabled:opacity-60"
                >
                  {actionLoading === selectedAppointment._id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DoctorAppointmentCard = ({ appointment, actionLoading, onAction }) => {
  const patientName = appointment.patient?.fullName || "Patient";

  const date = appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <User size={28} />
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">
                {patientName}
              </h3>

              <StatusBadge status={appointment.status} />
            </div>

            <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
              {appointment.patient?.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail size={15} />
                  {appointment.patient.email}
                </span>
              )}

              {appointment.patient?.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone size={15} />
                  {appointment.patient.phone}
                </span>
              )}
            </div>

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
                  Your Note
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
                Open Meeting Link
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 xl:justify-end">
          {appointment.status === "pending" && (
            <>
              <button
                onClick={() => onAction(appointment, "accepted")}
                disabled={actionLoading === appointment._id}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
              >
                <CheckCircle size={17} />
                Accept
              </button>

              <button
                onClick={() => onAction(appointment, "rejected")}
                disabled={actionLoading === appointment._id}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-60"
              >
                <XCircle size={17} />
                Reject
              </button>
            </>
          )}

          {appointment.status === "accepted" && (
            <button
              onClick={() => onAction(appointment, "completed")}
              disabled={actionLoading === appointment._id}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-50 px-5 py-3 text-sm font-black text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
            >
              <ClipboardCheck size={17} />
              Mark Completed
            </button>
          )}
        </div>
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
    completed: <ClipboardCheck size={14} />,
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

export default DoctorAppointments;
