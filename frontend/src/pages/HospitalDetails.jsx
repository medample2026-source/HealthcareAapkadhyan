import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  BedDouble,
  ShieldCheck,
  Ambulance,
  Clock,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Hospital,
  FileText,
} from "lucide-react";
import API from "../api/axios";

const HospitalDetails = () => {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHospital = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/hospitals/${id}`);
      setHospital(res.data.hospital);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load hospital details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospital();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[650px] items-center justify-center bg-gradient-to-b from-cyan-50 via-white to-emerald-50">
        <Loader2 className="animate-spin text-cyan-600" size={46} />
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="flex min-h-[650px] items-center justify-center bg-gradient-to-b from-cyan-50 via-white to-emerald-50 px-5">
        <div className="max-w-xl rounded-[2rem] border border-red-100 bg-red-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-600" size={52} />
          <h2 className="text-2xl font-black text-red-800">
            Hospital not available
          </h2>
          <p className="mt-2 text-sm font-semibold text-red-600">
            {error || "Unable to find hospital details."}
          </p>

          <Link
            to="/hospitals"
            className="mt-5 inline-flex rounded-2xl bg-red-100 px-5 py-3 text-sm font-black text-red-700"
          >
            Back to Hospitals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-cyan-50 via-white to-emerald-50 px-5 py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/hospitals"
          className="mb-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-cyan-50 hover:text-cyan-700"
        >
          <ArrowLeft size={18} />
          Back to Hospitals
        </Link>

        <section className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-cyan-100">
          <div className="relative h-72 bg-gradient-to-br from-cyan-100 to-emerald-100">
            {hospital.profileImage ? (
              <img
                src={hospital.profileImage}
                alt={hospital.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-cyan-600">
                <Building2 size={72} />
              </div>
            )}

            <div className="absolute bottom-6 left-6 right-6">
              <div className="rounded-[2rem] bg-white/90 p-5 backdrop-blur-xl">
                <p className="mb-2 text-sm font-black uppercase tracking-wide text-cyan-700">
                  {hospital.hospitalType}
                </p>

                <h1 className="text-3xl font-black text-slate-900 md:text-5xl">
                  {hospital.name}
                </h1>

                <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
                  <MapPin size={17} />
                  {hospital.address}, {hospital.city}, {hospital.state}{" "}
                  {hospital.pincode}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <InfoSection
                icon={<FileText />}
                title="About Hospital"
                description={hospital.description}
              />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <AvailabilityCard
                  icon={<BedDouble />}
                  title="Available Beds"
                  value={`${hospital.availableBeds || 0}/${hospital.totalBeds || 0}`}
                />
                <AvailabilityCard
                  icon={<ShieldCheck />}
                  title="Available ICU"
                  value={`${hospital.availableIcuBeds || 0}/${hospital.icuBeds || 0}`}
                />
                <AvailabilityCard
                  icon={<Ambulance />}
                  title="Ambulance"
                  value={hospital.ambulanceAvailable ? "Available" : "No"}
                />
                <AvailabilityCard
                  icon={<Clock />}
                  title="24x7"
                  value={hospital.open24x7 ? "Open" : "Limited"}
                />
              </div>

              <TagSection title="Services" items={hospital.services || []} />
              <TagSection
                title="Facilities"
                items={hospital.facilities || []}
              />
            </div>

            <aside className="space-y-5">
              <div
                className={`rounded-[2rem] border p-5 ${
                  hospital.emergencyAvailable
                    ? "border-emerald-100 bg-emerald-50"
                    : "border-red-100 bg-red-50"
                }`}
              >
                <div className="flex gap-3">
                  {hospital.emergencyAvailable ? (
                    <CheckCircle className="text-emerald-600" />
                  ) : (
                    <XCircle className="text-red-600" />
                  )}

                  <div>
                    <h3
                      className={`font-black ${
                        hospital.emergencyAvailable
                          ? "text-emerald-800"
                          : "text-red-800"
                      }`}
                    >
                      Emergency Status
                    </h3>

                    <p
                      className={`mt-1 text-sm font-semibold ${
                        hospital.emergencyAvailable
                          ? "text-emerald-700"
                          : "text-red-700"
                      }`}
                    >
                      {hospital.emergencyAvailable
                        ? "Emergency support is available."
                        : "Emergency support is not available currently."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-xl font-black text-slate-900">
                  Contact Information
                </h3>

                <ContactLine icon={<Phone />} text={hospital.contactNumber} />
                <ContactLine
                  icon={<Ambulance />}
                  text={
                    hospital.emergencyNumber || "Emergency number not added"
                  }
                />
                <ContactLine
                  icon={<Mail />}
                  text={hospital.email || "Email not added"}
                />
                <ContactLine
                  icon={<Globe />}
                  text={hospital.website || "Website not added"}
                />
              </div>

              <div className="rounded-[2rem] border border-cyan-100 bg-cyan-50 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Hospital className="text-cyan-600" />
                  <h3 className="text-lg font-black text-slate-900">
                    Registration
                  </h3>
                </div>

                <p className="text-sm font-bold text-slate-600">
                  {hospital.registrationNumber}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoSection = ({ icon, title, description }) => {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-slate-50 p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
          {icon}
        </div>

        <h2 className="text-xl font-black text-slate-900">{title}</h2>
      </div>

      <p className="leading-7 text-slate-600">{description}</p>
    </div>
  );
};

const AvailabilityCard = ({ icon, title, value }) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>

      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
};

const TagSection = ({ title, items }) => {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-black text-slate-900">{title}</h3>

      {items.length === 0 ? (
        <p className="text-sm font-bold text-slate-400">No items added.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-700"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const ContactLine = ({ icon, text }) => {
  return (
    <p className="mb-3 flex items-center gap-3 text-sm font-bold text-slate-600">
      <span className="text-cyan-600">{icon}</span>
      {text}
    </p>
  );
};

export default HospitalDetails;
