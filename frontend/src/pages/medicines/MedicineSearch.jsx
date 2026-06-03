import { useState } from "react";
import {
  Search,
  MapPin,
  Pill,
  Store,
  Phone,
  Home,
  Percent,
  ShieldCheck,
  Loader2,
  Navigation,
  AlertCircle,
  BadgeIndianRupee,
  PackageCheck,
  Send,
  X,
  UserRound,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import API from "../../api/axios";

const MedicineSearch = () => {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  const [medicines, setMedicines] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [requestForm, setRequestForm] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    requestedQuantity: 1,
    message: "",
  });

  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState("");
  const [error, setError] = useState("");

  const categories = [
    "Tablet",
    "Capsule",
    "Syrup",
    "Injection",
    "Cream",
    "Drops",
    "Inhaler",
    "Medical Equipment",
    "Other",
  ];

  const handleSearch = async (e) => {
    e.preventDefault();

    setError("");
    setRequestSuccess("");
    setSearched(true);

    if (!query.trim() && !city.trim() && !category) {
      setError("Please enter medicine name, city, or category to search.");
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (query.trim()) params.append("q", query.trim());
      if (city.trim()) params.append("city", city.trim());
      if (category) params.append("category", category);

      const res = await API.get(`/medicines/search?${params.toString()}`);

      setMedicines(res.data.medicines || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to search medicine availability.",
      );
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const getDirectionsUrl = (store) => {
    const lat = store?.latitude;
    const lng = store?.longitude;

    if (lat && lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }

    const address = encodeURIComponent(
      `${store?.storeName || ""}, ${store?.address || ""}, ${store?.city || ""}, ${store?.state || ""}`,
    );

    return `https://www.google.com/maps/search/?api=1&query=${address}`;
  };

  const openRequestModal = (medicine) => {
    setSelectedMedicine(medicine);
    setRequestSuccess("");
    setError("");
    setRequestForm({
      patientName: "",
      patientPhone: "",
      patientEmail: "",
      requestedQuantity: 1,
      message: "",
    });
  };

  const closeRequestModal = () => {
    setSelectedMedicine(null);
    setRequestSuccess("");
    setRequestForm({
      patientName: "",
      patientPhone: "",
      patientEmail: "",
      requestedQuantity: 1,
      message: "",
    });
  };

  const handleRequestChange = (e) => {
    const { name, value } = e.target;

    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitMedicineRequest = async (e) => {
    e.preventDefault();

    if (!selectedMedicine) return;

    setError("");
    setRequestSuccess("");

    if (!requestForm.patientName.trim() || !requestForm.patientPhone.trim()) {
      setError("Patient name and phone number are required.");
      return;
    }

    try {
      setRequestLoading(true);

      const payload = {
        medicineId: selectedMedicine._id,
        patientName: requestForm.patientName.trim(),
        patientPhone: requestForm.patientPhone.trim(),
        patientEmail: requestForm.patientEmail.trim(),
        requestedQuantity: Number(requestForm.requestedQuantity || 1),
        message: requestForm.message.trim(),
      };

      const res = await API.post("/medicine-requests", payload);

      setRequestSuccess(
        res.data.message || "Medicine request sent successfully.",
      );
      setRequestForm({
        patientName: "",
        patientPhone: "",
        patientEmail: "",
        requestedQuantity: 1,
        message: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send medicine request.",
      );
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-2 text-sm font-black text-cyan-700 shadow-sm backdrop-blur">
              <Pill size={18} />
              Medicine Availability Search
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Find Medicines Near You
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Search medicine availability from nearby medical stores,
              pharmacies, and clinic pharmacies. Send an inquiry before
              visiting.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-white/80 bg-white/90 p-4 shadow-2xl shadow-cyan-100/60 backdrop-blur-xl"
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]">
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                <Search size={19} className="text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search medicine name, brand, or generic..."
                  className="ml-3 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                />
              </div>

              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                <MapPin size={19} className="text-slate-400" />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="ml-3 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              >
                <option value="">All Categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-cyan-100 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}
                Search
              </button>
            </div>
          </form>

          {error && (
            <div className="mx-auto mt-6 flex max-w-5xl items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
              <AlertCircle size={19} />
              {error}
            </div>
          )}

          {requestSuccess && (
            <div className="mx-auto mt-6 flex max-w-5xl items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
              <CheckCircle2 size={19} />
              {requestSuccess}
            </div>
          )}

          <div className="mt-10">
            {!searched && (
              <div className="mx-auto max-w-5xl rounded-[2rem] border border-dashed border-cyan-200 bg-white/70 p-10 text-center shadow-sm backdrop-blur">
                <Pill className="mx-auto text-cyan-500" size={46} />
                <h2 className="mt-5 text-2xl font-black text-slate-900">
                  Search medicine availability instantly
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Enter a medicine name like Paracetamol, Dolo, Azithromycin,
                  insulin, or search by city to see available medical stores.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-16">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-600 shadow-lg">
                  <Loader2 className="animate-spin text-cyan-600" />
                  Searching available medicines...
                </div>
              </div>
            )}

            {searched && !loading && medicines.length === 0 && !error && (
              <div className="mx-auto max-w-5xl rounded-[2rem] border border-dashed border-slate-200 bg-white/80 p-10 text-center shadow-sm backdrop-blur">
                <PackageCheck className="mx-auto text-slate-400" size={46} />
                <h2 className="mt-5 text-2xl font-black text-slate-900">
                  No medicine found
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Try another medicine name, remove category filter, or search a
                  nearby city.
                </p>
              </div>
            )}

            {!loading && medicines.length > 0 && (
              <div className="mx-auto max-w-7xl">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      Available Medicines
                    </h2>
                    <p className="text-sm font-medium text-slate-500">
                      Found {medicines.length} result
                      {medicines.length > 1 ? "s" : ""}.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {medicines.map((medicine) => {
                    const store = medicine.medicalStore;

                    return (
                      <article
                        key={medicine._id}
                        className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-xl shadow-cyan-100/40 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl"
                      >
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                                {medicine.category}
                              </span>

                              {medicine.prescriptionRequired && (
                                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                                  Prescription Required
                                </span>
                              )}

                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                                In Stock
                              </span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-950">
                              {medicine.medicineName}
                            </h3>

                            <p className="mt-1 text-sm font-semibold text-slate-500">
                              {medicine.brandName || "No brand mentioned"}
                              {medicine.strength
                                ? ` • ${medicine.strength}`
                                : ""}
                            </p>

                            {medicine.genericName && (
                              <p className="mt-1 text-xs font-bold text-slate-400">
                                Generic: {medicine.genericName}
                              </p>
                            )}
                          </div>

                          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                            <p className="text-xs font-bold text-slate-400">
                              Price
                            </p>
                            <p className="flex items-center justify-end text-xl font-black text-slate-900">
                              <BadgeIndianRupee size={18} />
                              {medicine.price || 0}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          <MiniInfo
                            label="Quantity"
                            value={medicine.quantity}
                          />
                          <MiniInfo
                            label="Expiry"
                            value={
                              medicine.expiryDate
                                ? new Date(
                                    medicine.expiryDate,
                                  ).toLocaleDateString()
                                : "N/A"
                            }
                          />
                          <MiniInfo
                            label="Availability"
                            value={
                              medicine.isAvailable && medicine.quantity > 0
                                ? "Available"
                                : "Limited"
                            }
                          />
                        </div>

                        {medicine.description && (
                          <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                            {medicine.description}
                          </p>
                        )}

                        {store && (
                          <div className="mt-6 rounded-[1.5rem] border border-cyan-100 bg-gradient-to-br from-cyan-50 to-emerald-50 p-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm">
                                <Store />
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="text-lg font-black text-slate-900">
                                  {store.storeName}
                                </h4>

                                <p className="mt-1 text-sm font-semibold text-slate-500">
                                  {store.storeType} • {store.city},{" "}
                                  {store.state}
                                </p>

                                <p className="mt-2 flex gap-2 text-sm leading-6 text-slate-600">
                                  <MapPin
                                    size={17}
                                    className="mt-1 shrink-0 text-cyan-600"
                                  />
                                  <span>
                                    {store.address}, {store.pincode}
                                  </span>
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                  {store.open24x7 && (
                                    <Badge
                                      icon={<ShieldCheck size={15} />}
                                      text="Open 24x7"
                                    />
                                  )}

                                  {store.homeDeliveryAvailable && (
                                    <Badge
                                      icon={<Home size={15} />}
                                      text="Home Delivery"
                                    />
                                  )}

                                  {store.discountAvailable && (
                                    <Badge
                                      icon={<Percent size={15} />}
                                      text={`${store.discountPercentage || 0}% Discount`}
                                    />
                                  )}
                                </div>

                                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                  <button
                                    type="button"
                                    onClick={() => openRequestModal(medicine)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:scale-[1.02]"
                                  >
                                    <Send size={17} />
                                    Request Medicine
                                  </button>

                                  {store.phone && (
                                    <a
                                      href={`tel:${store.phone}`}
                                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-cyan-700 shadow-sm transition hover:bg-cyan-50"
                                    >
                                      <Phone size={17} />
                                      Call Store
                                    </a>
                                  )}

                                  <a
                                    href={getDirectionsUrl(store)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
                                  >
                                    <Navigation size={17} />
                                    Directions
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedMedicine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Request Medicine
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {selectedMedicine.medicineName} from{" "}
                  {selectedMedicine.medicalStore?.storeName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeRequestModal}
                className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            {requestSuccess && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                <CheckCircle2 size={18} />
                {requestSuccess}
              </div>
            )}

            <form onSubmit={submitMedicineRequest} className="space-y-4">
              <Input
                label="Your Name"
                name="patientName"
                value={requestForm.patientName}
                onChange={handleRequestChange}
                placeholder="Enter your full name"
                icon={<UserRound size={18} />}
                required
              />

              <Input
                label="Phone Number"
                name="patientPhone"
                value={requestForm.patientPhone}
                onChange={handleRequestChange}
                placeholder="Enter phone number"
                icon={<Phone size={18} />}
                required
              />

              <Input
                label="Email"
                name="patientEmail"
                value={requestForm.patientEmail}
                onChange={handleRequestChange}
                placeholder="Optional"
                type="email"
              />

              <Input
                label="Quantity"
                name="requestedQuantity"
                value={requestForm.requestedQuantity}
                onChange={handleRequestChange}
                placeholder="Example: 2"
                type="number"
              />

              <Textarea
                label="Message"
                name="message"
                value={requestForm.message}
                onChange={handleRequestChange}
                placeholder="Example: Please keep this medicine ready. I will visit today."
                icon={<MessageSquare size={18} />}
              />

              <button
                type="submit"
                disabled={requestLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-100 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {requestLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {requestLoading ? "Sending..." : "Send Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

const MiniInfo = ({ label, value }) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
};

const Badge = ({ icon, text }) => {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">
      {icon}
      {text}
    </span>
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

export default MedicineSearch;
