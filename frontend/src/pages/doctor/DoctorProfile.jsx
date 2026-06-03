import { useEffect, useState } from "react";
import {
  Stethoscope,
  Save,
  Loader2,
  Plus,
  Trash2,
  UserCheck,
  Languages,
  CalendarClock,
  IndianRupee,
  GraduationCap,
  MapPin,
  Video,
  Building2,
} from "lucide-react";
import API from "../../api/axios";
import {
  buildProfileFormData,
  isValidImageFile,
} from "../../utils/profileImageForm";

const emptyAvailability = {
  day: "Monday",
  startTime: "10:00 AM",
  endTime: "2:00 PM",
  isAvailable: true,
};

const DoctorProfile = () => {
  const [formData, setFormData] = useState({
    specialization: "",
    experience: "",
    consultationFee: "",
    bio: "",
    qualification: "",
    languages: "English, Hindi",
    consultationModes: ["offline"],
    clinicAddress: "",
    hospitalId: "",
    profileImage: "",
    availability: [emptyAvailability],
  });

  const [hospitals, setHospitals] = useState([]);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/doctors/profile/me");
      const doctor = res.data.doctor;

      setProfileExists(true);

      setFormData({
        specialization: doctor.specialization || "",
        experience: doctor.experience || "",
        consultationFee: doctor.consultationFee || "",
        bio: doctor.bio || "",
        qualification: doctor.qualification || "",
        languages: doctor.languages?.join(", ") || "English, Hindi",
        consultationModes: doctor.consultationModes || ["offline"],
        clinicAddress: doctor.clinicAddress || "",
        hospitalId: doctor.hospital?._id || doctor.hospital || "",
        profileImage: doctor.profileImage || "",
        availability:
          doctor.availability && doctor.availability.length > 0
            ? doctor.availability
            : [emptyAvailability],
      });
      setProfileImageFile(null);
      setProfileImagePreview(doctor.profileImage || "");
    } catch (err) {
      if (err.response?.status === 404) {
        setProfileExists(false);
        setProfileImageFile(null);
        setProfileImagePreview("");
      } else {
        setError(err.response?.data?.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await API.get("/hospitals");

      setHospitals(res.data.hospitals || []);
    } catch (err) {
      setHospitals([]);
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
    fetchHospitals();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "profileImage" && !profileImageFile) {
      setProfileImagePreview(value);
    }
  };

  const handleProfileImageFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setProfileImageFile(null);
      setProfileImagePreview(formData.profileImage);
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

  const handleModeChange = (mode) => {
    setFormData((prev) => {
      const alreadySelected = prev.consultationModes.includes(mode);

      return {
        ...prev,
        consultationModes: alreadySelected
          ? prev.consultationModes.filter((item) => item !== mode)
          : [...prev.consultationModes, mode],
      };
    });
  };

  const handleAvailabilityChange = (index, field, value) => {
    const updatedAvailability = [...formData.availability];

    updatedAvailability[index] = {
      ...updatedAvailability[index],
      [field]: field === "isAvailable" ? value === "true" : value,
    };

    setFormData((prev) => ({
      ...prev,
      availability: updatedAvailability,
    }));
  };

  const addAvailability = () => {
    setFormData((prev) => ({
      ...prev,
      availability: [...prev.availability, emptyAvailability],
    }));
  };

  const removeAvailability = (index) => {
    if (formData.availability.length === 1) return;

    const updatedAvailability = formData.availability.filter(
      (_, itemIndex) => itemIndex !== index,
    );

    setFormData((prev) => ({
      ...prev,
      availability: updatedAvailability,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.consultationModes.length === 0) {
      setError("Please select at least one consultation mode");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payloadData = {
        ...formData,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
        languages: formData.languages
          .split(",")
          .map((language) => language.trim())
          .filter(Boolean),
      };

      const payload = buildProfileFormData(payloadData, profileImageFile, [
        "languages",
        "consultationModes",
        "availability",
      ]);

      if (profileExists) {
        await API.patch("/doctors/profile", payload);
        setMessage("Doctor profile updated successfully");
      } else {
        await API.post("/doctors/profile", payload);
        setProfileExists(true);
        setMessage("Doctor profile created successfully");
      }

      await fetchDoctorProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save doctor profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-cyan-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold">
              <UserCheck size={18} />
              Doctor Professional Profile
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              {profileExists ? "Update your profile" : "Create your profile"}
            </h1>

            <p className="mt-3 max-w-2xl text-cyan-50">
              Add your specialization, experience, consultation fee,
              availability, and clinic details so patients can find and book you
              easily.
            </p>
          </div>

          <div className="rounded-3xl bg-white/20 p-5 backdrop-blur-xl">
            <Stethoscope size={46} />
          </div>
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl">
          <h2 className="mb-6 text-2xl font-black text-slate-900">
            Basic Professional Details
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              icon={<Stethoscope />}
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="Cardiologist"
              required
            />

            <InputField
              icon={<GraduationCap />}
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="MBBS, MD Cardiology"
              required
            />

            <InputField
              icon={<CalendarClock />}
              label="Experience"
              name="experience"
              type="number"
              value={formData.experience}
              onChange={handleChange}
              placeholder="5"
              required
            />

            <InputField
              icon={<IndianRupee />}
              label="Consultation Fee"
              name="consultationFee"
              type="number"
              value={formData.consultationFee}
              onChange={handleChange}
              placeholder="700"
              required
            />

            <InputField
              icon={<Languages />}
              label="Languages"
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              placeholder="English, Hindi"
              required
            />

            <InputField
              icon={<MapPin />}
              label="Clinic Address"
              name="clinicAddress"
              value={formData.clinicAddress}
              onChange={handleChange}
              placeholder="Bhopal, Madhya Pradesh"
            />

            <SelectField
              label="Associated Hospital"
              value={formData.hospitalId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hospitalId: e.target.value,
                }))
              }
              options={[
                { label: "No hospital selected", value: "" },
                ...hospitals.map((hospital) => ({
                  label: `${hospital.name}${
                    hospital.city ? ` - ${hospital.city}` : ""
                  }`,
                  value: hospital._id,
                })),
              ]}
            />

            <div className="md:col-span-2">
              <ProfileImageInput
                imageUrl={formData.profileImage}
                preview={profileImagePreview}
                onUrlChange={handleChange}
                onFileChange={handleProfileImageFileChange}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Doctor Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="5"
                required
                placeholder="Write about your experience, treatment approach, and patient care style..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl">
          <h2 className="mb-6 text-2xl font-black text-slate-900">
            Consultation Modes
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <ModeCard
              icon={<Building2 />}
              title="Offline Consultation"
              desc="Patients can visit your clinic or hospital."
              active={formData.consultationModes.includes("offline")}
              onClick={() => handleModeChange("offline")}
            />

            <ModeCard
              icon={<Video />}
              title="Online Consultation"
              desc="Patients can consult through video or online mode."
              active={formData.consultationModes.includes("online")}
              onClick={() => handleModeChange("online")}
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Availability
              </h2>
              <p className="text-sm text-slate-500">
                Add your available days and consultation timings.
              </p>
            </div>

            <button
              type="button"
              onClick={addAvailability}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-50 px-5 py-3 text-sm font-black text-cyan-700 transition hover:bg-cyan-100"
            >
              <Plus size={17} />
              Add Slot
            </button>
          </div>

          <div className="space-y-4">
            {formData.availability.map((slot, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-5"
              >
                <SelectField
                  label="Day"
                  value={slot.day}
                  onChange={(e) =>
                    handleAvailabilityChange(index, "day", e.target.value)
                  }
                  options={[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ]}
                />

                <InputField
                  label="Start Time"
                  value={slot.startTime}
                  onChange={(e) =>
                    handleAvailabilityChange(index, "startTime", e.target.value)
                  }
                  placeholder="10:00 AM"
                />

                <InputField
                  label="End Time"
                  value={slot.endTime}
                  onChange={(e) =>
                    handleAvailabilityChange(index, "endTime", e.target.value)
                  }
                  placeholder="2:00 PM"
                />

                <SelectField
                  label="Status"
                  value={String(slot.isAvailable)}
                  onChange={(e) =>
                    handleAvailabilityChange(
                      index,
                      "isAvailable",
                      e.target.value,
                    )
                  }
                  options={[
                    { label: "Available", value: "true" },
                    { label: "Unavailable", value: "false" },
                  ]}
                />

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeAvailability(index)}
                    disabled={formData.availability.length === 1}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={17} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-cyan-100 transition hover:scale-[1.01] disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={19} />
          ) : (
            <Save size={19} />
          )}
          {profileExists ? "Update Doctor Profile" : "Create Doctor Profile"}
        </button>
      </form>
    </div>
  );
};

const InputField = ({
  icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => {
  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-bold text-slate-700">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100 ${
            icon ? "pl-12" : ""
          }`}
        />
      </div>
    </div>
  );
};

const SelectField = ({ label, value, onChange, options }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
      >
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
    </div>
  );
};

const ProfileImageInput = ({ imageUrl, preview, onUrlChange, onFileChange }) => {
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[130px_1fr]">
      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl bg-white text-cyan-600 shadow-sm">
        {preview ? (
          <img
            src={preview}
            alt="Doctor profile preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <UserCheck size={44} />
        )}
      </div>

      <div className="space-y-4">
        <InputField
          icon={<UserCheck />}
          label="Profile Image URL"
          name="profileImage"
          value={imageUrl}
          onChange={onUrlChange}
          placeholder="Paste image URL"
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

const ModeCard = ({ icon, title, desc, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-5 text-left transition ${
        active
          ? "border-cyan-300 bg-cyan-50 shadow-lg shadow-cyan-100"
          : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/50"
      }`}
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
          active
            ? "bg-gradient-to-br from-cyan-600 to-emerald-500 text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </div>

      <h3 className="text-lg font-black text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </button>
  );
};

export default DoctorProfile;
