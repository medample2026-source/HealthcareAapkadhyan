import {
  AlertTriangle,
  Ambulance,
  MapPin,
  Phone,
  Navigation,
  Loader2,
  ShieldAlert,
  Copy,
  CheckCircle,
  Camera,
  ExternalLink,
  Hospital,
  Stethoscope,
  Pill,
  LocateFixed,
  QrCode,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import QRCodeScanner from "../../components/QRCodeScanner";

const incidents = [
  {
    title: "Accident / Injury",
    desc: "Road accident, fracture, head injury, or heavy injury.",
  },
  {
    title: "Heart Attack Symptoms",
    desc: "Chest pain, sweating, left arm pain, or breathing discomfort.",
  },
  {
    title: "Breathing Problem",
    desc: "Difficulty breathing, asthma attack, or oxygen-related emergency.",
  },
  {
    title: "High Fever",
    desc: "Very high fever, weakness, seizure, or severe infection symptoms.",
  },
  {
    title: "Pregnancy Emergency",
    desc: "Severe pain, bleeding, delivery emergency, or pregnancy risk.",
  },
  {
    title: "Stroke Symptoms",
    desc: "Face drooping, arm weakness, speech problem, or confusion.",
  },
  {
    title: "Severe Bleeding",
    desc: "Heavy bleeding due to injury, accident, or medical condition.",
  },
  {
    title: "Unconscious Person",
    desc: "Person fainted, not responding, or suddenly collapsed.",
  },
  {
    title: "Burn Injury",
    desc: "Fire burn, chemical burn, electric burn, or severe skin injury.",
  },
  {
    title: "Poisoning",
    desc: "Food poisoning, chemical intake, overdose, or toxic exposure.",
  },
  {
    title: "Mental Health Crisis",
    desc: "Panic, self-harm risk, extreme distress, or unsafe behavior.",
  },
  {
    title: "Child Emergency",
    desc: "Emergency involving baby, child, high fever, injury, or breathing issue.",
  },
  {
    title: "Senior Citizen Emergency",
    desc: "Emergency involving elderly person, fall, chest pain, or weakness.",
  },
  {
    title: "Other Emergency",
    desc: "Any urgent medical situation not listed above.",
  },
];

const severityOptions = ["Low", "Medium", "High", "Critical"];

const EmergencySOS = ({ mode = "public" }) => {
  const isPatientMode = mode === "patient";

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const [form, setForm] = useState({
    fullName: storedUser?.fullName || "",
    phone: storedUser?.phone || "",
    incidentType: "Accident / Injury",
    severity: "Critical",
    description: "",
    manualAddress: "",
    city: "",
    state: "",
  });

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
  });

  const [locationStatus, setLocationStatus] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [patientLookupId, setPatientLookupId] = useState("");
  const [patientProfileLink, setPatientProfileLink] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  const hasLocation = location.latitude && location.longitude;

  const locationQuery = hasLocation
    ? `${location.latitude},${location.longitude}`
    : encodeURIComponent(form.manualAddress || "");

  const googleLinks = {
    hospitals: locationQuery
      ? `https://www.google.com/maps/search/hospitals+near+${locationQuery}`
      : "",
    clinics: locationQuery
      ? `https://www.google.com/maps/search/clinics+near+${locationQuery}`
      : "",
    pharmacies: locationQuery
      ? `https://www.google.com/maps/search/pharmacies+near+${locationQuery}`
      : "",
    directions: hasLocation
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : form.manualAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            form.manualAddress,
          )}`
        : "",
  };

  const emergencyMessage =
    sosResult?.emergencyMessage ||
    `EMERGENCY SOS!

Name: ${form.fullName || "Guest User"}
Phone: ${form.phone}
Incident: ${form.incidentType}
Severity: ${form.severity}

Description:
${form.description || "No extra description provided."}

Location:
${googleLinks.directions || form.manualAddress || "Location not available"}
${patientProfileLink ? `\nPatient QR Profile:\n${patientProfileLink}` : ""}

Please provide urgent medical help.`;

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

  const buildPatientCardUrl = (value) => {
    const rawValue = String(value || "").trim();
    const patientId = extractPatientIdFromQR(rawValue);

    if (!patientId) return "";

    try {
      const url = new URL(rawValue);

      if (
        url.pathname.includes("/patient-card/") ||
        url.pathname.includes("/emergency/")
      ) {
        return url.href;
      }
    } catch {
      // Plain patient IDs are supported here.
    }

    return `${window.location.origin}/patient-card/${encodeURIComponent(
      patientId,
    )}`;
  };

  const openPatientProfile = (value) => {
    const patientId = extractPatientIdFromQR(value);
    const profileUrl = buildPatientCardUrl(value);

    if (!patientId || !profileUrl) {
      setError("Please scan QR or enter patient ID first.");
      return;
    }

    setError("");
    setPatientLookupId(patientId);
    setPatientProfileLink(profileUrl);
    window.open(profileUrl, "_blank", "noopener,noreferrer");
  };

  const handlePatientQrScan = (decodedText) => {
    const patientId = extractPatientIdFromQR(decodedText);
    setPatientLookupId(patientId);
    openPatientProfile(decodedText);
  };

  const getCurrentLocation = () => {
    setError("");
    setLocationStatus("");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by this browser.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setLocationStatus("Live location detected successfully.");
        setLocationLoading(false);
      },
      () => {
        setLocationStatus(
          "Location permission denied. Please enter your manual location.",
        );
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submitSos = async (e) => {
    e.preventDefault();

    setError("");
    setSosResult(null);

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!form.incidentType) {
      setError("Please select incident type.");
      return;
    }

    if (!hasLocation && !form.manualAddress.trim() && !form.city.trim()) {
      setError("Please allow location or enter city/manual location.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        incidentType: form.incidentType,
        severity: form.severity,
        description: patientProfileLink
          ? `${form.description || ""}\n\nPatient QR Profile: ${patientProfileLink}`.trim()
          : form.description,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        manualAddress: form.manualAddress,
        city: form.city,
        state: form.state,
      };

      const endpoint = isPatientMode ? "/sos/patient" : "/sos/public";

      const res = await API.post(endpoint, payload);

      setSosResult(res.data.sosRequest);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while creating SOS request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(emergencyMessage);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setError("Unable to copy emergency message.");
    }
  };

  const openLink = (url) => {
    if (!url) {
      setError("Please allow location or enter manual location first.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-cyan-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-xl shadow-red-100/50">
          <div className="relative bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 px-6 py-10 text-white sm:px-10">
            <div className="absolute right-6 top-6 hidden h-28 w-28 rounded-full bg-white/10 blur-2xl sm:block" />
            <div className="absolute bottom-0 left-1/2 hidden h-32 w-32 rounded-full bg-yellow-300/20 blur-3xl sm:block" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                  <ShieldAlert size={18} />
                  Emergency SOS & Instant Help
                </div>

                <h1 className="text-3xl font-black leading-tight sm:text-5xl">
                  Get urgent medical help near your location
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-red-50 sm:text-base">
                  Select the emergency type, share your location, call emergency
                  helplines, and find nearby hospitals, clinics, and pharmacies
                  instantly.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="tel:112"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-red-600 shadow-lg transition hover:scale-105"
                  >
                    <Phone size={18} />
                    Call 112
                  </a>

                  <a
                    href="tel:108"
                    className="inline-flex items-center gap-2 rounded-full bg-yellow-300 px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:scale-105"
                  >
                    <Ambulance size={18} />
                    Call 108 Ambulance
                  </a>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/20 bg-white/15 p-5 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-600">
                    <AlertTriangle />
                  </div>

                  <div>
                    <h2 className="font-bold">Important Safety Notice</h2>
                    <p className="text-sm text-red-50">
                      In critical emergencies, call emergency services
                      immediately. Do not wait only for online response.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-white/15 p-4 text-sm leading-6 text-red-50">
                  For symptoms like chest pain, stroke signs, severe bleeding,
                  breathing difficulty, or unconsciousness, use the call buttons
                  first.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={submitSos}
            className="rounded-[2rem] border border-white bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-7"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                Create SOS Request
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isPatientMode
                  ? "Your patient account details will be attached with this SOS request."
                  : "No login required. Enter basic details and location to get help."}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {sosResult && (
              <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                SOS request created successfully. Use the nearby help buttons
                below.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-3 block text-sm font-bold text-slate-700">
                Select Emergency Incident *
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {incidents.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        incidentType: item.title,
                      }))
                    }
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:shadow-lg ${
                      form.incidentType === item.title
                        ? "border-red-300 bg-red-50 shadow-md shadow-red-100"
                        : "border-slate-200 bg-white hover:border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          form.incidentType === item.title
                            ? "bg-red-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <AlertTriangle size={16} />
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Severity
              </label>

              <div className="flex flex-wrap gap-2">
                {severityOptions.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        severity: level,
                      }))
                    }
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      form.severity === level
                        ? "bg-red-600 text-white shadow-lg shadow-red-100"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Emergency Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Example: My father is having chest pain and breathing difficulty."
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
              />
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-100 bg-cyan-50/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <MapPin size={18} className="text-cyan-600" />
                    Location
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Allow live location or enter manual address.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-100 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {locationLoading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <LocateFixed size={17} />
                  )}
                  Detect Location
                </button>
              </div>

              {locationStatus && (
                <p className="mt-3 text-xs font-semibold text-cyan-700">
                  {locationStatus}
                </p>
              )}

              {hasLocation && (
                <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-xs font-semibold text-slate-600">
                  Latitude: {location.latitude} | Longitude:{" "}
                  {location.longitude}
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City: Satna"
                  className="w-full rounded-2xl border border-cyan-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />

                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State: Madhya Pradesh"
                  className="w-full rounded-2xl border border-cyan-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  name="manualAddress"
                  value={form.manualAddress}
                  onChange={handleChange}
                  placeholder="Manual location: near railway station, Satna"
                  className="w-full rounded-2xl border border-cyan-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-orange-100 bg-orange-50 p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-black text-orange-900">
                    <QrCode size={20} />
                    Patient QR / ID
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-orange-700">
                    Optional: scan QR or enter patient ID to open the patient
                    health card during SOS.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setScannerOpen((prev) => !prev)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                    scannerOpen
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-white text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  {scannerOpen ? <X size={17} /> : <Camera size={17} />}
                  {scannerOpen ? "Close Scanner" : "Scan QR"}
                </button>
              </div>

              {scannerOpen && (
                <div className="mt-4">
                  <QRCodeScanner
                    onScanSuccess={handlePatientQrScan}
                    onClose={() => setScannerOpen(false)}
                  />
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={patientLookupId}
                  onChange={(e) => {
                    setPatientLookupId(e.target.value);
                    setPatientProfileLink("");
                  }}
                  placeholder="Enter patient ID manually"
                  className="w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />

                <button
                  type="button"
                  onClick={() => openPatientProfile(patientLookupId)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:bg-orange-700"
                >
                  <ExternalLink size={17} />
                  Open Profile
                </button>
              </div>

              {patientProfileLink && (
                <p className="mt-3 break-all rounded-2xl bg-white px-4 py-3 text-xs font-bold text-orange-700">
                  Linked with SOS: {patientProfileLink}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-red-100 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <ShieldAlert size={20} />
              )}
              Send Emergency SOS
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-7">
              <h2 className="text-2xl font-black text-slate-900">
                Instant Help
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Use these buttons immediately during emergency.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  href="tel:112"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
                >
                  <Phone size={18} />
                  Call 112
                </a>

                <a
                  href="tel:108"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-4 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600"
                >
                  <Ambulance size={18} />
                  Call 108
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-7">
              <h2 className="text-2xl font-black text-slate-900">
                Find Nearby Help
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Opens Google Maps based on your live or manual location.
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => openLink(googleLinks.hospitals)}
                  className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-left transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="flex items-center gap-3">
                    <Hospital className="text-red-600" />
                    <span>
                      <span className="block text-sm font-black text-slate-900">
                        Nearby Hospitals
                      </span>
                      <span className="text-xs text-slate-500">
                        Find hospitals around your current location
                      </span>
                    </span>
                  </span>
                  <Navigation size={18} className="text-red-600" />
                </button>

                <button
                  type="button"
                  onClick={() => openLink(googleLinks.clinics)}
                  className="flex items-center justify-between rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-4 text-left transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="flex items-center gap-3">
                    <Stethoscope className="text-cyan-600" />
                    <span>
                      <span className="block text-sm font-black text-slate-900">
                        Nearby Clinics / Doctors
                      </span>
                      <span className="text-xs text-slate-500">
                        Find clinics or doctors near you
                      </span>
                    </span>
                  </span>
                  <Navigation size={18} className="text-cyan-600" />
                </button>

                <button
                  type="button"
                  onClick={() => openLink(googleLinks.pharmacies)}
                  className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-left transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="flex items-center gap-3">
                    <Pill className="text-emerald-600" />
                    <span>
                      <span className="block text-sm font-black text-slate-900">
                        Nearby Pharmacies
                      </span>
                      <span className="text-xs text-slate-500">
                        Find medical stores near your location
                      </span>
                    </span>
                  </span>
                  <Navigation size={18} className="text-emerald-600" />
                </button>

                <button
                  type="button"
                  onClick={() => openLink(googleLinks.directions)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="flex items-center gap-3">
                    <MapPin className="text-slate-700" />
                    <span>
                      <span className="block text-sm font-black text-slate-900">
                        View My Location
                      </span>
                      <span className="text-xs text-slate-500">
                        Open your shared location on Google Maps
                      </span>
                    </span>
                  </span>
                  <Navigation size={18} className="text-slate-700" />
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Emergency Message
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Copy and share on WhatsApp or SMS.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyMessage}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  {copied ? <CheckCircle size={17} /> : <Copy size={17} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <pre className="mt-5 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                {emergencyMessage}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOS;
