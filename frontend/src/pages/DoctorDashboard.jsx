import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Users,
  FileText,
  Stethoscope,
  Activity,
  Clock,
  Video,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  RefreshCcw,
  Building2,
  User,
} from "lucide-react";
import API from "../api/axios";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/appointments/doctor");
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

  const dashboardStats = useMemo(() => {
    const today = new Date().toDateString();

    const todayAppointments = appointments.filter((item) => {
      if (!item.appointmentDate) return false;
      return new Date(item.appointmentDate).toDateString() === today;
    });

    const uniquePatients = new Set(
      appointments.map((item) => item.patient?._id).filter(Boolean),
    );

    const pendingAppointments = appointments.filter(
      (item) => item.status === "pending",
    );

    const completedAppointments = appointments.filter(
      (item) => item.status === "completed",
    );

    return [
      {
        title: "Today Appointments",
        value: todayAppointments.length,
        icon: CalendarCheck,
        desc: "Patients scheduled today",
      },
      {
        title: "Active Patients",
        value: uniquePatients.size,
        icon: Users,
        desc: "Unique patients connected",
      },
      {
        title: "Pending Requests",
        value: pendingAppointments.length,
        icon: FileText,
        desc: "Appointments waiting approval",
      },
      {
        title: "Consultations",
        value: completedAppointments.length,
        icon: Stethoscope,
        desc: "Completed consultations",
      },
    ];
  }, [appointments]);

  const todayAppointments = useMemo(() => {
    const today = new Date().toDateString();

    return appointments
      .filter((item) => {
        if (!item.appointmentDate) return false;
        return new Date(item.appointmentDate).toDateString() === today;
      })
      .slice(0, 5);
  }, [appointments]);

  const recentAppointments = appointments.slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-100">
              Doctor Dashboard
            </p>

            <h2 className="text-3xl font-bold">
              Manage patients, reports, and consultations.
            </h2>

            <p className="mt-3 text-cyan-50">
              View appointments, review uploaded reports, track patient
              activity, and manage your daily healthcare workflow.
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
            {dashboardStats.map((item) => {
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

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl lg:col-span-2">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Clock className="text-cyan-600" />
                  <h3 className="text-xl font-bold text-slate-900">
                    Today&apos;s Appointments
                  </h3>
                </div>

                <Link
                  to="/doctor-dashboard/appointments"
                  className="rounded-full bg-cyan-50 px-4 py-2 text-xs font-black text-cyan-700 transition hover:bg-cyan-100"
                >
                  View All
                </Link>
              </div>

              {todayAppointments.length === 0 ? (
                <EmptyState text="No appointments scheduled for today." />
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((item) => (
                    <AppointmentRow key={item._id} appointment={item} />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <Activity className="text-emerald-600" />
                <h3 className="text-xl font-bold text-slate-900">
                  Quick Actions
                </h3>
              </div>

              <div className="space-y-3">
                <QuickAction
                  to="/doctor-dashboard/appointments"
                  label="Manage appointments"
                />
                <QuickAction
                  to="/doctor-dashboard/reports"
                  label="Review patient reports"
                />
                <QuickAction
                  to="/doctor-dashboard/profile"
                  label="Update availability"
                />
                <QuickAction
                  to="/doctor-dashboard/profile"
                  label="Edit professional profile"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl lg:col-span-2">
              <div className="mb-5 flex items-center gap-3">
                <CalendarCheck className="text-cyan-600" />
                <h3 className="text-xl font-bold text-slate-900">
                  Recent Appointment Activity
                </h3>
              </div>

              {recentAppointments.length === 0 ? (
                <EmptyState text="No appointment activity found yet." />
              ) : (
                <div className="space-y-4">
                  {recentAppointments.map((item) => (
                    <AppointmentRow key={item._id} appointment={item} />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50 p-5">
              <div className="flex gap-3">
                <AlertCircle className="mt-1 text-orange-600" />
                <div>
                  <h3 className="font-bold text-orange-800">
                    Appointment Priority Notice
                  </h3>
                  <p className="mt-1 text-sm text-orange-700">
                    Review pending appointment requests regularly so patients
                    receive timely confirmation.
                  </p>

                  <Link
                    to="/doctor-dashboard/appointments"
                    className="mt-4 inline-flex rounded-2xl bg-orange-100 px-4 py-2 text-sm font-black text-orange-700 transition hover:bg-orange-200"
                  >
                    Review Requests
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const AppointmentRow = ({ appointment }) => {
  const patientName = appointment.patient?.fullName || "Patient";

  const date = appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[1fr_auto]">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm">
          <User size={21} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-slate-800">{patientName}</p>
            <StatusBadge status={appointment.status} />
          </div>

          <p className="mt-1 line-clamp-1 text-sm text-slate-500">
            {appointment.reason}
          </p>

          <p className="mt-1 text-xs font-bold text-slate-400">{date}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
          {appointment.appointmentTime}
        </span>

        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">
          {appointment.consultationMode === "online" ? (
            <Video size={13} />
          ) : (
            <Building2 size={13} />
          )}
          {appointment.consultationMode}
        </span>
      </div>
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
      icon: <ClipboardCheck size={13} />,
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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black capitalize ${config.className}`}
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
      className="block w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
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

export default DoctorDashboard;
