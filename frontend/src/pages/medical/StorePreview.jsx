import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  Home,
  Percent,
  ShieldCheck,
  ShieldX,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PackageSearch,
  BadgeIndianRupee,
  Navigation,
  Pencil,
  Pill,
  ExternalLink,
} from "lucide-react";
import API from "../../api/axios";

const StorePreview = () => {
  const [profile, setProfile] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [medicineLoading, setMedicineLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStoreProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/medical-stores/profile/me");

      setProfile(res.data.store || res.data.medicalStore || res.data.profile);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Store profile not found. Please create your medical store profile first.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      setMedicineLoading(true);

      const res = await API.get("/medicines/my");

      setMedicines(res.data.medicines || []);
    } catch {
      setMedicines([]);
    } finally {
      setMedicineLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreProfile();
    fetchMedicines();
  }, []);

  const availableMedicines = useMemo(() => {
    return medicines.filter(
      (medicine) =>
        medicine.isActive !== false &&
        medicine.isAvailable &&
        Number(medicine.quantity || 0) > 0,
    );
  }, [medicines]);

  const limitedMedicines = availableMedicines.slice(0, 6);

  const getDirectionsUrl = () => {
    if (!profile) return "#";

    if (profile.latitude && profile.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${profile.latitude},${profile.longitude}`;
    }

    const address = encodeURIComponent(
      `${profile.storeName || ""}, ${profile.address || ""}, ${
        profile.city || ""
      }, ${profile.state || ""}, ${profile.pincode || ""}`,
    );

    return `https://www.google.com/maps/search/?api=1&query=${address}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-600 shadow-lg">
          <Loader2 className="animate-spin text-cyan-600" />
          Loading store preview...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-orange-200 bg-orange-50 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-1 shrink-0 text-orange-600" />

            <div>
              <h2 className="text-xl font-black text-orange-900">
                Store profile required
              </h2>

              <p className="mt-2 text-sm font-semibold leading-6 text-orange-700">
                {error ||
                  "Please create your medical store profile first to see preview."}
              </p>

              <Link
                to="/medical-dashboard/profile"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-700"
              >
                Create Store Profile
                <Pencil size={17} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fullAddress = `${profile.address || ""}, ${profile.city || ""}, ${
    profile.state || ""
  } - ${profile.pincode || ""}`;

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur">
              <Store size={18} />
              Store Preview
            </div>

            <h1 className="text-3xl font-black">{profile.storeName}</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-50">
              This page shows how your medical store details will appear to
              patients while searching medicines.
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-cyan-50">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                <Store size={15} />
                {profile.storeType || "Medical Store"}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                <MapPin size={15} />
                {profile.city || "City"}, {profile.state || "State"}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                {profile.isVerifiedByAdmin ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <AlertCircle size={15} />
                )}
                {profile.isVerifiedByAdmin
                  ? "Verified"
                  : "Verification Pending"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/medical-dashboard/profile"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-cyan-700 shadow-lg transition hover:scale-[1.02]"
            >
              <Pencil size={17} />
              Edit Profile
            </Link>

            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:scale-[1.02]"
            >
              <Navigation size={17} />
              Direction
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          title="Profile"
          value={profile.isProfileComplete ? "Complete" : "Incomplete"}
          desc="Store profile status"
          icon={profile.isProfileComplete ? <CheckCircle2 /> : <AlertCircle />}
          good={profile.isProfileComplete}
        />

        <StatusCard
          title="Admin Verification"
          value={profile.isVerifiedByAdmin ? "Verified" : "Pending"}
          desc="Controlled by super admin"
          icon={profile.isVerifiedByAdmin ? <ShieldCheck /> : <AlertCircle />}
          good={profile.isVerifiedByAdmin}
        />

        <StatusCard
          title="Store Status"
          value={profile.isActive ? "Active" : "Inactive"}
          desc="If inactive, public visibility may stop"
          icon={profile.isActive ? <ShieldCheck /> : <ShieldX />}
          good={profile.isActive}
        />

        <StatusCard
          title="Medicines"
          value={availableMedicines.length}
          desc="Available inventory items"
          icon={<PackageSearch />}
          good
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">
              Public Store View
            </h2>
            <p className="text-sm text-slate-500">
              This section represents your store as patients may see it.
            </p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge text={profile.storeType || "Medical Store"} />

                  {profile.open24x7 && <Badge text="Open 24x7" />}

                  {profile.homeDeliveryAvailable && (
                    <Badge text="Home Delivery" />
                  )}

                  {profile.discountAvailable && (
                    <Badge
                      text={`${profile.discountPercentage || 0}% Discount`}
                    />
                  )}
                </div>

                <h3 className="text-3xl font-black text-slate-950">
                  {profile.storeName}
                </h3>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Owner: {profile.ownerName || "Not added"}
                </p>

                <p className="mt-4 flex gap-2 text-sm leading-6 text-slate-600">
                  <MapPin size={18} className="mt-1 shrink-0 text-cyan-600" />
                  <span>{fullAddress}</span>
                </p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-400">Store Timing</p>

                <p className="mt-1 flex items-center gap-2 text-xl font-black text-slate-900">
                  <Clock size={19} className="text-cyan-600" />
                  {profile.open24x7
                    ? "Open 24x7"
                    : `${profile.openingTime || "09:00"} - ${
                        profile.closingTime || "21:00"
                      }`}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <InfoBox
                icon={<Phone />}
                label="Phone"
                value={profile.phone || "Not added"}
              />

              <InfoBox
                icon={<Mail />}
                label="Email"
                value={profile.email || "Not added"}
              />

              <InfoBox
                icon={<Home />}
                label="Home Delivery"
                value={
                  profile.homeDeliveryAvailable ? "Available" : "Not available"
                }
              />

              <InfoBox
                icon={<Percent />}
                label="Discount"
                value={
                  profile.discountAvailable
                    ? `${profile.discountPercentage || 0}% available`
                    : "No discount"
                }
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-100 transition hover:scale-[1.02]"
                >
                  <Phone size={17} />
                  Call Store
                </a>
              )}

              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                <Navigation size={17} />
                Get Directions
              </a>

              <Link
                to="/medical-dashboard/inventory"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-cyan-700 shadow-sm transition hover:bg-cyan-50"
              >
                <PackageSearch size={17} />
                Manage Medicines
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Available Medicines Preview
                </h2>
                <p className="text-sm text-slate-500">
                  Showing latest available medicines from your inventory.
                </p>
              </div>

              <Link
                to="/medical-dashboard/inventory"
                className="inline-flex items-center gap-2 text-sm font-black text-cyan-700"
              >
                View All
                <ExternalLink size={16} />
              </Link>
            </div>

            {medicineLoading ? (
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600">
                <Loader2 className="animate-spin text-cyan-600" />
                Loading medicines...
              </div>
            ) : limitedMedicines.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <Pill className="mx-auto text-slate-400" size={42} />
                <h3 className="mt-4 text-lg font-black text-slate-800">
                  No available medicines yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Add medicines to inventory so patients can discover your
                  store.
                </p>

                <Link
                  to="/medical-dashboard/inventory"
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700"
                >
                  Add Medicine
                  <PackageSearch size={17} />
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {limitedMedicines.map((medicine) => (
                  <MedicineCard key={medicine._id} medicine={medicine} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
            <h2 className="text-xl font-black text-slate-900">
              Store Controls
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              These settings can be changed from Store Profile.
            </p>

            <div className="mt-5 space-y-3">
              <ControlRow
                label="Open 24x7"
                value={profile.open24x7 ? "ON" : "OFF"}
                active={profile.open24x7}
              />

              <ControlRow
                label="Home Delivery"
                value={profile.homeDeliveryAvailable ? "ON" : "OFF"}
                active={profile.homeDeliveryAvailable}
              />

              <ControlRow
                label="Discount"
                value={
                  profile.discountAvailable
                    ? `${profile.discountPercentage || 0}% ON`
                    : "OFF"
                }
                active={profile.discountAvailable}
              />

              <ControlRow
                label="Public Visibility"
                value={
                  profile.isActive && profile.isProfileComplete
                    ? "Visible"
                    : "Limited"
                }
                active={profile.isActive && profile.isProfileComplete}
              />
            </div>

            <Link
              to="/medical-dashboard/profile"
              className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Update Store Settings
              <Pencil size={17} />
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
            <h2 className="text-xl font-black text-slate-900">
              Public Search Readiness
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your store appears better in search when these are complete.
            </p>

            <div className="mt-5 space-y-3">
              <ChecklistRow
                label="Profile completed"
                done={profile.isProfileComplete}
              />

              <ChecklistRow
                label="Phone number added"
                done={Boolean(profile.phone)}
              />

              <ChecklistRow
                label="Address added"
                done={Boolean(profile.address && profile.city && profile.state)}
              />

              <ChecklistRow
                label="Medicines available"
                done={availableMedicines.length > 0}
              />

              <ChecklistRow
                label="Admin verified"
                done={profile.isVerifiedByAdmin}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-100 bg-cyan-50 p-6">
            <h2 className="text-lg font-black text-cyan-950">Important Note</h2>

            <p className="mt-2 text-sm font-semibold leading-6 text-cyan-800">
              Medical owner can update store details, delivery, discount and
              timing. But active/inactive and verification should remain under
              super admin control for platform safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ title, value, desc, icon, good }) => {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-lg shadow-cyan-100/50 backdrop-blur">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
          good
            ? "bg-emerald-50 text-emerald-600"
            : "bg-orange-50 text-orange-600"
        }`}
      >
        {icon}
      </div>

      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h3 className="mt-1 text-2xl font-black text-slate-900">{value}</h3>
      <p className="mt-1 text-xs font-medium text-slate-500">{desc}</p>
    </div>
  );
};

const Badge = ({ text }) => {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">
      {text}
    </span>
  );
};

const InfoBox = ({ icon, label, value }) => {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-cyan-600">
        {icon}
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p className="text-sm font-black text-slate-800">{value}</p>
    </div>
  );
};

const MedicineCard = ({ medicine }) => {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
          {medicine.category}
        </span>

        {medicine.prescriptionRequired && (
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
            Prescription Required
          </span>
        )}
      </div>

      <h3 className="text-lg font-black text-slate-900">
        {medicine.medicineName}
      </h3>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        {medicine.brandName || "No brand"}{" "}
        {medicine.strength ? `• ${medicine.strength}` : ""}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-400">Stock</p>
          <p className="mt-1 text-sm font-black text-slate-800">
            {medicine.quantity || 0}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-400">Price</p>
          <p className="mt-1 flex items-center text-sm font-black text-slate-800">
            <BadgeIndianRupee size={15} />
            {medicine.price || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

const ControlRow = ({ label, value, active }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-sm font-bold text-slate-600">{label}</p>

      <span
        className={`rounded-full px-3 py-1 text-xs font-black ${
          active
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-200 text-slate-600"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

const ChecklistRow = ({ label, done }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-sm font-bold text-slate-600">{label}</p>

      {done ? (
        <CheckCircle2 size={19} className="text-emerald-600" />
      ) : (
        <AlertCircle size={19} className="text-orange-500" />
      )}
    </div>
  );
};

export default StorePreview;
