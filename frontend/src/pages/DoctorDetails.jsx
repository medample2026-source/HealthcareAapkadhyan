import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Stethoscope,
  Star,
  MapPin,
  Video,
  Building2,
  IndianRupee,
  CalendarClock,
  Loader2,
  Languages,
  GraduationCap,
  CalendarDays,
  ShieldCheck,
  Mail,
  Phone,
  X,
  Send,
  CheckCircle,
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const [bookingData, setBookingData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    consultationMode: "",
    reason: "",
  });

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/doctors/${id}`);
      const doctorData = res.data.doctor;

      setDoctor(doctorData);

      setBookingData((prev) => ({
        ...prev,
        consultationMode: doctorData.consultationModes?.[0] || "",
        appointmentTime: doctorData.availability?.[0]
          ? `${doctorData.availability[0].startTime} - ${doctorData.availability[0].endTime}`
          : "",
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load doctor details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;

    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookButton = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "patient") {
      setError("Only patients can book appointments.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setBookingOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!bookingData.appointmentDate) {
      setError("Please select appointment date.");
      return;
    }

    if (!bookingData.appointmentTime) {
      setError("Please select appointment time.");
      return;
    }

    if (!bookingData.consultationMode) {
      setError("Please select consultation mode.");
      return;
    }

    if (!bookingData.reason.trim()) {
      setError("Please enter reason or symptoms.");
      return;
    }

    try {
      setBookingLoading(true);
      setError("");
      setSuccessMessage("");

      await API.post("/appointments/book", {
        doctorId: doctor._id,
        appointmentDate: bookingData.appointmentDate,
        appointmentTime: bookingData.appointmentTime,
        consultationMode: bookingData.consultationMode,
        reason: bookingData.reason,
      });

      setSuccessMessage("Appointment request sent successfully.");
      setBookingOpen(false);

      setBookingData((prev) => ({
        ...prev,
        appointmentDate: "",
        reason: "",
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
        <Loader2 className="animate-spin text-cyan-600" size={44} />
      </main>
    );
  }

  if (error && !doctor) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-200 bg-white p-10 text-center shadow-xl">
          <Stethoscope className="mx-auto mb-4 text-red-500" size={50} />

          <h1 className="text-3xl font-black text-slate-900">
            Doctor Not Found
          </h1>

          <p className="mt-3 text-sm font-semibold text-red-600">
            {error || "This doctor profile is not available."}
          </p>

          <Link
            to="/doctors"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-black text-white transition hover:bg-cyan-700"
          >
            <ArrowLeft size={18} />
            Back to Doctors
          </Link>
        </div>
      </main>
    );
  }

  const name = doctor.user?.fullName || "Doctor";
  const availableSlots =
    doctor.availability?.filter((slot) => slot.isAvailable) || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/doctors"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-5 py-2 text-sm font-bold text-cyan-700 shadow-sm transition hover:bg-cyan-50"
          >
            <ArrowLeft size={17} />
            Back to Doctors
          </Link>

          {successMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
              <CheckCircle size={20} />
              {successMessage}
            </div>
          )}

          {error && doctor && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/90 shadow-2xl shadow-cyan-100/70 backdrop-blur-xl">
            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.4fr]">
              <div className="relative min-h-[420px] bg-gradient-to-br from-cyan-100 via-emerald-50 to-blue-100">
                {doctor.profileImage ? (
                  <img
                    src={doctor.profileImage}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[420px] items-center justify-center">
                    <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white text-cyan-600 shadow-xl">
                      <Stethoscope size={70} />
                    </div>
                  </div>
                )}

                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-black text-emerald-700 shadow-sm backdrop-blur-xl">
                  <ShieldCheck size={15} />
                  Approved Doctor
                </div>
              </div>

              <div className="p-6 md:p-10">
                <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="mb-2 text-sm font-black uppercase tracking-wide text-cyan-700">
                      {doctor.specialization}
                    </p>

                    <h1 className="text-4xl font-black text-slate-900 md:text-5xl">
                      {name}
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                      {doctor.bio}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-4 py-2 text-sm font-black text-amber-600">
                    <Star size={16} fill="currentColor" />
                    {doctor.rating || 0}
                    <span className="text-slate-400">
                      ({doctor.totalReviews || 0})
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoBox
                    icon={<GraduationCap />}
                    label="Qualification"
                    value={doctor.qualification}
                  />

                  <InfoBox
                    icon={<CalendarClock />}
                    label="Experience"
                    value={`${doctor.experience} years`}
                  />

                  <InfoBox
                    icon={<IndianRupee />}
                    label="Consultation Fee"
                    value={`₹${doctor.consultationFee}`}
                  />

                  <InfoBox
                    icon={<Languages />}
                    label="Languages"
                    value={doctor.languages?.join(", ") || "English"}
                  />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {doctor.user?.email && (
                    <InfoBox
                      icon={<Mail />}
                      label="Email"
                      value={doctor.user.email}
                    />
                  )}

                  {doctor.user?.phone && (
                    <InfoBox
                      icon={<Phone />}
                      label="Phone"
                      value={doctor.user.phone}
                    />
                  )}
                </div>

                {doctor.clinicAddress && (
                  <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                    <div className="flex gap-3">
                      <MapPin className="mt-1 text-cyan-600" />
                      <div>
                        <p className="text-sm font-black uppercase tracking-wide text-slate-400">
                          Clinic Address
                        </p>
                        <p className="mt-1 font-bold text-slate-800">
                          {doctor.clinicAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <p className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">
                    Consultation Modes
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {doctor.consultationModes?.map((mode) => (
                      <span
                        key={mode}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black capitalize ${
                          mode === "online"
                            ? "bg-cyan-50 text-cyan-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {mode === "online" ? (
                          <Video size={16} />
                        ) : (
                          <Building2 size={16} />
                        )}
                        {mode}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleBookButton}
                  className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-cyan-100 transition hover:scale-[1.01]"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>

          <section className="mt-8 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <CalendarDays />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Availability Schedule
                </h2>
                <p className="text-sm text-slate-500">
                  Check available days and consultation timings.
                </p>
              </div>
            </div>

            {doctor.availability?.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {doctor.availability.map((slot, index) => (
                  <div
                    key={index}
                    className={`rounded-3xl border p-5 ${
                      slot.isAvailable
                        ? "border-cyan-100 bg-cyan-50/70"
                        : "border-red-100 bg-red-50/70"
                    }`}
                  >
                    <p className="text-lg font-black text-slate-900">
                      {slot.day}
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-600">
                      {slot.startTime} - {slot.endTime}
                    </p>

                    <span
                      className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-black ${
                        slot.isAvailable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {slot.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-cyan-200 bg-cyan-50/60 p-10 text-center">
                <CalendarDays
                  className="mx-auto mb-3 text-cyan-600"
                  size={42}
                />
                <h3 className="text-xl font-black text-slate-900">
                  No availability added
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  This doctor has not added availability schedule yet.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>

      {bookingOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Book Appointment
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Send appointment request to Dr. {name}
                </p>
              </div>

              <button
                onClick={() => setBookingOpen(false)}
                className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={bookingData.appointmentDate}
                    onChange={handleBookingChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Available Time Slot
                  </label>
                  <select
                    name="appointmentTime"
                    value={bookingData.appointmentTime}
                    onChange={handleBookingChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  >
                    <option value="">Select time</option>
                    {availableSlots.map((slot, index) => (
                      <option
                        key={index}
                        value={`${slot.startTime} - ${slot.endTime}`}
                      >
                        {slot.day}: {slot.startTime} - {slot.endTime}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Consultation Mode
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  {doctor.consultationModes?.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        setBookingData((prev) => ({
                          ...prev,
                          consultationMode: mode,
                        }))
                      }
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        bookingData.consultationMode === mode
                          ? "border-cyan-300 bg-cyan-50 text-cyan-700 shadow-lg shadow-cyan-100"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-cyan-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black capitalize">
                        {mode === "online" ? (
                          <Video size={18} />
                        ) : (
                          <Building2 size={18} />
                        )}
                        {mode}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Reason / Symptoms
                </label>

                <textarea
                  name="reason"
                  value={bookingData.reason}
                  onChange={handleBookingChange}
                  rows="4"
                  required
                  placeholder="Describe your symptoms or reason for consultation..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-cyan-100 transition hover:scale-[1.01] disabled:opacity-60"
              >
                {bookingLoading ? (
                  <Loader2 className="animate-spin" size={19} />
                ) : (
                  <Send size={19} />
                )}
                Send Appointment Request
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

const InfoBox = ({ icon, label, value }) => {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm">
        {icon}
      </div>

      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-800">{value || "Not added"}</p>
    </div>
  );
};

export default DoctorDetails;
