import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiSearch, FiStar } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa6";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const getInitials = (name) => {
  return name
    .replace("Dr.", "")
    .trim()
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const TopDoctors = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/doctors", {
        params: search.trim() ? { search: search.trim() } : {},
      });

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

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const text = `${doctor.user?.fullName || ""} ${
        doctor.specialization || ""
      } ${doctor.hospital?.name || ""}`.toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [doctors, search]);

  const visibleDoctors = filteredDoctors.slice(0, 4);

  const handleBookNow = (doctorId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate(`/doctors/${doctorId}`);
  };

  return (
    <section
      id="doctors"
      className="bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-600">
              Top Doctors
            </p>

            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Specialists you can{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                truly <br className="hidden sm:block" />
                trust.
              </span>
            </h2>
          </div>

          <div className="relative w-full lg:max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search specialty, name, hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchDoctors();
              }}
              className="w-full rounded-2xl border-2 border-cyan-500 bg-white px-12 py-4 text-sm font-medium text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-600 focus:shadow-lg focus:shadow-cyan-100"
            />
          </div>
        </div>

        {loading ? (
          <StatusBox text="Loading doctors..." />
        ) : error ? (
          <StatusBox text={error} error />
        ) : visibleDoctors.length === 0 ? (
          <StatusBox text="No doctors found" subText="Try searching by name, specialty, or hospital." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleDoctors.map((doctor) => {
              const name = doctor.user?.fullName || "Doctor";

              return (
                <div
                  key={doctor._id}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/60"
                >
                  <div className="relative mx-auto h-24 w-24">
                    {doctor.profileImage ? (
                      <img
                        src={doctor.profileImage}
                        alt={name}
                        className="h-full w-full rounded-3xl object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-extrabold text-white">
                        {getInitials(name)}
                      </div>
                    )}

                    <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                  </div>

                  <h3 className="mt-5 text-base font-extrabold text-slate-950">
                    Dr. {name}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {doctor.specialization}
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-4 text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <FiStar className="text-emerald-500" />
                      {doctor.rating || 0}
                    </span>

                    <span>{doctor.experience || 0}y exp</span>

                    <span>Rs {doctor.consultationFee || 0}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookNow(doctor._id)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-500"
                  >
                    <FiCalendar />
                    Book Now
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate("/doctors")}
        className="mt-10 group inline-flex items-center gap-3 rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        Find the best Doctors near you
        <FaArrowRight className="text-blue-500 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </section>
  );
};

const StatusBox = ({ text, subText, error = false }) => {
  return (
    <div
      className={`rounded-3xl border p-10 text-center shadow-sm ${
        error ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
      }`}
    >
      <p className={`font-bold ${error ? "text-red-600" : "text-slate-700"}`}>
        {text}
      </p>

      {subText && <p className="mt-2 text-sm text-slate-500">{subText}</p>}
    </div>
  );
};

export default TopDoctors;
