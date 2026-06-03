import { useState } from "react";
import {
  QrCode,
  Save,
  Loader2,
  UserRound,
  Phone,
  BadgeIndianRupee,
  Percent,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  ReceiptIndianRupee,
  Camera,
  X,
  Mail,
  ExternalLink,
} from "lucide-react";
import API from "../../api/axios";
import QRCodeScanner from "../../components/QRCodeScanner";

const initialForm = {
  scannedValue: "",
  patientName: "",
  patientPhone: "",
  billAmount: "",
  discountPercentage: "",
  note: "",
};

const ScanDiscount = () => {
  const [formData, setFormData] = useState(initialForm);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [patientLoading, setPatientLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);

  const [saving, setSaving] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState("");

  const bill = Number(formData.billAmount || 0);
  const discount = Number(formData.discountPercentage || 0);

  const discountAmount =
    Number.isFinite(bill) && Number.isFinite(discount)
      ? Number(((bill * discount) / 100).toFixed(2))
      : 0;

  const finalAmount =
    Number.isFinite(bill) && Number.isFinite(discount)
      ? Number((bill - discountAmount).toFixed(2))
      : 0;

  const extractPatientIdFromQR = (value) => {
    if (!value) return "";

    const rawValue = String(value).trim();

    try {
      const url = new URL(rawValue);
      const parts = url.pathname.split("/").filter(Boolean);
      return parts[parts.length - 1] || rawValue;
    } catch {
      return rawValue;
    }
  };

  const buildPatientProfileUrlFromQR = (value, patientId) => {
    const cleanId = patientId || extractPatientIdFromQR(value);

    if (!cleanId) return "";

    const rawValue = String(value || "").trim();

    try {
      const url = new URL(rawValue);

      if (
        url.pathname.includes("/patient-card/") ||
        url.pathname.includes("/emergency/")
      ) {
        return url.href;
      }
    } catch {
      // Raw patient IDs are still supported.
    }

    return `/patient-card/${encodeURIComponent(cleanId)}`;
  };

  const fetchPatientDetails = async (patientId) => {
    if (!patientId) {
      setError("Please scan or enter patient ID first.");
      return;
    }

    try {
      setPatientLoading(true);
      setError("");
      setPatientData(null);

      const cleanId = extractPatientIdFromQR(patientId);

      const res = await API.get(
        `/medical-scans/patient/${encodeURIComponent(cleanId)}`,
      );

      const patient = res.data.patient;

      setPatientData(patient);

      setFormData((prev) => ({
        ...prev,
        scannedValue: patient.uniqueId || cleanId,
        patientName: patient.fullName || "",
        patientPhone: patient.phone || "",
      }));
    } catch (err) {
      const cleanId = extractPatientIdFromQR(patientId);

      setPatientData(null);

      setFormData((prev) => ({
        ...prev,
        scannedValue: cleanId,
        patientName: "",
        patientPhone: "",
      }));

      setError(
        err.response?.data?.message ||
          "Patient not found. You can enter details manually.",
      );
    } finally {
      setPatientLoading(false);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    const patientId = extractPatientIdFromQR(decodedText);
    const patientProfileUrl = buildPatientProfileUrlFromQR(
      decodedText,
      patientId,
    );

    setFormData((prev) => ({
      ...prev,
      scannedValue: patientId,
    }));

    setSuccessData(null);
    setError("");

    if (patientProfileUrl) {
      window.open(patientProfileUrl, "_blank", "noopener,noreferrer");
    }

    await fetchPatientDetails(patientId);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "scannedValue") {
      setPatientData(null);
    }
  };

  const validateForm = () => {
    if (!formData.scannedValue.trim()) {
      return "Please scan patient QR or enter patient unique ID.";
    }

    if (formData.billAmount === "" || Number(formData.billAmount) < 0) {
      return "Valid bill amount is required.";
    }

    if (
      formData.discountPercentage !== "" &&
      (Number(formData.discountPercentage) < 0 ||
        Number(formData.discountPercentage) > 100)
    ) {
      return "Discount percentage must be between 0 and 100.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessData(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        scannedValue: formData.scannedValue.trim(),
        patientName: formData.patientName.trim(),
        patientPhone: formData.patientPhone.trim(),
        billAmount: Number(formData.billAmount),
        discountPercentage:
          formData.discountPercentage === ""
            ? undefined
            : Number(formData.discountPercentage),
        scanSource: "qr",
        note: formData.note.trim(),
      };

      const res = await API.post("/medical-scans", payload);

      setSuccessData(res.data.scan);
      setPatientData(null);
      setFormData(initialForm);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to record QR discount interaction.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur">
              <QrCode size={18} />
              QR Discount Scan
            </div>

            <h1 className="text-3xl font-black">Scan Patient QR Code</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-50">
              Scan patient QR, fetch patient details automatically, apply
              discount, and save the interaction for monthly tracking.
            </p>
          </div>

          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-cyan-50">Monthly Target</p>
            <p className="mt-1 text-3xl font-black">150 Users</p>
            <p className="mt-1 text-xs text-cyan-50">
              Minimum unique customer interactions
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {successData && (
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 shrink-0" />
            <div>
              <h3 className="text-lg font-black">
                QR scan interaction saved successfully
              </h3>
              <p className="mt-1 text-sm font-semibold">
                Patient ID: {successData.patientUniqueId}
              </p>
              <p className="mt-1 text-sm">
                Bill ₹{successData.billAmount} - Discount ₹
                {successData.discountAmount} = Final ₹{successData.finalAmount}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <ScanLine />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Scan Patient QR
                </h2>
                <p className="text-sm text-slate-500">
                  Scan QR to auto-fetch patient name and phone.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setScannerOpen((prev) => !prev)}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
                scannerOpen
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
              }`}
            >
              {scannerOpen ? <X size={18} /> : <Camera size={18} />}
              {scannerOpen ? "Close Scanner" : "Open Camera Scanner"}
            </button>
          </div>

          {scannerOpen && (
            <div className="mb-6">
              <QRCodeScanner
                onScanSuccess={handleScanSuccess}
                onClose={() => setScannerOpen(false)}
              />
            </div>
          )}

          {patientData && (
            <div className="mb-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                  <UserRound />
                </div>

                <div>
                  <h3 className="text-lg font-black text-emerald-900">
                    Patient Found
                  </h3>

                  <p className="mt-1 text-sm font-bold text-emerald-700">
                    {patientData.fullName || "Unnamed Patient"}
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-sm text-emerald-700">
                    <Phone size={15} />
                    {patientData.phone || "Phone not available"}
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-sm text-emerald-700">
                    <Mail size={15} />
                    {patientData.email || "Email not available"}
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    Patient ID: {patientData.uniqueId}
                  </p>

                  {patientData.bloodGroup && (
                    <p className="mt-1 text-sm text-emerald-700">
                      Blood Group: {patientData.bloodGroup}
                    </p>
                  )}

                  <a
                    href={
                      patientData.profileUrl ||
                      `/patient-card/${encodeURIComponent(
                        patientData.uniqueId,
                      )}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <ExternalLink size={15} />
                    Open Full Patient Profile
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Input
                label="Scanned Patient ID"
                name="scannedValue"
                value={formData.scannedValue}
                onChange={handleChange}
                placeholder="Scan QR or enter patient unique ID manually"
                icon={<QrCode size={18} />}
                required
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => fetchPatientDetails(formData.scannedValue)}
                  disabled={!formData.scannedValue || patientLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {patientLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserRound size={16} />
                  )}
                  Fetch Patient Details
                </button>
              </div>
            </div>

            <Input
              label="Patient Name"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Auto-filled after QR scan"
              icon={<UserRound size={18} />}
            />

            <Input
              label="Patient Phone"
              name="patientPhone"
              value={formData.patientPhone}
              onChange={handleChange}
              placeholder="Auto-filled after QR scan"
              icon={<Phone size={18} />}
            />

            <Input
              label="Bill Amount"
              name="billAmount"
              type="number"
              value={formData.billAmount}
              onChange={handleChange}
              placeholder="Example: 500"
              icon={<BadgeIndianRupee size={18} />}
              required
            />

            <Input
              label="Discount Percentage"
              name="discountPercentage"
              type="number"
              value={formData.discountPercentage}
              onChange={handleChange}
              placeholder="Leave blank to use store discount"
              icon={<Percent size={18} />}
            />

            <div className="lg:col-span-2">
              <Textarea
                label="Note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Optional note about purchase or discount"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving || patientLoading}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-cyan-100 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : "Save QR Scan"}
            </button>
          </div>
        </form>

        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ReceiptIndianRupee />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">
                Live Discount Preview
              </h2>
              <p className="text-sm text-slate-500">
                Check discount before saving.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <PreviewRow label="Bill Amount" value={`₹${bill || 0}`} />
            <PreviewRow label="Discount" value={`${discount || 0}%`} />
            <PreviewRow label="Discount Amount" value={`₹${discountAmount}`} />

            <div className="rounded-3xl bg-gradient-to-r from-cyan-600 to-emerald-500 p-5 text-white">
              <p className="text-sm font-semibold text-cyan-50">Final Amount</p>
              <p className="mt-1 text-4xl font-black">₹{finalAmount || 0}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-700">
            This interaction is saved only for store-side monthly tracking.
            Patient balance or credit is not deducted.
          </div>
        </div>
      </div>
    </div>
  );
};

const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  required,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
        {icon && <span className="text-slate-400">{icon}</span>}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-transparent text-sm outline-none ${
            icon ? "ml-3" : ""
          }`}
        />
      </div>
    </div>
  );
};

const Textarea = ({ label, name, value, onChange, placeholder }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
      />
    </div>
  );
};

const PreviewRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="text-sm font-black text-slate-900">{value}</p>
    </div>
  );
};

export default ScanDiscount;
