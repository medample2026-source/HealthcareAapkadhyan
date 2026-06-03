import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BedDouble,
  CalendarCheck,
  Users,
  Building2,
  Activity,
  AlertTriangle,
  UserCheck,
  Clock,
  Loader2,
  RefreshCcw,
  Ambulance,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Hospital,
} from "lucide-react";
import API from "../api/axios";

const HospitalDashboard = () => {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHospitalProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/hospitals/profile/me");
      setHospital(res.data.hospital);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(
          "Hospital profile not found. Please create your hospital profile first.",
        );
      } else {
        setError(
          err.response?.data?.message || "Failed to load hospital dashboard",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalProfile();
  }, []);

  const stats = useMemo(() => {
    return [
      {
        title: "Available Beds",
        value: hospital?.availableBeds ?? 0,
        icon: BedDouble,
        desc: `Out of ${hospital?.totalBeds ?? 0} total beds`,
      },
      {
        title: "Available ICU Beds",
        value: hospital?.availableIcuBeds ?? 0,
        icon: ShieldCheck,
        desc: `Out of ${hospital?.icuBeds ?? 0} ICU beds`,
      },
      {
        title: "Services",
        value: hospital?.services?.length ?? 0,
        icon: UserCheck,
        desc: "Hospital services listed",
      },
      {
        title: "Facilities",
        value: hospital?.facilities?.length ?? 0,
        icon: Users,
        desc: "Available hospital facilities",
      },
    ];
  }, [hospital]);

  const departmentStatus = useMemo(() => {
    return [
      {
        name: "Emergency",
        value: hospital?.emergencyAvailable ? "Available" : "Not Available",
      },
      {
        name: "ICU",
        value: `${hospital?.availableIcuBeds ?? 0} Beds Free`,
      },
      {
        name: "General Ward",
        value: `${hospital?.availableBeds ?? 0} Beds Free`,
      },
      {
        name: "Ambulance",
        value: hospital?.ambulanceAvailable ? "Available" : "Not Available",
      },
      {
        name: "24x7 Service",
        value: hospital?.open24x7 ? "Open" : "Limited Hours",
      },
    ];
  }, [hospital]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-100">
              Hospital Admin Dashboard
            </p>

            <h2 className="text-3xl font-bold">
              Manage hospital operations in real time.
            </h2>

            <p className="mt-3 max-w-3xl text-cyan-50">
              Track beds, ICU availability, emergency support, ambulance
              availability, services, and hospital profile status.
            </p>
          </div>

          <button
            onClick={fetchHospitalProfile}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/20 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/30"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-red-700">{error}</p>

            <Link
              to="/hospital-dashboard/profile"
              className="rounded-2xl bg-red-100 px-5 py-3 text-center text-sm font-black text-red-700 transition hover:bg-red-200"
            >
              Create / Update Profile
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[350px] items-center justify-center">
          <Loader2 className="animate-spin text-cyan-600" size={44} />
        </div>
      ) : (
        hospital && (
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

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl lg:col-span-2">
                <div className="mb-5 flex items-center gap-3">
                  <Building2 className="text-cyan-600" />
                  <h3 className="text-xl font-bold text-slate-900">
                    Hospital Status
                  </h3>
                </div>

                <div className="space-y-4">
                  {departmentStatus.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <p className="font-bold text-slate-800">{item.name}</p>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
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
                    to="/hospital-dashboard/profile"
                    label="Update bed availability"
                  />
                  <QuickAction
                    to="/hospital-dashboard/profile"
                    label="Update emergency status"
                  />
                  <QuickAction
                    to="/hospital-dashboard/profile"
                    label="Manage services"
                  />
                  <QuickAction
                    to="/hospital-dashboard/profile"
                    label="Edit hospital profile"
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div
                className={`rounded-[1.5rem] border p-5 ${
                  hospital.emergencyAvailable
                    ? "border-emerald-100 bg-emerald-50"
                    : "border-red-100 bg-red-50"
                }`}
              >
                <div className="flex gap-3">
                  {hospital.emergencyAvailable ? (
                    <CheckCircle className="mt-1 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="mt-1 text-red-600" />
                  )}

                  <div>
                    <h3
                      className={`font-bold ${
                        hospital.emergencyAvailable
                          ? "text-emerald-800"
                          : "text-red-800"
                      }`}
                    >
                      Emergency Availability
                    </h3>

                    <p
                      className={`mt-1 text-sm ${
                        hospital.emergencyAvailable
                          ? "text-emerald-700"
                          : "text-red-700"
                      }`}
                    >
                      {hospital.emergencyAvailable
                        ? "Emergency support is currently available for patients."
                        : "Emergency support is currently not available. Update this if emergency service starts."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-3">
                  <Clock className="text-cyan-600" />
                  <h3 className="font-bold text-slate-900">Recent Updates</h3>
                </div>

                <p className="text-sm text-slate-600">
                  Hospital profile last updated on{" "}
                  <span className="font-bold text-slate-800">
                    {hospital.updatedAt
                      ? new Date(hospital.updatedAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Not available"}
                  </span>
                  .
                </p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <InfoCard
                icon={<Hospital />}
                title={hospital.name}
                lines={[
                  hospital.hospitalType,
                  `${hospital.city}, ${hospital.state}`,
                  hospital.contactNumber,
                ]}
              />

              <InfoCard
                icon={<Ambulance />}
                title="Live Availability"
                lines={[
                  hospital.open24x7 ? "Open 24x7" : "Limited working hours",
                  hospital.ambulanceAvailable
                    ? "Ambulance available"
                    : "Ambulance not available",
                  hospital.emergencyAvailable
                    ? "Emergency available"
                    : "Emergency not available",
                ]}
              />
            </section>
          </>
        )
      )}
    </div>
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

const InfoCard = ({ icon, title, lines }) => {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
          {icon}
        </div>

        <h3 className="text-lg font-black text-slate-900">{title}</h3>
      </div>

      <div className="space-y-2">
        {lines.map((line) => (
          <p key={line} className="text-sm font-semibold text-slate-600">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default HospitalDashboard;
