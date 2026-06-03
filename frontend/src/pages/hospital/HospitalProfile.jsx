import { useEffect, useState } from "react";
import {
  Building2,
  Loader2,
  Save,
  RefreshCcw,
  Hospital,
  MapPin,
  Phone,
  Mail,
  Globe,
  Bed,
  Ambulance,
  ShieldCheck,
  Plus,
  X,
} from "lucide-react";
import API from "../../api/axios";
import {
  buildProfileFormData,
  isValidImageFile,
} from "../../utils/profileImageForm";

const defaultForm = {
  name: "",
  registrationNumber: "",
  hospitalType: "Private",
  description: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  contactNumber: "",
  emergencyNumber: "",
  email: "",
  website: "",
  profileImage: "",
  services: [],
  facilities: [],
  totalBeds: 0,
  availableBeds: 0,
  icuBeds: 0,
  availableIcuBeds: 0,
  emergencyAvailable: false,
  ambulanceAvailable: false,
  open24x7: false,
};

const HospitalProfile = () => {
  const [form, setForm] = useState(defaultForm);
  const [profileExists, setProfileExists] = useState(false);
  const [serviceInput, setServiceInput] = useState("");
  const [facilityInput, setFacilityInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.get("/hospitals/profile/me");

      setForm({
        ...defaultForm,
        ...res.data.hospital,
      });
      setProfileImageFile(null);
      setProfileImagePreview(res.data.hospital.profileImage || "");

      setProfileExists(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfileExists(false);
        setForm(defaultForm);
        setProfileImageFile(null);
        setProfileImagePreview("");
      } else {
        setError(err.response?.data?.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
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

  const addService = () => {
    const value = serviceInput.trim();

    if (!value) return;

    if (form.services.includes(value)) {
      setServiceInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      services: [...prev.services, value],
    }));

    setServiceInput("");
  };

  const removeService = (service) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.filter((item) => item !== service),
    }));
  };

  const addFacility = () => {
    const value = facilityInput.trim();

    if (!value) return;

    if (form.facilities.includes(value)) {
      setFacilityInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      facilities: [...prev.facilities, value],
    }));

    setFacilityInput("");
  };

  const removeFacility = (facility) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((item) => item !== facility),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = buildProfileFormData(form, profileImageFile, [
        "services",
        "facilities",
      ]);

      if (profileExists) {
        await API.patch("/hospitals/profile", payload);
        setMessage("Hospital profile updated successfully");
      } else {
        await API.post("/hospitals/profile", payload);
        setProfileExists(true);
        setMessage("Hospital profile created successfully");
      }

      await fetchProfile();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save hospital profile",
      );
    } finally {
      setSaving(false);
    }
  };

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
              Hospital Admin Profile
            </p>

            <h1 className="text-3xl font-black md:text-4xl">
              Manage hospital information
            </h1>

            <p className="mt-3 max-w-2xl text-cyan-50">
              Add hospital details, services, facilities, emergency support, and
              real-time bed availability.
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
          No hospital profile found. Fill the form below to create your hospital
          profile.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
          <SectionTitle
            icon={<Hospital />}
            title="Basic Hospital Details"
            description="Primary hospital identity and registration details."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Hospital Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              icon={<Building2 />}
              required
            />

            <Input
              label="Registration Number"
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={handleChange}
              icon={<ShieldCheck />}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Hospital Type
              </label>

              <select
                name="hospitalType"
                value={form.hospitalType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              >
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Multi-specialty">Multi-specialty</option>
                <option value="Clinic">Clinic</option>
                <option value="Diagnostic Center">Diagnostic Center</option>
                <option value="Emergency Center">Emergency Center</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <ProfileImageInput
                imageUrl={form.profileImage}
                preview={profileImagePreview}
                onUrlChange={handleChange}
                onFileChange={handleProfileImageFileChange}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                required
                placeholder="Write about hospital, departments, emergency support, doctors, facilities..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
          <SectionTitle
            icon={<MapPin />}
            title="Location & Contact"
            description="Address, phone, email, and website information."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              icon={<MapPin />}
              required
            />

            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              icon={<MapPin />}
              required
            />

            <Input
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              icon={<MapPin />}
              required
            />

            <Input
              label="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              icon={<MapPin />}
            />

            <Input
              label="Contact Number"
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleChange}
              icon={<Phone />}
              required
            />

            <Input
              label="Emergency Number"
              name="emergencyNumber"
              value={form.emergencyNumber}
              onChange={handleChange}
              icon={<Ambulance />}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              icon={<Mail />}
            />

            <Input
              label="Website"
              name="website"
              value={form.website}
              onChange={handleChange}
              icon={<Globe />}
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
          <SectionTitle
            icon={<Bed />}
            title="Beds & Emergency Availability"
            description="Update live bed and emergency availability information."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Input
              label="Total Beds"
              name="totalBeds"
              type="number"
              value={form.totalBeds}
              onChange={handleChange}
              icon={<Bed />}
            />

            <Input
              label="Available Beds"
              name="availableBeds"
              type="number"
              value={form.availableBeds}
              onChange={handleChange}
              icon={<Bed />}
            />

            <Input
              label="ICU Beds"
              name="icuBeds"
              type="number"
              value={form.icuBeds}
              onChange={handleChange}
              icon={<Bed />}
            />

            <Input
              label="Available ICU Beds"
              name="availableIcuBeds"
              type="number"
              value={form.availableIcuBeds}
              onChange={handleChange}
              icon={<Bed />}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Toggle
              label="Emergency Available"
              name="emergencyAvailable"
              checked={form.emergencyAvailable}
              onChange={handleChange}
            />

            <Toggle
              label="Ambulance Available"
              name="ambulanceAvailable"
              checked={form.ambulanceAvailable}
              onChange={handleChange}
            />

            <Toggle
              label="Open 24x7"
              name="open24x7"
              checked={form.open24x7}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
            <SectionTitle
              icon={<Plus />}
              title="Services"
              description="Example: Emergency Care, Cardiology, ICU, Diagnostics."
            />

            <TagInput
              value={serviceInput}
              onChange={setServiceInput}
              onAdd={addService}
              placeholder="Add service"
            />

            <TagList items={form.services} onRemove={removeService} />
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-cyan-100/60 backdrop-blur-xl md:p-7">
            <SectionTitle
              icon={<Plus />}
              title="Facilities"
              description="Example: Ambulance, Pharmacy, Parking, Blood Test."
            />

            <TagInput
              value={facilityInput}
              onChange={setFacilityInput}
              onAdd={addFacility}
              placeholder="Add facility"
            />

            <TagList items={form.facilities} onRemove={removeFacility} />
          </div>
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
              ? "Update Hospital Profile"
              : "Create Hospital Profile"}
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

const Input = ({
  label,
  name,
  value,
  onChange,
  icon,
  type = "text",
  required = false,
}) => {
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
          required={required}
          min={type === "number" ? "0" : undefined}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </div>
    </div>
  );
};

const Toggle = ({ label, name, checked, onChange }) => {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <span className="text-sm font-black text-slate-700">{label}</span>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 accent-cyan-600"
      />
    </label>
  );
};

const ProfileImageInput = ({ imageUrl, preview, onUrlChange, onFileChange }) => {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[140px_1fr]">
      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-white text-cyan-600 shadow-sm">
        {preview ? (
          <img
            src={preview}
            alt="Hospital profile preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <Hospital size={44} />
        )}
      </div>

      <div className="space-y-4">
        <Input
          label="Profile Image URL"
          name="profileImage"
          value={imageUrl}
          onChange={onUrlChange}
          icon={<Globe />}
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

const TagInput = ({ value, onChange, onAdd, placeholder }) => {
  return (
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
        placeholder={placeholder}
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
  );
};

const TagList = ({ items, onRemove }) => {
  if (!items.length) {
    return (
      <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-400">
        No items added yet.
      </p>
    );
  }

  return (
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
  );
};

export default HospitalProfile;
