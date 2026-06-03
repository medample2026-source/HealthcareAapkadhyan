import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Stethoscope,
  Star,
  MapPin,
  Video,
  Building2,
  IndianRupee,
  CalendarClock,
  Loader2,
  Filter,
  Languages,
  GraduationCap,
} from "lucide-react";
import API from "../api/axios";
import { Link } from "react-router-dom";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) params.search = search.trim();
      if (specialization.trim()) params.specialization = specialization.trim();
      if (mode) params.mode = mode;

      const res = await API.get("/doctors", { params });

      setDoctors(res.data.doctors || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const specializations = useMemo(() => {
    const uniqueSpecializations = doctors
      .map((doctor) => doctor.specialization)
      .filter(Boolean);

    return [...new Set(uniqueSpecializations)];
  }, [doctors]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const clearFilters = async () => {
    setSearch("");
    setSpecialization("");
    setMode("");

    try {
      setLoading(true);
      setError("");

      const res = await API.get("/doctors");
      setDoctors(res.data.doctors || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute left-10 top-16 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-sm font-bold text-cyan-700 shadow-sm backdrop-blur-xl">
              <Stethoscope size={18} />
              Trusted Healthcare Professionals
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
              Find the right doctor for your care
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
              Search approved doctors by name, specialization, consultation
              mode, experience, and availability.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-xl shadow-cyan-100/60 backdrop-blur-xl"
          >
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search doctor or specialization..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              >
                <option value="">All Specializations</option>
                {specializations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              >
                <option value="">All Modes</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-cyan-100 transition hover:scale-[1.02]"
              >
                <Filter size={17} />
                Search
              </button>
            </div>

            {(search || specialization || mode) && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-bold text-cyan-700 hover:text-cyan-900"
              >
                Clear all filters
              </button>
            )}
          </form>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Available Doctors
              </h2>
              <p className="text-sm text-slate-500">
                Showing {doctors.length} approved doctor profiles
              </p>
            </div>

            <button
              onClick={fetchDoctors}
              className="rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-2 text-sm font-bold text-cyan-700 transition hover:bg-cyan-100"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="animate-spin text-cyan-600" size={42} />
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center font-bold text-red-600">
              {error}
            </div>
          ) : doctors.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-cyan-200 bg-white/80 p-12 text-center shadow-sm">
              <Stethoscope className="mx-auto mb-4 text-cyan-600" size={48} />
              <h3 className="text-2xl font-black text-slate-900">
                No doctors found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filter options.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

const DoctorCard = ({ doctor }) => {
  const name = doctor.user?.fullName || "Doctor";
  const image = doctor.profileImage;

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-lg shadow-cyan-100/50 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-48 bg-gradient-to-br from-cyan-100 via-emerald-50 to-blue-100">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-cyan-600 shadow-lg">
              <Stethoscope size={44} />
            </div>
          </div>
        )}

        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm backdrop-blur-xl">
          Approved
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">{name}</h3>
            <p className="mt-1 text-sm font-bold text-cyan-700">
              {doctor.specialization}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-600">
            <Star size={14} fill="currentColor" />
            {doctor.rating || 0}
          </div>
        </div>

        <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-500">
          {doctor.bio}
        </p>

        <div className="mb-5 grid gap-3">
          <InfoItem
            icon={<GraduationCap size={16} />}
            text={doctor.qualification}
          />

          <InfoItem
            icon={<CalendarClock size={16} />}
            text={`${doctor.experience} years experience`}
          />

          <InfoItem
            icon={<IndianRupee size={16} />}
            text={`Consultation fee ₹${doctor.consultationFee}`}
          />

          {doctor.clinicAddress && (
            <InfoItem icon={<MapPin size={16} />} text={doctor.clinicAddress} />
          )}

          <InfoItem
            icon={<Languages size={16} />}
            text={doctor.languages?.join(", ") || "English"}
          />
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {doctor.consultationModes?.map((mode) => (
            <span
              key={mode}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black capitalize ${
                mode === "online"
                  ? "bg-cyan-50 text-cyan-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {mode === "online" ? (
                <Video size={13} />
              ) : (
                <Building2 size={13} />
              )}
              {mode}
            </span>
          ))}
        </div>

        {doctor.availability?.length > 0 && (
          <div className="mb-5 rounded-2xl bg-slate-50 p-4">
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">
              Next Available
            </p>

            <div className="space-y-1">
              {doctor.availability.slice(0, 2).map((slot, index) => (
                <p key={index} className="text-sm font-bold text-slate-700">
                  {slot.day}: {slot.startTime} - {slot.endTime}
                </p>
              ))}
            </div>
          </div>
        )}

        <Link
          to={`/doctors/${doctor._id}`}
          className="block w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-3 text-center text-sm font-black text-white shadow-lg shadow-cyan-100 transition group-hover:scale-[1.02]"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
};

const InfoItem = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
      <span className="text-cyan-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
};

export default Doctors;
