import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Droplet,
  FileWarning,
  HeartPulse,
  Home,
  IdCard,
  Loader2,
  Phone,
  Pill,
  ShieldCheck,
  User,
} from "lucide-react";
import API from "../api/axios";

const PatientQrProfile = () => {
  const { patientId } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQrProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/patients/qr/${patientId}`);
      setProfile(res.data.patientProfile);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patient profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrProfile();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cyan-50 via-white to-emerald-50">
        <Loader2 className="animate-spin text-cyan-600" size={48} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cyan-50 via-white to-emerald-50 px-5">
        <div className="max-w-lg rounded-[2rem] bg-white p-8 text-center shadow-xl shadow-cyan-100">
          <AlertTriangle className="mx-auto mb-4 text-red-600" size={48} />
          <h1 className="text-2xl font-black text-slate-900">
            Patient profile unavailable
          </h1>
          <p className="mt-3 text-sm font-semibold text-slate-600">
            {error || "This patient QR profile could not be found."}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-black text-white"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const address = [profile.address, profile.city, profile.state, profile.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-emerald-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-cyan-100">
          <div className="bg-gradient-to-r from-cyan-700 to-emerald-500 p-8 text-white md:p-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.fullName || "Patient"}
                    className="h-24 w-24 rounded-[2rem] border-4 border-white/40 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/20">
                    <User size={42} />
                  </div>
                )}

                <div>
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-black uppercase text-white backdrop-blur-xl">
                    <IdCard size={17} />
                    Linked Patient QR
                  </p>
                  <h1 className="text-4xl font-black md:text-5xl">
                    {profile.fullName || "Patient"}
                  </h1>
                  <p className="mt-3 text-cyan-50">
                    Complete patient information linked with this QR profile.
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white/15 p-5 backdrop-blur-xl">
                <p className="text-sm font-bold text-cyan-50">Patient ID</p>
                <p className="mt-1 text-2xl font-black">{profile.patientId}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoCard icon={<User />} title="Age" value={profile.age} />
                <InfoCard icon={<BadgeCheck />} title="Gender" value={profile.gender} />
                <InfoCard icon={<Droplet />} title="Blood Group" value={profile.bloodGroup} danger />
                <InfoCard icon={<Activity />} title="Profile" value={profile.isProfileComplete ? "Complete" : "Incomplete"} />
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <DetailCard icon={<Phone />} title="Contact">
                  <SummaryLine label="Phone" value={profile.phone} />
                  <SummaryLine label="Email" value={profile.email} />
                </DetailCard>

                <DetailCard icon={<Home />} title="Address">
                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    {address || "Address not added"}
                  </p>
                </DetailCard>
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
                      Use this contact during urgent situations.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <EmergencyBox label="Name" value={profile.emergencyContactName} />
                  <EmergencyBox label="Relation" value={profile.emergencyContactRelation} />
                  <EmergencyBox label="Number" value={profile.emergencyContactNumber} phone />
                </div>
              </section>

              <section className="grid gap-6 md:grid-cols-2">
                <HealthList icon={<HeartPulse />} title="Medical Conditions" items={profile.medicalConditions} />
                <HealthList icon={<FileWarning />} title="Allergies" items={profile.allergies} danger />
                <HealthList icon={<Pill />} title="Current Medications" items={profile.currentMedications} />
                <HealthList icon={<Activity />} title="Past Surgeries" items={profile.pastSurgeries} />
              </section>
            </div>

            <aside className="space-y-5">
              <DetailCard icon={<Activity />} title="Body Details">
                <SummaryLine label="Height" value={profile.height ? `${profile.height} cm` : ""} />
                <SummaryLine label="Weight" value={profile.weight ? `${profile.weight} kg` : ""} />
              </DetailCard>

              <DetailCard icon={<ShieldCheck />} title="Insurance">
                <SummaryLine label="Provider" value={profile.insuranceProvider} />
                <SummaryLine label="Number" value={profile.insuranceNumber} />
              </DetailCard>

              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-cyan-100 transition hover:bg-cyan-700"
                >
                  <Phone size={18} />
                  Call Patient
                </a>
              )}

              {profile.emergencyContactNumber && (
                <a
                  href={`tel:${profile.emergencyContactNumber}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-red-100 transition hover:bg-red-700"
                >
                  <Phone size={18} />
                  Call Emergency Contact
                </a>
              )}
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, title, value, danger = false }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
    <div
      className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${
        danger ? "bg-red-100 text-red-600" : "bg-cyan-50 text-cyan-600"
      }`}
    >
      {icon}
    </div>
    <p className="text-sm font-bold text-slate-500">{title}</p>
    <p className="mt-1 break-all text-lg font-black text-slate-900">
      {value || "Not added"}
    </p>
  </div>
);

const DetailCard = ({ icon, title, children }) => (
  <div className="rounded-[2rem] border border-white/70 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
    </div>
    {children}
  </div>
);

const EmergencyBox = ({ label, value, phone = false }) => (
  <div className="rounded-2xl bg-white p-4">
    <p className="text-xs font-black uppercase text-red-400">{label}</p>
    {phone && value ? (
      <a
        href={`tel:${value}`}
        className="mt-1 block break-all text-lg font-black text-red-700"
      >
        {value}
      </a>
    ) : (
      <p className="mt-1 break-all text-lg font-black text-red-900">
        {value || "Not added"}
      </p>
    )}
  </div>
);

const HealthList = ({ icon, title, items = [], danger = false }) => (
  <div className="rounded-[2rem] border border-white/70 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-3">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
          danger ? "bg-red-50 text-red-600" : "bg-cyan-50 text-cyan-600"
        }`}
      >
        {icon}
      </div>
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
    </div>

    {!items?.length ? (
      <p className="text-sm font-semibold text-slate-500">Not added</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full px-3 py-2 text-xs font-black ${
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

const SummaryLine = ({ label, value }) => (
  <div className="mb-3 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3">
    <p className="text-sm font-bold text-slate-500">{label}</p>
    <p className="text-right text-sm font-black text-slate-800">
      {value || "Not added"}
    </p>
  </div>
);

export default PatientQrProfile;
