import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BRAND_LOGO_URL, BRAND_NAME } from "../constants/brand";
import GoogleAuthButton from "../components/common/GoogleAuthButton";

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case "patient":
        return "/patient-dashboard";

      case "doctor":
        return "/doctor-dashboard";

      case "hospitalAdmin":
        return "/hospital-dashboard";

      case "medicalOwner":
        return "/medical-dashboard";

      case "superAdmin":
        return "/super-admin-dashboard";

      default:
        return "/";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.emailOrPhone || !formData.password) {
      setError("Please enter email/phone and password.");
      return;
    }

    try {
      setLoading(true);

      const user = await login(formData.emailOrPhone, formData.password);

      if (!user) {
        setError("Login successful, but user data was not received.");
        return;
      }

      if (!user.role) {
        setError("Login successful, but user role was not found.");
        return;
      }

      const dashboardPath = getDashboardPath(user.role);

      if (dashboardPath === "/") {
        setError(`No dashboard route found for role: ${user.role}`);
        return;
      }

      navigate(dashboardPath, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setError("");

    try {
      setLoading(true);
      const user = await googleLogin({ credential });
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Google login failed. Please try again.",
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
            Secure Healthcare Access
          </div>

          <h1 className="text-4xl font-bold leading-tight text-slate-900 xl:text-5xl">
            Welcome back to your{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-emerald-500 bg-clip-text text-transparent">
              smart health dashboard
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Login securely to manage appointments, reports, doctors, hospitals,
            medical stores, and emergency healthcare access from one trusted
            platform.
          </p>

          <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
            {[
              "Protected medical records",
              "Role-based dashboard",
              "Fast appointment access",
              "Secure refresh login",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/70 bg-white/70 p-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-cyan-100/70 backdrop-blur-xl sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg shadow-cyan-100">
                <img
                  src={BRAND_LOGO_URL}
                  alt={`${BRAND_NAME} Logo`}
                  className="h-16 w-16 object-contain"
                />
              </div>

              <h2 className="text-3xl font-bold text-slate-900">Login</h2>
              <p className="mt-2 text-sm text-slate-500">
                Access your healthcare account securely
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email or Phone
                </label>

                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="text"
                    name="emailOrPhone"
                    value={formData.emailOrPhone}
                    autoComplete="username"
                    onChange={handleChange}
                    placeholder="Enter email or phone"
                    className="ml-3 w-full bg-transparent text-sm outline-none"
                  />
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
                    autoComplete="current-password"
                    placeholder="Enter password"
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="rounded border-slate-300" />
                  Remember me
                </label>

                <Link
                  to="/forgot-password"
                  className="font-semibold text-cyan-600 hover:text-cyan-700"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-3 font-bold text-white shadow-lg shadow-cyan-200 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Logging in..." : "Login Securely"}
              </button>
            </form>

            <div className="mt-5">
              <GoogleAuthButton onCredential={handleGoogleCredential} />
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-cyan-600 hover:text-cyan-700"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
