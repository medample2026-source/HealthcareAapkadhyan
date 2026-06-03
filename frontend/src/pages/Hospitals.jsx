import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Search,
  MapPin,
  BedDouble,
  ShieldCheck,
  Ambulance,
  Clock,
  Loader2,
  RefreshCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Hospital,
} from "lucide-react";
import API from "../api/axios";

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) params.search = search.trim();
      if (city.trim()) params.city = city.trim();
      if (emergencyOnly) params.emergency = "true";

      const res = await API.get("/hospitals", { params });
      setHospitals(res.data.hospitals || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const totalStats = useMemo(() => {
    const totalBeds = hospitals.reduce(
      (sum, item) => sum + Number(item.totalBeds || 0),
      0,
    );

    const availableBeds = hospitals.reduce(
      (sum, item) => sum + Number(item.availableBeds || 0),
      0,
    );

    const availableIcuBeds = hospitals.reduce(
      (sum, item) => sum + Number(item.availableIcuBeds || 0),
      0,
    );

    const emergencyHospitals = hospitals.filter(
      (item) => item.emergencyAvailable,
    ).length;

    return {
      totalBeds,
      availableBeds,
      availableIcuBeds,
      emergencyHospitals,
    };
  }, [hospitals]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  return (
    <div className="bg-gradient-to-b from-cyan-50 via-white to-emerald-50">
      <section className="relative overflow-hidden px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] bg-gradient-to-r from-cyan-600 to-emerald-500 p-8 text-white shadow-2xl shadow-cyan-100 md:p-12">
            <p className="mb-3 text-sm font-black uppercase tracking-wide text-cyan-100">
              Hospitals Near You
            </p>

            <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Find hospitals with live beds, ICU, and emergency availability.
            </h1>

            <p className="mt-5 max-w-3xl text-cyan-50">
              Search approved hospitals, check available beds, ICU beds,
              ambulance support, 24x7 status, and emergency availability.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 grid gap-4 rounded-[2rem] bg-white/15 p-4 backdrop-blur-xl md:grid-cols-[1.2fr_1fr_auto]"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by hospital name or service"
                  className="w-full rounded-2xl border border-white/30 bg-white px-12 py-4 text-sm font-bold text-slate-700 outline-none"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City, example: Bhopal"
                  className="w-full rounded-2xl border border-white/30 bg-white px-12 py-4 text-sm font-bold text-slate-700 outline-none"
                />
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-slate-950 px-8 py-4 text-sm font-black text-white transition hover:bg-slate-800"
              >
                Search
              </button>
            </form>

            <label className="mt-4 inline-flex cursor-pointer items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold text-white backdrop-blur-xl">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="h-5 w-5 accent-cyan-600"
              />
              Show emergency available hospitals only
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-10 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Hospital />}
          title="Hospitals"
          value={hospitals.length}
          desc="Approved hospitals"
        />
        <StatCard
          icon={<BedDouble />}
          title="Available Beds"
          value={totalStats.availableBeds}
          desc={`Out of ${totalStats.totalBeds} total beds`}
        />
        <StatCard
          icon={<ShieldCheck />}
          title="Available ICU"
          value={totalStats.availableIcuBeds}
          desc="Live ICU availability"
        />
        <StatCard
          icon={<AlertTriangle />}
          title="Emergency"
          value={totalStats.emergencyHospitals}
          desc="Emergency-ready hospitals"
        />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              Available Hospitals
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Browse hospitals and open details for complete information.
            </p>
          </div>

          <button
            onClick={fetchHospitals}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-50 px-5 py-3 text-sm font-black text-cyan-700 transition hover:bg-cyan-100"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <Loader2 className="animate-spin text-cyan-600" size={44} />
          </div>
        ) : hospitals.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-cyan-200 bg-white/80 p-12 text-center shadow-sm">
            <Building2 className="mx-auto mb-4 text-cyan-600" size={52} />
            <h3 className="text-2xl font-black text-slate-900">
              No hospitals found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try searching another city or remove filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {hospitals.map((hospital) => (
              <HospitalCard key={hospital._id} hospital={hospital} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const HospitalCard = ({ hospital }) => {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-lg shadow-cyan-100/50 transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-44 bg-gradient-to-br from-cyan-100 to-emerald-100">
        {hospital.profileImage ? (
          <img
            src={hospital.profileImage}
            alt={hospital.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-cyan-600">
            <Building2 size={56} />
          </div>
        )}

        <div className="absolute left-4 top-4">
          <StatusPill
            active={hospital.emergencyAvailable}
            activeText="Emergency"
            inactiveText="No Emergency"
          />
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3">
          <h3 className="line-clamp-1 text-xl font-black text-slate-900">
            {hospital.name}
          </h3>

          <p className="mt-1 text-sm font-bold text-cyan-700">
            {hospital.hospitalType}
          </p>
        </div>

        <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <MapPin size={16} />
          {hospital.city}, {hospital.state}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <MiniInfo
            icon={<BedDouble size={16} />}
            label="Beds"
            value={`${hospital.availableBeds || 0}/${hospital.totalBeds || 0}`}
          />
          <MiniInfo
            icon={<ShieldCheck size={16} />}
            label="ICU"
            value={`${hospital.availableIcuBeds || 0}/${hospital.icuBeds || 0}`}
          />
          <MiniInfo
            icon={<Ambulance size={16} />}
            label="Ambulance"
            value={hospital.ambulanceAvailable ? "Yes" : "No"}
          />
          <MiniInfo
            icon={<Clock size={16} />}
            label="24x7"
            value={hospital.open24x7 ? "Open" : "Limited"}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(hospital.services || []).slice(0, 3).map((service) => (
            <span
              key={service}
              className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700"
            >
              {service}
            </span>
          ))}
        </div>

        <Link
          to={`/hospitals/${hospital._id}`}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-100 transition hover:scale-[1.01]"
        >
          View Details
          <ArrowRight size={17} />
        </Link>
      </div>
    </article>
  );
};

const StatCard = ({ icon, title, value, desc }) => {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>

      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </div>
  );
};

const MiniInfo = ({ icon, label, value }) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase text-slate-400">
        <span className="text-cyan-600">{icon}</span>
        {label}
      </div>
      <p className="text-sm font-black text-slate-800">{value}</p>
    </div>
  );
};

const StatusPill = ({ active, activeText, inactiveText }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      }`}
    >
      {active ? <CheckCircle size={13} /> : <XCircle size={13} />}
      {active ? activeText : inactiveText}
    </span>
  );
};

export default Hospitals;
