import { useState } from "react";
import { MessageSquare, Send, Star, X } from "lucide-react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const FeedbackPopup = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    role: "guest",
    rating: 5,
    message: "",
  });

  const openPopup = () => {
    setOpen(true);
    setMessage("");
    setError("");
    setForm((prev) => ({
      ...prev,
      name: user?.fullName || prev.name,
      role: user?.role || prev.role || "guest",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitFeedback = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await API.post("/feedback", form);

      setMessage("Thank you. Your feedback is now added to testimonials.");
      setForm({
        name: user?.fullName || "",
        role: user?.role || "guest",
        rating: 5,
        message: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openPopup}
        className="fixed bottom-6 left-6 z-50 hidden items-center gap-2 rounded-full bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-2xl shadow-slate-300 transition hover:scale-105 sm:flex"
      >
        <MessageSquare size={19} />
        Feedback
      </button>

      <button
        type="button"
        onClick={openPopup}
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl shadow-slate-300 transition hover:scale-105 sm:hidden"
      >
        <MessageSquare size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-black uppercase tracking-wide text-cyan-700">
                  Share Feedback
                </p>
                <h2 className="text-2xl font-black text-slate-900">
                  Tell us about your experience
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <X size={20} />
              </button>
            </div>

            {message && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={submitFeedback} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    You are
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  >
                    <option value="guest">Guest</option>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="hospitalAdmin">Hospital Admin</option>
                    <option value="medicalOwner">Medical Owner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, rating }))}
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                        Number(form.rating) >= rating
                          ? "border-amber-200 bg-amber-50 text-amber-500"
                          : "border-slate-200 bg-slate-50 text-slate-300"
                      }`}
                    >
                      <Star size={20} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Feedback
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="4"
                  required
                  placeholder="What did you like about मेड Ample?"
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-cyan-100 transition hover:scale-[1.01] disabled:opacity-60"
              >
                <Send size={18} />
                {saving ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </div>
  );
};

export default FeedbackPopup;
