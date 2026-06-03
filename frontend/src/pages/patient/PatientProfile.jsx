import { useEffect, useState } from "react";
import {
  User,
  HeartPulse,
  Phone,
  MapPin,
  ShieldCheck,
  Loader2,
  Save,
  RefreshCcw,
  Plus,
  X,
  Droplet,
  Ruler,
  Weight,
  FileText,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";
import API from "../../api/axios";
import { QRCodeCanvas } from "qrcode.react";
import {
  buildProfileFormData,
  isValidImageFile,
} from "../../utils/profileImageForm";

const defaultForm = {
  age: 0,
  gender: "",
  bloodGroup: "",
  height: 0,
  weight: 0,
  address: "",
  city: "",
  state: "",
  pincode: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  emergencyContactRelation: "",
  medicalConditions: [],
  allergies: [],
  currentMedications: [],
  pastSurgeries: [],
  insuranceProvider: "",
  insuranceNumber: "",
  profileImage: "",
};

const PatientProfile = () => {
  const [form, setForm] = useState(defaultForm);
  const [profile, setProfile] = useState(null);
  const [profileExists, setProfileExists] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const [conditionInput, setConditionInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [medicineInput, setMedicineInput] = useState("");
  const [surgeryInput, setSurgeryInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.get("/patients/profile/me");

      setProfile(res.data.profile);
      setForm({
        ...defaultForm,
        ...res.data.profile,
      });
      setProfileImageFile(null);
      setProfileImagePreview(res.data.profile.profileImage || "");

      setProfileExists(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfileExists(false);
        setProfile(null);
        setForm(defaultForm);
        setProfileImageFile(null);
        setProfileImagePreview("");
      } else {
        setError(
          err.response?.data?.message || "Failed to load patient profile",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));

    if (name === "profileImage" && !profileImageFile) {
      setProfileImagePreview(value);
    }
  };

  const handleProfileImageFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setProfileImageFile(null);
      setProfileImagePreview(form.profileImage);
      return;
    }

    if (!isValidImageFile(file)) {
      setError("Only JPG, PNG, and WEBP profile images are allowed");
      return;
    }

    setError("");
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const addItem = (field, value, setter) => {
    const cleanValue = value.trim();

    if (!cleanValue) return;

    if (form[field].includes(cleanValue)) {
      setter("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], cleanValue],
    }));

    setter("");
  };

  const removeItem = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = buildProfileFormData(form, profileImageFile, [
        "medicalConditions",
        "allergies",
        "currentMedications",
        "pastSurgeries",
      ]);

      if (profileExists) {
        await API.patch("/patients/profile", payload);
        setMessage("Patient profile updated successfully");
      } else {
        await API.post("/patients/profile", payload);
        setMessage("Patient profile created successfully");
      }

      await fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save patient profile");
    } finally {
      setSaving(false);
    }
  };

  const emergencyProfileUrl = profile?.patientId
    ? `${window.location.origin}/patient-card/${profile.patientId}`
    : "";

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <Loader2 className="animate-spin text-cyan-600" size={44} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-100">
              Patient Profile
            </p>

            <h1 className="text-3xl font-black md:text-4xl">
              Manage your health identity
            </h1>

            <p className="mt-3 max-w-2xl text-cyan-50">
              Add personal details, emergency contact, blood group, medical
              history, allergies, and emergency QR-ready information.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchProfile}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/20 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/30"
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

      {!profileExists && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-bold text-orange-700">
          No patient profile found. Fill the form below to create your profile.
        </div>
      )}

      {profile?.patientId && (
        <section className="grid gap-5 lg:grid-cols-3">
          <InfoCard
            icon={<BadgeCheck />}
            title="Unique Patient ID"
            value={profile.patientId}
          />

          <InfoCard
            icon={<ShieldCheck />}
            title="Profile Status"
            value={profile.isProfileComplete ? "Complete" : "Incomplete"}
          />

          <InfoCard
            icon={<AlertTriangle />}
            title="Emergency Profile"
            value="QR Ready"
          />
        </section>
      )}

      {emergencyProfileUrl && (
        <section className="rounded-[2rem] border border-cyan-100 bg-cyan-50 p-5">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <QRCodeCanvas
                id="emergency-qr-code"
                value={emergencyProfileUrl}
                size={180}
                level="H"
                includeMargin
              />
            </div>

            <div>
              <p className="text-sm font-black text-cyan-800">
                Patient QR Profile
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Scan this QR to open your health profile
              </h2>

              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                This QR opens your linked patient profile page with contact,
                emergency, medical, address, and insurance details.
              </p>

              <p className="mt-4 break-all rounded-2xl bg-white p-4 text-sm font-bold text-cyan-700">
                {emergencyProfileUrl}
              </p>

              <button
                type="button"
                onClick={() => {
                  const canvas = document.getElementById("emergency-qr-code");
                  const pngUrl = canvas
                    .toDataURL("image/png")
                    .replace("image/png", "image/octet-stream");

                  const downloadLink = document.createElement("a");
                  downloadLink.href = pngUrl;
                  downloadLink.download = "patient-profile-qr.png";
                  document.body.appendChild(downloadLink);
                  downloadLink.click();
                  document.body.removeChild(downloadLink);
                }}
                className="mt-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-cyan-100 transition hover:scale-[1.01]"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </section>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
          <SectionTitle
            icon={<User />}
            title="Basic Health Details"
            description="Personal health identity and physical information."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Input
              label="Age"
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              icon={<User />}
            />

            <Select
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              options={["", "Male", "Female", "Other"]}
            />

            <Select
              label="Blood Group"
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              options={["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
            />

            <div className="md:col-span-2 xl:col-span-2">
              <ProfileImageInput
                imageUrl={form.profileImage}
                preview={profileImagePreview}
                onUrlChange={handleChange}
                onFileChange={handleProfileImageFileChange}
              />
            </div>

            <Input
              label="Height"
              name="height"
              type="number"
              value={form.height}
              onChange={handleChange}
              icon={<Ruler />}
            />

            <Input
              label="Weight"
              name="weight"
              type="number"
              value={form.weight}
              onChange={handleChange}
              icon={<Weight />}
            />

            <Input
              label="Insurance Provider"
              name="insuranceProvider"
              value={form.insuranceProvider}
              onChange={handleChange}
              icon={<ShieldCheck />}
            />

            <Input
              label="Insurance Number"
              name="insuranceNumber"
              value={form.insuranceNumber}
              onChange={handleChange}
              icon={<ShieldCheck />}
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
          <SectionTitle
            icon={<MapPin />}
            title="Address Details"
            description="Patient residential address and city information."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              icon={<MapPin />}
            />

            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              icon={<MapPin />}
            />

            <Input
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              icon={<MapPin />}
            />

            <Input
              label="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              icon={<MapPin />}
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
          <SectionTitle
            icon={<Phone />}
            title="Emergency Contact"
            description="This contact will be shown in emergency profile."
          />

          <div className="grid gap-5 md:grid-cols-3">
            <Input
              label="Emergency Contact Name"
              name="emergencyContactName"
              value={form.emergencyContactName}
              onChange={handleChange}
              icon={<User />}
            />

            <Input
              label="Emergency Contact Number"
              name="emergencyContactNumber"
              value={form.emergencyContactNumber}
              onChange={handleChange}
              icon={<Phone />}
            />

            <Input
              label="Relation"
              name="emergencyContactRelation"
              value={form.emergencyContactRelation}
              onChange={handleChange}
              icon={<HeartPulse />}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <TagBox
            title="Medical Conditions"
            description="Example: Diabetes, Asthma, High BP"
            value={conditionInput}
            onChange={setConditionInput}
            onAdd={() =>
              addItem("medicalConditions", conditionInput, setConditionInput)
            }
            items={form.medicalConditions}
            onRemove={(item) => removeItem("medicalConditions", item)}
            icon={<HeartPulse />}
          />

          <TagBox
            title="Allergies"
            description="Example: Dust Allergy, Peanut Allergy"
            value={allergyInput}
            onChange={setAllergyInput}
            onAdd={() => addItem("allergies", allergyInput, setAllergyInput)}
            items={form.allergies}
            onRemove={(item) => removeItem("allergies", item)}
            icon={<AlertTriangle />}
          />

          <TagBox
            title="Current Medications"
            description="Example: Insulin, Vitamin D"
            value={medicineInput}
            onChange={setMedicineInput}
            onAdd={() =>
              addItem("currentMedications", medicineInput, setMedicineInput)
            }
            items={form.currentMedications}
            onRemove={(item) => removeItem("currentMedications", item)}
            icon={<Droplet />}
          />

          <TagBox
            title="Past Surgeries"
            description="Example: Appendix surgery"
            value={surgeryInput}
            onChange={setSurgeryInput}
            onAdd={() =>
              addItem("pastSurgeries", surgeryInput, setSurgeryInput)
            }
            items={form.pastSurgeries}
            onRemove={(item) => removeItem("pastSurgeries", item)}
            icon={<FileText />}
          />
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-cyan-100 transition hover:scale-[1.01] disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {profileExists
              ? "Update Patient Profile"
              : "Create Patient Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

const SectionTitle = ({ icon, title, description }) => {
  return (
    <div className="mb-6 flex gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-black text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
};

const Input = ({ label, name, value, onChange, icon, type = "text" }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600">
          {icon}
        </span>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          min={type === "number" ? "0" : undefined}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </div>
    </div>
  );
};

const Select = ({ label, name, value, onChange, options }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "Select"}
          </option>
        ))}
      </select>
    </div>
  );
};

const ProfileImageInput = ({ imageUrl, preview, onUrlChange, onFileChange }) => {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[120px_1fr]">
      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-white text-cyan-600 shadow-sm">
        {preview ? (
          <img
            src={preview}
            alt="Profile preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <User size={42} />
        )}
      </div>

      <div className="space-y-4">
        <Input
          label="Profile Image URL"
          name="profileImage"
          value={imageUrl}
          onChange={onUrlChange}
          icon={<FileText />}
        />

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Upload From Device
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={onFileChange}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
          />
        </div>
      </div>
    </div>
  );
};

const TagBox = ({
  title,
  description,
  value,
  onChange,
  onAdd,
  items,
  onRemove,
  icon,
}) => {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
      <SectionTitle icon={icon} title={title} description={description} />

      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={`Add ${title.toLowerCase()}`}
          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />

        <button
          type="button"
          onClick={onAdd}
          className="rounded-2xl bg-cyan-600 px-4 py-3 text-white transition hover:bg-cyan-700"
        >
          <Plus size={18} />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-400">
          No items added yet.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700"
            >
              {item}

              <button type="button" onClick={() => onRemove(item)}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const InfoCard = ({ icon, title, value }) => {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>

      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      <p className="mt-2 break-all text-xl font-black text-slate-900">
        {value}
      </p>
    </div>
  );
};

export default PatientProfile;
