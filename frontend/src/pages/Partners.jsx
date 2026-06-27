import { useState } from "react";
import {
  Building2,
  CheckCircle,
  Handshake,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import API from "../api/axios";

const organizationTypes = [
  "Healthcare Company",
  "Insurance Provider",
  "Pharma Company",
  "Diagnostic Chain",
  "NGO / CSR Partner",
  "Ambulance Network",
  "Corporate Wellness",
  "Technology Partner",
  "Other",
];

const partnershipInterests = [
  "Strategic Partnership",
  "Corporate Health Plans",
  "Patient Support Programs",
  "Diagnostics Collaboration",
  "Emergency / Ambulance Network",
  "Sponsorship / CSR",
  "Technology Integration",
  "Other",
];

const Partners = () => {
  const [form, setForm] = useState({
    organizationName: "",
    contactPerson: "",
    email: "",
    phone: "",
    organizationType: organizationTypes[0],
    website: "",
    city: "",
    state: "",
    partnershipInterest: partnershipInterests[0],
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setStatus(null);
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setStatus(null);

      const res = await API.post("/partner-inquiries", form);

      setStatus({
        type: "success",
        message: res.data.message || "Partnership inquiry submitted.",
      });

      setForm({
        organizationName: "",
        contactPerson: "",
        email: "",
        phone: "",
        organizationType: organizationTypes[0],
        website: "",
        city: "",
        state: "",
        partnershipInterest: partnershipInterests[0],
        message: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to submit partnership inquiry. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-800 p-8 text-white shadow-2xl shadow-cyan-100 md:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-cyan-100">
              <Handshake size={18} />
              Partner With MedAmple
            </div>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Build better healthcare access with us.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-cyan-50">
              We collaborate with organizations, companies, NGOs, corporate
              wellness teams, insurance providers, diagnostic networks, and
              healthcare technology partners.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Benefit text="Corporate wellness programs" />
              <Benefit text="CSR and patient support" />
              <Benefit text="Diagnostics and emergency networks" />
              <Benefit text="Technology and healthcare integrations" />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-8"
          >
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-700">
                Business Enquiry
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Tell us about your organization
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                This form is for partnership discussions only. It does not
                create a user account.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                icon={<Building2 />}
                label="Organization Name"
                name="organizationName"
                value={form.organizationName}
                onChange={handleChange}
                required
              />

              <Input
                icon={<User />}
                label="Contact Person"
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
                required
              />

              <Input
                icon={<Mail />}
                label="Work Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <Input
                icon={<Phone />}
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />

              <Select
                label="Organization Type"
                name="organizationType"
                value={form.organizationType}
                onChange={handleChange}
                options={organizationTypes}
              />

              <Input
                icon={<Sparkles />}
                label="Website"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />

              <Input
                icon={<MapPin />}
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              />

              <Input
                icon={<MapPin />}
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                required
              />

              <div className="md:col-span-2">
                <Select
                  label="Partnership Interest"
                  name="partnershipInterest"
                  value={form.partnershipInterest}
                  onChange={handleChange}
                  options={partnershipInterests}
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Proposal / Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
                required
                placeholder="Tell us how your organization wants to collaborate with MedAmple..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            {status && (
              <div
                className={`mt-5 rounded-2xl p-4 text-sm font-bold ${
                  status.type === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-cyan-100 transition hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={19} />
              ) : (
                <Send size={19} />
              )}
              Submit Partnership Enquiry
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

const Benefit = ({ text }) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm font-bold text-cyan-50">
      <CheckCircle size={18} className="shrink-0 text-emerald-300" />
      {text}
    </div>
  );
};

const Input = ({
  icon,
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </div>
    </div>
  );
};

const Select = ({ label, name, value, onChange, options }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Partners;
