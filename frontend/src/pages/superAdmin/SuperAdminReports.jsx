import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Download,
  Eye,
  FileText,
  FileType,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Stethoscope,
  Building2,
  User,
  Users,
} from "lucide-react";
import API from "../../api/axios";

const SuperAdminReports = () => {
  const [reports, setReports] = useState([]);
  const [patientId, setPatientId] = useState("");

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const [mode, setMode] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      setMode("all");

      const res = await API.get("/reports/super-admin/all");
      setReports(res.data.reports || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load all reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  const searchPatientReports = async (e) => {
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
        `/reports/super-admin/patient/${cleanPatientId}`,
      );

      setReports(res.data.reports || []);
      setMode("patient");
      setMessage(`Showing reports for patient ID: ${cleanPatientId}`);
    } catch (err) {
      setReports([]);
      setError(
        err.response?.data?.message || "Failed to search patient reports",
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: reports.length,
      patient: reports.filter((report) => report.uploadedByRole === "patient")
        .length,
      doctor: reports.filter((report) => report.uploadedByRole === "doctor")
        .length,
      hospital: reports.filter(
        (report) => report.uploadedByRole === "hospitalAdmin",
      ).length,
      privateReports: reports.filter(
        (report) => report.visibility === "private",
      ).length,
    };
  }, [reports]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-slate-900 via-cyan-900 to-emerald-700 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-100">
              Super Admin Reports
            </p>

            <h1 className="text-3xl font-black md:text-4xl">
              Monitor platform medical reports
            </h1>

            <p className="mt-3 max-w-2xl text-cyan-50">
              View all reports, search patient records by unique ID, and monitor
              uploads from patients, doctors, and hospitals.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAllReports}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/20 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/30"
          >
            <RefreshCcw size={18} />
            Load All Reports
          </button>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={<FileText />}
          title="Total Reports"
          value={stats.total}
          desc="Current view"
        />

        <StatCard
          icon={<User />}
          title="Patient Uploads"
          value={stats.patient}
          desc="Uploaded by patients"
        />

        <StatCard
          icon={<Stethoscope />}
          title="Doctor Uploads"
          value={stats.doctor}
          desc="Uploaded by doctors"
        />

        <StatCard
          icon={<Building2 />}
          title="Hospital Uploads"
          value={stats.hospital}
          desc="Uploaded by hospitals"
        />

        <StatCard
          icon={<ShieldCheck />}
          title="Private"
          value={stats.privateReports}
          desc="Private reports"
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
            <Search />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              Search Reports by Patient Unique ID
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Example: PAT-2026-123456
            </p>
          </div>
        </div>

        <form
          onSubmit={searchPatientReports}
          className="grid gap-4 md:grid-cols-[1fr_auto_auto]"
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
            Search
          </button>

          <button
            type="button"
            onClick={fetchAllReports}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-8 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-200"
          >
            <Users size={18} />
            All
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {mode === "all" ? "All Platform Reports" : "Patient Reports"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Super admin can monitor reports uploaded by all platform roles.
            </p>
          </div>

          <button
            type="button"
            onClick={mode === "all" ? fetchAllReports : searchPatientReports}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-50 px-5 py-3 text-sm font-black text-cyan-700 transition hover:bg-cyan-100"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
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
              No medical reports are available for the current filter.
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
    </div>
  );
};

const ReportCard = ({ report }) => {
  const createdAt = report.createdAt
    ? new Date(report.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";

  const uploaderName = getUploaderName(report);

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

              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">
                {report.uploadedByRole}
              </span>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                {report.visibility}
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

              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={14} />
                Patient ID: {report.patientUniqueId}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <MiniInfo
                label="Patient"
                value={report.patient?.fullName || "Not available"}
              />

              <MiniInfo label="Uploaded By" value={uploaderName} />

              <MiniInfo
                label="Patient Email"
                value={report.patient?.email || "Not available"}
              />

              <MiniInfo
                label="Patient Phone"
                value={report.patient?.phone || "Not available"}
              />
            </div>

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

const getUploaderName = (report) => {
  if (report.uploadedByRole === "hospitalAdmin") {
    return report.hospital?.name || report.uploadedBy?.fullName || "Hospital";
  }

  if (report.uploadedByRole === "doctor") {
    return (
      report.doctor?.user?.fullName || report.uploadedBy?.fullName || "Doctor"
    );
  }

  if (report.uploadedByRole === "patient") {
    return report.uploadedBy?.fullName || "Patient";
  }

  if (report.uploadedByRole === "superAdmin") {
    return report.uploadedBy?.fullName || "Super Admin";
  }

  return report.uploadedBy?.fullName || "Uploader";
};

const MiniInfo = ({ label, value }) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-black text-slate-800">
        {value}
      </p>
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

export default SuperAdminReports;
