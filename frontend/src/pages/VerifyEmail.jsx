import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import API from "../api/axios";
import { BRAND_LOGO_URL, BRAND_NAME } from "../constants/brand";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification link is invalid.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await API.get(`/auth/verify-email/${token}`);

        setStatus("success");
        setMessage(
          res.data.message || "Email verified successfully. You can now log in.",
        );

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2500);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification link is invalid or has expired. Please register again or contact support.",
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-emerald-50 px-4 py-12">
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-cyan-100/70 backdrop-blur-xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg shadow-cyan-100">
              <img
                src={BRAND_LOGO_URL}
                alt={`${BRAND_NAME} Logo`}
                className="h-16 w-16 object-contain"
              />
            </div>

            <h2 className="text-3xl font-bold text-slate-900">Email Verification</h2>

            <p className="mt-2 text-sm text-slate-500">
              {status === "loading"
                ? "Confirming your email address..."
                : status === "success"
                  ? "Your email has been verified."
                  : "We could not verify your email."}
            </p>
          </div>

          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-6 text-cyan-600">
              <Loader2 size={40} className="animate-spin" />
              <p className="text-sm font-medium text-slate-600">
                Please wait while we verify your account...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-6 text-center">
              <CheckCircle size={40} className="text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700">{message}</p>
              <p className="text-xs text-emerald-600">
                Redirecting to login...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center">
              <XCircle size={40} className="text-red-500" />
              <p className="text-sm font-medium text-red-600">{message}</p>
            </div>
          )}

          {status !== "loading" && (
            <Link
              to="/login"
              className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-cyan-600 hover:text-cyan-700"
            >
              <ArrowLeft size={16} />
              {status === "success" ? "Go to login now" : "Back to login"}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default VerifyEmail;
