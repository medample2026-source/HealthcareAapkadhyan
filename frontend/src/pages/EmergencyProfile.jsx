import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Droplet,
  HeartPulse,
  Loader2,
  Phone,
  ShieldCheck,
  User,
  Pill,
  FileWarning,
  Activity,
} from "lucide-react";
import API from "../api/axios";

const EmergencyProfile = () => {
  const { patientId } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEmergencyProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/patients/emergency/${patientId}`);
      setProfile(res.data.emergencyProfile);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load emergency profile",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyProfile();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 via-white to-cyan-50">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 via-white to-cyan-50 px-5">
        <div className="max-w-xl rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-xl">
          <AlertTriangle className="mx-auto mb-4 text-red-600" size={56} />

          <h1 className="text-3xl font-black text-slate-900">
            Emergency Profile Not Found
          </h1>

          <p className="mt-3 text-sm font-semibold text-slate-500">
            {error || "This emergency health profile is not available."}
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-cyan-50 px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-red-50 hover:text-red-700"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <section className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-red-100">
          <div className="bg-gradient-to-r from-red-600 to-orange-500 p-8 text-white md:p-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-black uppercase tracking-wide text-white backdrop-blur-xl">
                  <AlertTriangle size={17} />
                  Emergency Health Profile
                </p>

                <h1 className="text-4xl font-black md:text-6xl">
                  {profile.fullName || "Patient"}
                </h1>

                <p className="mt-4 max-w-2xl text-red-50">
                  This page contains emergency-safe medical information to help
                  first responders, doctors, or hospital staff during urgent
                  situations.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white/15 p-5 backdrop-blur-xl">
                <p className="text-sm font-bold text-red-50">Patient ID</p>
                <p className="mt-1 text-2xl font-black">{profile.patientId}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                  icon={<User />}
                  title="Age"
                  value={profile.age || "Not added"}
                />

                <InfoCard
                  icon={<BadgeCheck />}
                  title="Gender"
                  value={profile.gender || "Not added"}
                />

                <InfoCard
                  icon={<Droplet />}
                  title="Blood Group"
                  value={profile.bloodGroup || "Not added"}
                  danger
                />

                <InfoCard
                  icon={<Phone />}
                  title="Phone"
                  value={profile.phone || "Not added"}
                />
              </section>

              <section className="rounded-[2rem] border border-red-100 bg-red-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                    <ShieldCheck />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-red-900">
                      Emergency Contact
                    </h2>
                    <p className="text-sm font-semibold text-red-700">
                      Contact this person immediately in emergency.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <EmergencyContactBox
                    label="Name"
                    value={profile.emergencyContactName || "Not added"}
                  />
                  <EmergencyContactBox
                    label="Relation"
                    value={profile.emergencyContactRelation || "Not added"}
                  />
                  <EmergencyContactBox
                    label="Number"
                    value={profile.emergencyContactNumber || "Not added"}
                    phone
                  />
                </div>
              </section>

              <section className="grid gap-6 md:grid-cols-2">
                <HealthList
                  icon={<HeartPulse />}
                  title="Medical Conditions"
                  items={profile.medicalConditions || []}
                />

                <HealthList
                  icon={<FileWarning />}
                  title="Allergies"
                  items={profile.allergies || []}
                  danger
                />

                <HealthList
                  icon={<Pill />}
                  title="Current Medications"
                  items={profile.currentMedications || []}
                />
              </section>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-orange-100 bg-orange-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <AlertTriangle className="text-orange-600" />
                  <h3 className="text-xl font-black text-orange-900">
                    Emergency Notice
                  </h3>
                </div>

                <p className="text-sm font-semibold leading-6 text-orange-700">
                  This information is shared for emergency assistance only.
                  Always confirm medical decisions with a qualified doctor.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <Activity className="text-cyan-600" />
                  <h3 className="text-xl font-black text-slate-900">
                    Quick Summary
                  </h3>
                </div>

                <SummaryLine label="Patient" value={profile.fullName} />
                <SummaryLine label="Blood" value={profile.bloodGroup} />
                <SummaryLine
                  label="Emergency Contact"
                  value={profile.emergencyContactNumber}
                />
                <SummaryLine
                  label="Allergies"
                  value={
                    profile.allergies?.length
                      ? `${profile.allergies.length} listed`
                      : "None listed"
                  }
                />
              </div>

              {profile.emergencyContactNumber && (
                <a
                  href={`tel:${profile.emergencyContactNumber}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-red-100 transition hover:bg-red-700"
                >
                  <Phone size={18} />
                  Call Emergency Contact
                </a>
              )}
              <Link
                to={`/doctor-dashboard/reports?patientId=${profile.patientId}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-cyan-100 transition hover:scale-[1.01]"
              >
                <HeartPulse size={18} />
                Doctor Upload Report
              </Link>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, title, value, danger = false }) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div
        className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${
          danger ? "bg-red-100 text-red-600" : "bg-cyan-50 text-cyan-600"
        }`}
      >
        {icon}
      </div>

      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 break-all text-lg font-black text-slate-900">
        {value}
      </p>
    </div>
  );
};

const EmergencyContactBox = ({ label, value, phone = false }) => {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-red-400">
        {label}
      </p>

      {phone && value !== "Not added" ? (
        <a
          href={`tel:${value}`}
          className="mt-1 block break-all text-lg font-black text-red-700"
        >
          {value}
        </a>
      ) : (
        <p className="mt-1 break-all text-lg font-black text-slate-900">
          {value}
        </p>
      )}
    </div>
  );
};

const HealthList = ({ icon, title, items, danger = false }) => {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            danger ? "bg-red-50 text-red-600" : "bg-cyan-50 text-cyan-600"
          }`}
        >
          {icon}
        </div>

        <h3 className="text-lg font-black text-slate-900">{title}</h3>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-400">
          No items listed.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className={`rounded-full px-4 py-2 text-sm font-black ${
                danger ? "bg-red-50 text-red-700" : "bg-cyan-50 text-cyan-700"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const SummaryLine = ({ label, value }) => {
  return (
    <div className="mb-3 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="text-right text-sm font-black text-slate-800">
        {value || "Not added"}
      </p>
    </div>
  );
};

export default EmergencyProfile;
