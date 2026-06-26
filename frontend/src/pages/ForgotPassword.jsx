import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import API from "../api/axios";
import { BRAND_LOGO_URL, BRAND_NAME } from "../constants/brand";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Please enter your registered email.");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/forgot-password", { email });

      setSuccessMessage(
        res.data.message || "If email exists, reset link has been sent.",
      );

      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
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
              Forgot Password
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Enter your email and we&apos;ll send a secure reset link.
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
                Registered Email
              </label>

              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="ml-3 w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-3 font-bold text-white shadow-lg shadow-cyan-200 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Sending reset link..." : "Send Reset Link"}
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

export default ForgotPassword;
