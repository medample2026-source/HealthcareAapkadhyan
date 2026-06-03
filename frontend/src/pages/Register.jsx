import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartPulse,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Stethoscope,
  Building2,
  Store,
  CheckCircle,
} from "lucide-react";
import API from "../api/axios";
import { BRAND_LOGO_URL, BRAND_NAME } from "../constants/brand";

const roles = [
  {
    label: "Patient",
    value: "patient",
    icon: User,
    desc: "Book appointments and manage reports",
  },
  {
    label: "Doctor",
    value: "doctor",
    icon: Stethoscope,
    desc: "Manage patients and consultations",
  },
  {
    label: "Hospital Admin",
    value: "hospitalAdmin",
    icon: Building2,
    desc: "Manage hospital, doctors and beds",
  },
  {
    label: "Medical Owner",
    value: "medicalOwner",
    icon: Store,
    desc: "Manage medicines, inventory and QR discounts",
  },
];

const approvalRequiredRoles = ["doctor", "hospitalAdmin", "medicalOwner"];

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "patient",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Full name is required.";
    if (!formData.email.trim() && !formData.phone.trim()) {
      return "Email or phone number is required.";
    }
    if (!formData.password.trim()) return "Password is required.";
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/register", formData);

      setSuccessMessage(
        res.data.message ||
          "Registration successful. Please verify your email.",
      );

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "patient",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-emerald-50 px-4 py-12">
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/70 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm backdrop-blur">
            <HeartPulse size={18} />
            Join Smart Healthcare
          </div>

          <h1 className="text-4xl font-bold leading-tight text-slate-900 xl:text-5xl">
            Create your{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-emerald-500 bg-clip-text text-transparent">
              secure health account
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Register as a patient, doctor, hospital admin, or medical owner and
            access a powerful healthcare management platform.
          </p>

          <div className="mt-8 grid max-w-xl gap-4">
            {[
              "Patients can book appointments and manage reports",
              "Doctors require approval before dashboard access",
              "Hospital admins require verification before approval",
              "Medical owners require verification before managing inventory",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur"
              >
                <CheckCircle size={18} className="text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-cyan-100/70 backdrop-blur-xl sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg shadow-cyan-100">
                <img
                  src={BRAND_LOGO_URL}
                  alt={`${BRAND_NAME} Logo`}
                  className="h-16 w-16 object-contain"
                />
              </div>

              <h2 className="text-3xl font-bold text-slate-900">
                Create Account
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Choose your role and complete registration
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Select Account Type
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const active = formData.role === role.value;

                    return (
                      <button
                        type="button"
                        key={role.value}
                        onClick={() => handleRoleChange(role.value)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-cyan-400 bg-cyan-50 shadow-md"
                            : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/50"
                        }`}
                      >
                        <Icon
                          size={22}
                          className={
                            active ? "text-cyan-600" : "text-slate-400"
                          }
                        />
                        <p className="mt-3 text-sm font-bold text-slate-800">
                          {role.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {role.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                  <User size={18} className="text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    autoComplete="name"
                    className="ml-3 w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                    <Mail size={18} className="text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      autoComplete="email"
                      className="ml-3 w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone
                  </label>

                  <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                    <Phone size={18} className="text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone"
                      autoComplete="tel"
                      className="ml-3 w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                  <Lock size={18} className="text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    autoComplete="new-password"
                    className="ml-3 w-full bg-transparent text-sm outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-slate-400 hover:text-cyan-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {approvalRequiredRoles.includes(formData.role) && (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700">
                  This account type requires admin approval after email
                  verification.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-3 font-bold text-white shadow-lg shadow-cyan-200 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-cyan-600 hover:text-cyan-700"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
