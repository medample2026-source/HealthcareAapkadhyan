import { useEffect, useState } from "react";
import {
  Search,
  UploadCloud,
  FileText,
  Loader2,
  Eye,
  RefreshCcw,
  User,
  CalendarDays,
  FileType,
  ShieldCheck,
  AlertCircle,
  Download,
  Droplet,
  Phone,
  HeartPulse,
  Pill,
  ClipboardPlus,
  Building2,
  Hospital,
} from "lucide-react";
import API from "../../api/axios";

const reportTypes = [
  "Blood Test",
  "X-Ray",
  "MRI",
  "CT Scan",
  "Ultrasound",
  "Prescription",
  "Diagnosis",
  "Discharge Summary",
  "Lab Report",
  "Emergency Report",
  "Admission Report",
  "General Report",
  "Other",
];

const HospitalReports = () => {
  const [patientId, setPatientId] = useState("");
  const [searchedPatientId, setSearchedPatientId] = useState("");
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);

  const [form, setForm] = useState({
    title: "",
    reportType: "Lab Report",
    description: "",
    diagnosisNote: "",
    prescriptionNote: "",
    hospitalNote: "",
    visibility: "hospital-visible",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const [searchLoading, setSearchLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const searchPatient = async (e) => {
    e.preventDefault();

    if (!patientId.trim()) {
      setError("Please enter patient unique ID");
      return;
    }

    try {
      setSearchLoading(true);
      setError("");
      setMessage("");

      const cleanPatientId = patientId.trim();

      const res = await API.get(
        `/reports/hospital/search-patient/${cleanPatientId}`,
      );

      setPatient(res.data.patient);
      setSearchedPatientId(cleanPatientId);

      await fetchPatientReports(cleanPatientId);
    } catch (err) {
      setPatient(null);
      setReports([]);
      setSearchedPatientId("");
      setError(err.response?.data?.message || "Patient not found");
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchPatientReports = async (id = searchedPatientId) => {
    if (!id) return;

    try {
      setReportsLoading(true);
      setError("");

      const res = await API.get(`/reports/hospital/patient/${id}`);
      setReports(res.data.reports || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patient reports");
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryPatientId = params.get("patientId");

    if (queryPatientId) {
      setPatientId(queryPatientId);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, WEBP, and PDF files are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      e.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!searchedPatientId) {
      setError("Search patient first before uploading report");
      return;
    }

    if (!selectedFile) {
      setError("Please select a report file");
      return;
    }

    if (!form.title.trim()) {
      setError("Report title is required");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("reportType", form.reportType);
      formData.append("description", form.description);
      formData.append("diagnosisNote", form.diagnosisNote);
      formData.append("prescriptionNote", form.prescriptionNote);
      formData.append("hospitalNote", form.hospitalNote);
      formData.append("visibility", form.visibility);
      formData.append("report", selectedFile);

      await API.post(
        `/reports/hospital/upload/${searchedPatientId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setMessage("Report uploaded for patient successfully");

      setForm({
        title: "",
        reportType: "Lab Report",
        description: "",
        diagnosisNote: "",
        prescriptionNote: "",
        hospitalNote: "",
        visibility: "hospital-visible",
      });

      setSelectedFile(null);

      const fileInput = document.getElementById("hospital-report-file");
      if (fileInput) fileInput.value = "";

      await fetchPatientReports(searchedPatientId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-100">
              Hospital Reports
            </p>

            <h1 className="text-3xl font-black md:text-4xl">
              Upload patient hospital records
            </h1>

            <p className="mt-3 max-w-2xl text-cyan-50">
              Search patient using unique ID and upload lab reports, admission
              notes, discharge summaries, and emergency documents.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchPatientReports()}
            disabled={!searchedPatientId}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/20 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/30 disabled:opacity-50"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>
      </section>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
        <div className="mb-6 flex gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <Search />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              Search Patient by Unique ID
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Example: PAT-2026-123456
            </p>
          </div>
        </div>

        <form
          onSubmit={searchPatient}
          className="grid gap-4 md:grid-cols-[1fr_auto]"
        >
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="Enter patient unique ID"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold uppercase outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />

          <button
            type="submit"
            disabled={searchLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-cyan-100 transition hover:scale-[1.01] disabled:opacity-60"
          >
            {searchLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Search size={18} />
            )}
            Search Patient
          </button>
        </form>
      </section>

      {patient && (
        <>
          <section className="grid gap-5 lg:grid-cols-4">
            <PatientInfoCard
              icon={<User />}
              title="Patient"
              value={patient.fullName || "Not available"}
            />

            <PatientInfoCard
              icon={<Droplet />}
              title="Blood Group"
              value={patient.bloodGroup || "Not added"}
              danger
            />

            <PatientInfoCard
              icon={<Phone />}
              title="Phone"
              value={patient.phone || "Not added"}
            />

            <PatientInfoCard
              icon={<ShieldCheck />}
              title="Patient ID"
              value={patient.patientUniqueId}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <HealthSummary
              icon={<HeartPulse />}
              title="Medical Conditions"
              items={patient.medicalConditions || []}
            />

            <HealthSummary
              icon={<AlertCircle />}
              title="Allergies"
              items={patient.allergies || []}
              danger
            />

            <HealthSummary
              icon={<Pill />}
              title="Current Medications"
              items={patient.currentMedications || []}
            />
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
            <div className="mb-6 flex gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Hospital />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Upload Hospital Report
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Upload lab report, discharge summary, emergency record, or
                  admission document for this patient.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="grid gap-5 lg:grid-cols-2">
              <Input
                label="Report Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: CBC Lab Report"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Report Type
                </label>

                <select
                  name="reportType"
                  value={form.reportType}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Visibility
                </label>

                <select
                  name="visibility"
                  value={form.visibility}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="hospital-visible">Hospital Visible</option>
                  <option value="all-medical-staff">All Medical Staff</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Report File
                </label>

                <input
                  id="hospital-report-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                />

                {selectedFile && (
                  <p className="mt-2 text-xs font-bold text-cyan-700">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <Textarea
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short details about this hospital report..."
              />

              <Textarea
                label="Diagnosis Note"
                name="diagnosisNote"
                value={form.diagnosisNote}
                onChange={handleChange}
                placeholder="Diagnosis details if available..."
              />

              <Textarea
                label="Prescription Note"
                name="prescriptionNote"
                value={form.prescriptionNote}
                onChange={handleChange}
                placeholder="Prescription note if given..."
              />

              <Textarea
                label="Hospital Note"
                name="hospitalNote"
                value={form.hospitalNote}
                onChange={handleChange}
                placeholder="Example: Uploaded after lab verification / emergency admission / discharge..."
              />

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-cyan-100 transition hover:scale-[1.01] disabled:opacity-60"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <ClipboardPlus size={18} />
                  )}
                  Upload Hospital Report
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Patient Reports
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Hospital-visible and all-medical-staff reports for this
                  patient.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchPatientReports()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-50 px-5 py-3 text-sm font-black text-cyan-700 transition hover:bg-cyan-100"
              >
                <RefreshCcw size={18} />
                Refresh Reports
              </button>
            </div>

            {reportsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-cyan-600" size={42} />
              </div>
            ) : reports.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-cyan-200 bg-cyan-50/60 p-10 text-center">
                <FileText className="mx-auto mb-4 text-cyan-600" size={50} />
                <h3 className="text-xl font-black text-slate-900">
                  No reports found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Upload a hospital report or choose all-medical-staff
                  visibility.
                </p>
              </div>
            ) : (
              <div className="grid gap-5">
                {reports.map((report) => (
                  <ReportCard key={report._id} report={report} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

const ReportCard = ({ report }) => {
  const uploadedByHospital = report.uploadedByRole === "hospitalAdmin";
  const uploadedByDoctor = report.uploadedByRole === "doctor";

  let uploaderName = report.uploadedBy?.fullName || "Uploader";

  if (uploadedByHospital) {
    uploaderName =
      report.hospital?.name || report.uploadedBy?.fullName || "Hospital";
  }

  if (uploadedByDoctor) {
    uploaderName =
      report.doctor?.user?.fullName || report.uploadedBy?.fullName || "Doctor";
  }

  const createdAt = report.createdAt
    ? new Date(report.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <FileText size={28} />
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">
                {report.title}
              </h3>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                {report.uploadedByRole}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-500">
              <span className="inline-flex items-center gap-1">
                <FileType size={14} />
                {report.reportType}
              </span>

              <span className="inline-flex items-center gap-1">
                <CalendarDays size={14} />
                {createdAt}
              </span>

              <span className="inline-flex items-center gap-1 capitalize">
                <ShieldCheck size={14} />
                {report.visibility}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Uploaded by:{" "}
              <span className="font-black text-slate-800">{uploaderName}</span>
            </p>

            {report.description && (
              <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {report.description}
              </p>
            )}

            {report.diagnosisNote && (
              <NoteBox title="Diagnosis Note" text={report.diagnosisNote} />
            )}

            {report.prescriptionNote && (
              <NoteBox
                title="Prescription Note"
                text={report.prescriptionNote}
              />
            )}

            {report.hospitalNote && (
              <NoteBox title="Hospital Note" text={report.hospitalNote} />
            )}

            {report.originalFileName && (
              <p className="mt-3 text-xs font-bold text-slate-400">
                File: {report.originalFileName}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 lg:justify-end">
          <a
            href={report.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-50 px-5 py-3 text-sm font-black text-cyan-700 transition hover:bg-cyan-100"
          >
            <Eye size={17} />
            View
          </a>

          <a
            href={report.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
          >
            <Download size={17} />
            Open
          </a>
        </div>
      </div>
    </article>
  );
};

const PatientInfoCard = ({ icon, title, value, danger = false }) => {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
          danger ? "bg-red-50 text-red-600" : "bg-cyan-50 text-cyan-600"
        }`}
      >
        {icon}
      </div>

      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      <p className="mt-2 break-all text-xl font-black text-slate-900">
        {value}
      </p>
    </div>
  );
};

const HealthSummary = ({ icon, title, items, danger = false }) => {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            danger ? "bg-red-50 text-red-600" : "bg-cyan-50 text-cyan-600"
          }`}
        >
          {icon}
        </div>

        <h3 className="text-lg font-black text-slate-900">{title}</h3>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-400">
          No items listed.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className={`rounded-full px-4 py-2 text-sm font-black ${
                danger ? "bg-red-50 text-red-700" : "bg-cyan-50 text-cyan-700"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const NoteBox = ({ title, text }) => {
  return (
    <div className="mt-3 rounded-2xl bg-emerald-50 p-4">
      <p className="mb-1 flex items-center gap-2 text-sm font-black text-emerald-800">
        <AlertCircle size={15} />
        {title}
      </p>
      <p className="text-sm leading-6 text-emerald-700">{text}</p>
    </div>
  );
};

const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
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
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
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
        rows="4"
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </div>
  );
};

export default HospitalReports;
