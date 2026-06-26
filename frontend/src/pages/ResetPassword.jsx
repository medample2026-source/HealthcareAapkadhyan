import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import API from "../api/axios";
import { BRAND_LOGO_URL, BRAND_NAME } from "../constants/brand";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.password.trim()) return "New password is required.";

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
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

      const res = await API.post(`/auth/reset-password/${token}`, {
        password: formData.password,
      });

      setSuccessMessage(
        res.data.message ||
          "Password reset successful. Redirecting to login...",
      );

      setFormData({
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Reset link is invalid or expired. Please request a new link.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-emerald-50 px-4 py-12">
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-cyan-100/70 backdrop-blur-xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-lg shadow-cyan-100">
              <img
                src={BRAND_LOGO_URL}
                alt={`${BRAND_NAME} Logo`}
                className="h-20 w-20 object-contain"
              />
            </div>

            <h2 className="text-3xl font-bold text-slate-900">
              Reset Password
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create a new secure password for your account.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                New Password
              </label>

              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                <Lock size={18} className="text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>

              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                <Lock size={18} className="text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="ml-3 w-full bg-transparent text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-slate-400 hover:text-cyan-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-3 font-bold text-white shadow-lg shadow-cyan-200 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Resetting password..." : "Reset Password"}
            </button>
          </form>

          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-cyan-600 hover:text-cyan-700"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
