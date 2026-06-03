import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiMapPin,
  FiStar,
  FiBriefcase,
  FiActivity,
} from "react-icons/fi";
import { FaArrowRight, FaHospital } from "react-icons/fa6";
import API from "../../api/axios";

const HospitalAvailability = () => {
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/hospitals", {
        params: search.trim() ? { search: search.trim() } : {},
      });

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

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital) => {
      const text = `${hospital.name || ""} ${hospital.city || ""} ${
        hospital.state || ""
      } ${(hospital.services || []).join(" ")}`.toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [hospitals, search]);

  const visibleHospitals = filteredHospitals.slice(0, 3);

  return (
    <section
      id="hospitals"
      className="bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-600">
              Partner Network
            </p>

            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Real hospitals.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Live <br className="hidden sm:block" />
                availability.
              </span>
            </h2>
          </div>

          <div className="relative w-full lg:max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search hospital, location, specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchHospitals();
              }}
              className="w-full rounded-2xl border-2 border-cyan-500 bg-white px-12 py-4 text-sm font-medium text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-600 focus:shadow-lg focus:shadow-cyan-100"
            />
          </div>
        </div>

        {loading ? (
          <StatusBox text="Loading hospitals..." />
        ) : error ? (
          <StatusBox text={error} error />
        ) : visibleHospitals.length === 0 ? (
          <StatusBox
            text="No hospitals found"
            subText="Try searching by hospital name, city, or specialty."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleHospitals.map((hospital) => (
              <Link
                key={hospital._id}
                to={`/hospitals/${hospital._id}`}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/60"
              >
                <div className="relative flex h-36 items-end bg-gradient-to-br from-cyan-100 to-emerald-100 p-5">
                  {hospital.profileImage ? (
                    <img
                      src={hospital.profileImage}
                      alt={hospital.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <FaHospital className="text-5xl text-cyan-400" />
                  )}

                  <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-emerald-600 shadow-sm">
                    <FiStar />
                    {hospital.open24x7 ? "24x7" : "Open"}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-extrabold text-slate-950">
                    {hospital.name}
                  </h3>

                  <p className="mt-2 flex items-center gap-1 text-sm font-medium text-slate-500">
                    <FiMapPin />
                    {hospital.city}, {hospital.state}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(hospital.services || []).slice(0, 3).map((service) => (
                      <span
                        key={service}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <FiBriefcase className="text-emerald-500" />
                      <span className="text-emerald-600">
                        {hospital.availableBeds || 0}
                      </span>
                      / {hospital.totalBeds || 0} beds
                    </p>

                    <p className="flex items-center gap-1 text-xs font-extrabold text-red-500">
                      <FiActivity />
                      {hospital.emergencyAvailable ? "ER Ready" : "No ER"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate("/hospitals")}
        className="mt-10 group inline-flex items-center gap-3 rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        Find the best Hospitals near you
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

export default HospitalAvailability;
