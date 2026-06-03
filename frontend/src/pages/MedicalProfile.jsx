import { useEffect, useState } from "react";
import {
  Store,
  Save,
  Loader2,
  MapPin,
  Phone,
  Mail,
  BadgeCheck,
  Truck,
  Clock3,
  Percent,
  Navigation,
} from "lucide-react";
import API from "../api/axios";
import {
  buildProfileFormData,
  isValidImageFile,
} from "../utils/profileImageForm";

const initialForm = {
  storeName: "",
  storeType: "Medical Store",
  ownerName: "",
  drugLicenseNumber: "",
  registrationNumber: "",
  phone: "",
  email: "",
  profileImage: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  openingTime: "09:00",
  closingTime: "21:00",
  open24x7: false,
  homeDeliveryAvailable: false,
  discountAvailable: true,
  discountPercentage: 5,
};

const storeTypes = [
  "Pharmacy",
  "Medical Store",
  "Diagnostic Lab",
  "Clinic Pharmacy",
  "Other",
];

const MedicalProfile = () => {
  const [formData, setFormData] = useState(initialForm);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/medical-stores/profile/me");

      const profile = res.data.medicalStore;

      setProfileExists(true);

      setFormData({
        storeName: profile.storeName || "",
        storeType: profile.storeType || "Medical Store",
        ownerName: profile.ownerName || "",
        drugLicenseNumber: profile.drugLicenseNumber || "",
        registrationNumber: profile.registrationNumber || "",
        phone: profile.phone || "",
        email: profile.email || "",
        profileImage: profile.profileImage || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        latitude: profile.latitude || "",
        longitude: profile.longitude || "",
        openingTime: profile.openingTime || "09:00",
        closingTime: profile.closingTime || "21:00",
        open24x7: Boolean(profile.open24x7),
        homeDeliveryAvailable: Boolean(profile.homeDeliveryAvailable),
        discountAvailable: Boolean(profile.discountAvailable),
        discountPercentage: profile.discountPercentage ?? 5,
      });
      setProfileImageFile(null);
      setProfileImagePreview(profile.profileImage || "");
    } catch (err) {
      setProfileExists(false);
      setProfileImageFile(null);
      setProfileImagePreview("");

      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.message || "Failed to load medical profile.",
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
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

  const getCurrentLocation = () => {
    setError("");
    setSuccess("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));

        setSuccess("Location added successfully.");
      },
      () => {
        setError("Location permission denied. You can enter it manually.");
      },
    );
  };

  const validateForm = () => {
    if (!formData.storeName.trim()) return "Store name is required.";
    if (!formData.phone.trim()) return "Phone number is required.";
    if (!formData.address.trim()) return "Address is required.";
    if (!formData.city.trim()) return "City is required.";
    if (!formData.state.trim()) return "State is required.";
    if (!formData.pincode.trim()) return "Pincode is required.";

    const discount = Number(formData.discountPercentage);

    if (Number.isNaN(discount) || discount < 0 || discount > 100) {
      return "Discount percentage must be between 0 and 100.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payloadData = {
        ...formData,
        discountPercentage: Number(formData.discountPercentage),
        latitude: formData.latitude === "" ? null : Number(formData.latitude),
        longitude:
          formData.longitude === "" ? null : Number(formData.longitude),
      };

      const payload = buildProfileFormData(payloadData, profileImageFile);

      const res = profileExists
        ? await API.patch("/medical-stores/profile", payload)
        : await API.post("/medical-stores/profile", payload);

      setProfileExists(true);
      setSuccess(
        res.data.message || "Medical store profile saved successfully.",
      );
      await fetchProfile();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save medical store profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-slate-600 shadow">
          <Loader2 className="animate-spin text-cyan-600" />
          Loading medical profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur">
              <Store size={18} />
              Medical Owner Panel
            </div>

            <h1 className="text-3xl font-black">Medical Store Profile</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-50">
              Create and manage your pharmacy, medical store, lab, or clinic
              pharmacy profile. This profile will later be used for medicine
              search, QR discount scans, and monthly customer interaction
              tracking.
            </p>
          </div>

          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-cyan-50">Monthly Target</p>
            <p className="mt-1 text-3xl font-black">150 Users</p>
            <p className="mt-1 text-xs text-cyan-50">
              Super admin will monitor monthly interactions.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/60 backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <BadgeCheck />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">Store Details</h2>
            <p className="text-sm text-slate-500">
              Add accurate details so patients can find your store easily.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Store Name"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            placeholder="Example: Sharma Medical Store"
            required
          />

          <Select
            label="Store Type"
            name="storeType"
            value={formData.storeType}
            onChange={handleChange}
            options={storeTypes}
          />

          <div className="lg:col-span-2">
            <ProfileImageInput
              imageUrl={formData.profileImage}
              preview={profileImagePreview}
              onUrlChange={handleChange}
              onFileChange={handleProfileImageFileChange}
            />
          </div>

          <Input
            label="Owner Name"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            placeholder="Owner full name"
          />

          <Input
            label="Drug License Number"
            name="drugLicenseNumber"
            value={formData.drugLicenseNumber}
            onChange={handleChange}
            placeholder="Enter drug license number"
          />

          <Input
            label="Registration Number"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            placeholder="Enter registration number"
          />

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Store contact number"
            required
            icon={<Phone size={18} />}
          />

          <Input
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Store email"
            icon={<Mail size={18} />}
          />

          <Input
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="Example: 485001"
            required
          />

          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Example: Satna"
            required
          />

          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Example: Madhya Pradesh"
            required
          />

          <div className="lg:col-span-2">
            <Textarea
              label="Full Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Shop number, road, landmark, area"
              required
            />
          </div>
        </div>

        <div className="my-8 h-px bg-slate-100" />

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <MapPin />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              Location & Timing
            </h2>
            <p className="text-sm text-slate-500">
              Location will help patients find nearest medicine availability.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="Example: 24.5854"
            icon={<Navigation size={18} />}
          />

          <Input
            label="Longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="Example: 80.8322"
            icon={<Navigation size={18} />}
          />

          <Input
            label="Opening Time"
            name="openingTime"
            type="time"
            value={formData.openingTime}
            onChange={handleChange}
            icon={<Clock3 size={18} />}
          />

          <Input
            label="Closing Time"
            name="closingTime"
            type="time"
            value={formData.closingTime}
            onChange={handleChange}
            icon={<Clock3 size={18} />}
          />

          <button
            type="button"
            onClick={getCurrentLocation}
            className="rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-3 text-sm font-black text-cyan-700 transition hover:bg-cyan-100 lg:col-span-2"
          >
            Use Current Location
          </button>
        </div>

        <div className="my-8 h-px bg-slate-100" />

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Percent />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              Services & Discount
            </h2>
            <p className="text-sm text-slate-500">
              These settings will be used later for QR discount and medicine
              search.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Discount Percentage"
            name="discountPercentage"
            type="number"
            value={formData.discountPercentage}
            onChange={handleChange}
            placeholder="Example: 5"
            icon={<Percent size={18} />}
          />

          <InfoCard
            title="Monthly Interaction Target"
            value="150 Users"
            description="150 is minimum target. More than 150 scans will also be allowed and tracked."
          />

          <Checkbox
            name="open24x7"
            label="Open 24x7"
            checked={formData.open24x7}
            onChange={handleChange}
            icon={<Clock3 size={18} />}
          />

          <Checkbox
            name="homeDeliveryAvailable"
            label="Home Delivery Available"
            checked={formData.homeDeliveryAvailable}
            onChange={handleChange}
            icon={<Truck size={18} />}
          />

          <Checkbox
            name="discountAvailable"
            label="QR Discount Available"
            checked={formData.discountAvailable}
            onChange={handleChange}
            icon={<Percent size={18} />}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-cyan-100 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving
              ? "Saving..."
              : profileExists
                ? "Update Profile"
                : "Create Profile"}
          </button>
        </div>
      </form>
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
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

const ProfileImageInput = ({ imageUrl, preview, onUrlChange, onFileChange }) => {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[140px_1fr]">
      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-white text-cyan-600 shadow-sm">
        {preview ? (
          <img
            src={preview}
            alt="Store profile preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <Store size={44} />
        )}
      </div>

      <div className="space-y-4">
        <Input
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

const Textarea = ({ label, name, value, onChange, placeholder, required }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
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

const Checkbox = ({ name, label, checked, onChange, icon }) => {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50/40">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-sm font-black text-slate-800">{label}</p>
      </div>

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

const InfoCard = ({ title, value, description }) => {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
      <p className="text-sm font-bold text-emerald-700">{title}</p>
      <p className="mt-1 text-2xl font-black text-emerald-800">{value}</p>
      <p className="mt-1 text-xs font-medium text-emerald-700">{description}</p>
    </div>
  );
};

export default MedicalProfile;
