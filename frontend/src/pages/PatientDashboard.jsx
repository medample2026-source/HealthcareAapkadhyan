import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  FileText,
  HeartPulse,
  Hospital,
  Activity,
  Clock,
  Loader2,
  RefreshCcw,
  Stethoscope,
  Video,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import API from "../api/axios";

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/appointments/my-appointments");
      setAppointments(res.data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const upcomingAppointments = appointments.filter((item) =>
      ["pending", "accepted"].includes(item.status),
    );

    const completedAppointments = appointments.filter(
      (item) => item.status === "completed",
    );

    const pendingAppointments = appointments.filter(
      (item) => item.status === "pending",
    );

    return [
      {
        title: "Upcoming Appointments",
        value: upcomingAppointments.length,
        icon: CalendarCheck,
        desc: "Pending or accepted visits",
      },
      {
        title: "Pending Requests",
        value: pendingAppointments.length,
        icon: FileText,
        desc: "Waiting for doctor response",
      },
      {
        title: "Completed Visits",
        value: completedAppointments.length,
        icon: HeartPulse,
        desc: "Finished consultations",
      },
      {
        title: "Total Bookings",
        value: appointments.length,
        icon: Hospital,
        desc: "All appointment records",
      },
    ];
  }, [appointments]);

  const recentAppointments = appointments.slice(0, 5);

  const todaySchedule = useMemo(() => {
    const today = new Date().toDateString();

    return appointments.filter((item) => {
      if (!item.appointmentDate) return false;

      const appointmentDate = new Date(item.appointmentDate).toDateString();

      return (
        appointmentDate === today &&
        ["pending", "accepted"].includes(item.status)
      );
    });
  }, [appointments]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-100">
              Patient Dashboard
            </p>

            <h2 className="text-3xl font-bold">
              Your health, organized smartly.
            </h2>

            <p className="mt-3 text-cyan-50">
              Track appointments, doctor responses, reports, hospitals, and
              emergency support from one secure dashboard.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/20 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/30"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[350px] items-center justify-center">
          <Loader2 className="animate-spin text-cyan-600" size={44} />
        </div>
      ) : (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                    <Icon />
                  </div>

                  <h3 className="text-sm font-semibold text-slate-500">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {item.value}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Activity className="text-cyan-600" />
                  <h3 className="text-xl font-bold text-slate-900">
                    Recent Appointment Activity
                  </h3>
                </div>

                <Link
                  to="/patient-dashboard/appointments"
                  className="rounded-full bg-cyan-50 px-4 py-2 text-xs font-black text-cyan-700 transition hover:bg-cyan-100"
                >
                  View All
                </Link>
              </div>

              {recentAppointments.length === 0 ? (
                <EmptyState text="No appointment activity found yet." />
              ) : (
                <div className="space-y-4">
                  {recentAppointments.map((item) => (
                    <AppointmentActivity key={item._id} appointment={item} />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <Clock className="text-emerald-600" />
                <h3 className="text-xl font-bold text-slate-900">
                  Today&apos;s Schedule
                </h3>
              </div>

              {todaySchedule.length === 0 ? (
                <EmptyState text="No appointment scheduled for today." />
              ) : (
                <div className="space-y-4">
                  {todaySchedule.map((item) => (
                    <TodayScheduleItem key={item._id} appointment={item} />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <Stethoscope className="text-cyan-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Quick Actions
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <QuickAction to="/doctors" label="Find Doctors" />
              <QuickAction
                to="/patient-dashboard/appointments"
                label="My Appointments"
              />
              <QuickAction to="/patient-dashboard/reports" label="My Reports" />
              <QuickAction
                to="/patient-dashboard/profile"
                label="Update Profile"
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const AppointmentActivity = ({ appointment }) => {
  const doctorName = appointment.doctor?.user?.fullName || "Doctor";
  const specialization = appointment.doctor?.specialization || "Specialist";

  const date = appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold text-slate-800">Dr. {doctorName}</p>
          <p className="mt-1 text-sm text-cyan-700">{specialization}</p>
        </div>

        <StatusBadge status={appointment.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={14} />
          {date}
        </span>

        <span className="inline-flex items-center gap-1">
          <Clock size={14} />
          {appointment.appointmentTime}
        </span>

        <span className="inline-flex items-center gap-1 capitalize">
          {appointment.consultationMode === "online" ? (
            <Video size={14} />
          ) : (
            <Building2 size={14} />
          )}
          {appointment.consultationMode}
        </span>
      </div>
    </div>
  );
};

const TodayScheduleItem = ({ appointment }) => {
  const doctorName = appointment.doctor?.user?.fullName || "Doctor";

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div>
        <p className="font-semibold text-slate-700">Dr. {doctorName}</p>
        <p className="mt-1 text-sm text-slate-500 capitalize">
          {appointment.consultationMode} consultation
        </p>
      </div>

      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
        {appointment.appointmentTime}
      </span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      icon: <AlertCircle size={13} />,
      className: "bg-orange-100 text-orange-700",
    },
    accepted: {
      icon: <CheckCircle size={13} />,
      className: "bg-emerald-100 text-emerald-700",
    },
    rejected: {
      icon: <XCircle size={13} />,
      className: "bg-red-100 text-red-700",
    },
    completed: {
      icon: <CheckCircle size={13} />,
      className: "bg-violet-100 text-violet-700",
    },
    cancelled: {
      icon: <XCircle size={13} />,
      className: "bg-slate-100 text-slate-600",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black capitalize ${config.className}`}
    >
      {config.icon}
      {status}
    </span>
  );
};

const QuickAction = ({ to, label }) => {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-center text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
    >
      {label}
    </Link>
  );
};

const EmptyState = ({ text }) => {
  return (
    <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 p-8 text-center">
      <CalendarCheck className="mx-auto mb-3 text-cyan-600" size={38} />
      <p className="text-sm font-bold text-slate-500">{text}</p>
    </div>
  );
};

export default PatientDashboard;
