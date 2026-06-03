import { useEffect, useMemo, useState } from "react";
import {
  UploadCloud,
  FileText,
  Loader2,
  Trash2,
  Eye,
  RefreshCcw,
  User,
  Stethoscope,
  CalendarDays,
  FileType,
  ShieldCheck,
  AlertCircle,
  Download,
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
  "General Report",
  "Other",
];

const PatientReports = () => {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({
    title: "",
    reportType: "General Report",
    description: "",
    visibility: "doctor-visible",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.get("/reports/my-reports");
      setReports(res.data.reports || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const stats = useMemo(() => {
    const patientUploaded = reports.filter(
      (item) => item.uploadedByRole === "patient",
    ).length;

    const doctorUploaded = reports.filter(
      (item) => item.uploadedByRole === "doctor",
    ).length;

    return {
      total: reports.length,
      patientUploaded,
      doctorUploaded,
      doctorVisible: reports.filter(
        (item) => item.visibility === "doctor-visible",
      ).length,
    };
  }, [reports]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      formData.append("visibility", form.visibility);
      formData.append("report", selectedFile);

      await API.post("/reports/patient/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Report uploaded successfully");

      setForm({
        title: "",
        reportType: "General Report",
        description: "",
        visibility: "doctor-visible",
      });

      setSelectedFile(null);

      const fileInput = document.getElementById("patient-report-file");
      if (fileInput) fileInput.value = "";

      await fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (reportId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report?",
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(reportId);
      setError("");
      setMessage("");

      await API.delete(`/reports/my-reports/${reportId}`);

      setMessage("Report deleted successfully");
      await fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete report");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-100">
              Patient Medical Reports
            </p>

            <h1 className="text-3xl font-black md:text-4xl">
              Manage your health documents
            </h1>

            <p className="mt-3 max-w-2xl text-cyan-50">
              Upload reports, prescriptions, scans, and view reports uploaded by
              doctors after your checkup.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchReports}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/20 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/30"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FileText />}
          title="Total Reports"
          value={stats.total}
          desc="All reports"
        />
        <StatCard
          icon={<User />}
          title="Uploaded By You"
          value={stats.patientUploaded}
          desc="Patient uploads"
        />
        <StatCard
          icon={<Stethoscope />}
          title="Doctor Reports"
          value={stats.doctorUploaded}
          desc="Uploaded by doctor"
        />
        <StatCard
          icon={<ShieldCheck />}
          title="Doctor Visible"
          value={stats.doctorVisible}
          desc="Can be reviewed"
        />
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
            <UploadCloud />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              Upload New Report
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Allowed files: JPG, PNG, WEBP, PDF. Maximum size: 10MB.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Report Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Example: Blood Test Report"
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
              <option value="doctor-visible">Doctor Visible</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Report File
            </label>

            <input
              id="patient-report-file"
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

          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="Write short details about this report..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-cyan-100 transition hover:scale-[1.01] disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <UploadCloud size={18} />
              )}
              Upload Report
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900">My Reports</h2>
          <p className="mt-1 text-sm text-slate-500">
            Reports uploaded by you and doctors will appear here.
          </p>
        </div>

        {loading ? (
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
              Upload your first medical report using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                deleteLoading={deleteLoading}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const ReportCard = ({ report, deleteLoading, onDelete }) => {
  const uploadedByDoctor = report.uploadedByRole === "doctor";

  const uploaderName = uploadedByDoctor
    ? report.doctor?.user?.fullName || report.uploadedBy?.fullName || "Doctor"
    : report.uploadedBy?.fullName || "You";

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

              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  uploadedByDoctor
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-cyan-100 text-cyan-700"
                }`}
              >
                {uploadedByDoctor ? "Doctor Uploaded" : "Uploaded By You"}
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

          {report.uploadedByRole === "patient" && (
            <button
              onClick={() => onDelete(report._id)}
              disabled={deleteLoading === report._id}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-60"
            >
              {deleteLoading === report._id ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Trash2 size={17} />
              )}
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
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

const StatCard = ({ icon, title, value, desc }) => {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>

      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
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

export default PatientReports;
