import { useEffect, useMemo, useState } from "react";
import {
  PackageSearch,
  Plus,
  Save,
  Loader2,
  Search,
  Trash2,
  Edit3,
  X,
  Pill,
  BadgeIndianRupee,
  Boxes,
  ShieldCheck,
} from "lucide-react";
import API from "../../api/axios";

const initialForm = {
  medicineName: "",
  genericName: "",
  brandName: "",
  category: "Tablet",
  strength: "",
  quantity: "",
  price: "",
  expiryDate: "",
  prescriptionRequired: false,
  isAvailable: true,
  description: "",
};

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

const MedicalInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) params.append("search", search.trim());
      if (categoryFilter) params.append("category", categoryFilter);
      if (availabilityFilter) params.append("availability", availabilityFilter);

      const res = await API.get(`/medicines/my?${params.toString()}`);

      setMedicines(res.data.medicines || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load medicines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const totalMedicines = medicines.length;

  const availableMedicines = useMemo(() => {
    return medicines.filter((item) => item.isAvailable && item.quantity > 0)
      .length;
  }, [medicines]);

  const outOfStockMedicines = useMemo(() => {
    return medicines.filter((item) => !item.isAvailable || item.quantity <= 0)
      .length;
  }, [medicines]);

  const prescriptionMedicines = useMemo(() => {
    return medicines.filter((item) => item.prescriptionRequired).length;
  }, [medicines]);

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.medicineName.trim()) {
      return "Medicine name is required.";
    }

    if (formData.quantity !== "" && Number(formData.quantity) < 0) {
      return "Quantity cannot be negative.";
    }

    if (formData.price !== "" && Number(formData.price) < 0) {
      return "Price cannot be negative.";
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

      const payload = {
        ...formData,
        quantity: formData.quantity === "" ? 0 : Number(formData.quantity),
        price: formData.price === "" ? 0 : Number(formData.price),
        expiryDate: formData.expiryDate || null,
      };

      const res = editingId
        ? await API.patch(`/medicines/${editingId}`, payload)
        : await API.post("/medicines", payload);

      setSuccess(res.data.message || "Medicine saved successfully.");
      resetForm();
      fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save medicine.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (medicine) => {
    setEditingId(medicine._id);

    setFormData({
      medicineName: medicine.medicineName || "",
      genericName: medicine.genericName || "",
      brandName: medicine.brandName || "",
      category: medicine.category || "Tablet",
      strength: medicine.strength || "",
      quantity: medicine.quantity ?? "",
      price: medicine.price ?? "",
      expiryDate: medicine.expiryDate ? medicine.expiryDate.slice(0, 10) : "",
      prescriptionRequired: Boolean(medicine.prescriptionRequired),
      isAvailable: Boolean(medicine.isAvailable),
      description: medicine.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medicine?",
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setSuccess("");

      const res = await API.delete(`/medicines/${id}`);

      setSuccess(res.data.message || "Medicine deleted successfully.");
      fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete medicine.");
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchMedicines();
  };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-cyan-600 to-emerald-500 p-6 text-white shadow-xl shadow-cyan-100">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur">
              <PackageSearch size={18} />
              Medicine Inventory
            </div>

            <h1 className="text-3xl font-black">
              Manage Medicine Availability
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-50">
              Add medicines, update stock, manage prescription requirements, and
              make your store visible in patient medicine search.
            </p>
          </div>

          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-cyan-50">
              Total Medicines
            </p>
            <p className="mt-1 text-3xl font-black">{totalMedicines}</p>
            <p className="mt-1 text-xs text-cyan-50">
              Active items in your inventory
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total"
          value={totalMedicines}
          desc="Inventory items"
          icon={<Pill />}
        />
        <StatCard
          title="Available"
          value={availableMedicines}
          desc="In stock medicines"
          icon={<ShieldCheck />}
        />
        <StatCard
          title="Out of Stock"
          value={outOfStockMedicines}
          desc="Unavailable medicines"
          icon={<Boxes />}
        />
        <StatCard
          title="Prescription"
          value={prescriptionMedicines}
          desc="Requires prescription"
          icon={<PackageSearch />}
        />
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
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              {editingId ? <Edit3 /> : <Plus />}
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">
                {editingId ? "Update Medicine" : "Add New Medicine"}
              </h2>
              <p className="text-sm text-slate-500">
                Fill accurate details for better patient search results.
              </p>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-200"
            >
              <X size={16} />
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Medicine Name"
            name="medicineName"
            value={formData.medicineName}
            onChange={handleChange}
            placeholder="Example: Paracetamol"
            required
          />

          <Input
            label="Generic Name"
            name="genericName"
            value={formData.genericName}
            onChange={handleChange}
            placeholder="Example: Acetaminophen"
          />

          <Input
            label="Brand Name"
            name="brandName"
            value={formData.brandName}
            onChange={handleChange}
            placeholder="Example: Crocin"
          />

          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categories}
          />

          <Input
            label="Strength"
            name="strength"
            value={formData.strength}
            onChange={handleChange}
            placeholder="Example: 500mg"
          />

          <Input
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Example: 100"
            icon={<Boxes size={18} />}
          />

          <Input
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="Example: 25"
            icon={<BadgeIndianRupee size={18} />}
          />

          <Input
            label="Expiry Date"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleChange}
          />

          <div className="lg:col-span-2">
            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short note about medicine, use case, or availability."
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Checkbox
            name="isAvailable"
            label="Available for patients"
            checked={formData.isAvailable}
            onChange={handleChange}
          />

          <Checkbox
            name="prescriptionRequired"
            label="Prescription required"
            checked={formData.prescriptionRequired}
            onChange={handleChange}
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
              : editingId
                ? "Update Medicine"
                : "Add Medicine"}
          </button>
        </div>
      </form>

      <form
        onSubmit={handleFilterSubmit}
        className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-lg shadow-cyan-100/40 backdrop-blur"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicine, generic, brand..."
              className="ml-3 w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          >
            <option value="">All Categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          >
            <option value="">All Stock</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>

          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Search
          </button>
        </div>
      </form>

      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-cyan-100/50 backdrop-blur">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Inventory List
            </h2>
            <p className="text-sm text-slate-500">
              Manage your active medicine records.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600">
              <Loader2 className="animate-spin text-cyan-600" />
              Loading medicines...
            </div>
          </div>
        ) : medicines.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <PackageSearch className="mx-auto text-slate-400" size={42} />
            <h3 className="mt-4 text-lg font-black text-slate-800">
              No medicine added yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Add your first medicine to start building inventory.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {medicines.map((medicine) => (
              <div
                key={medicine._id}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                        {medicine.category}
                      </span>

                      {medicine.prescriptionRequired && (
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                          Prescription
                        </span>
                      )}

                      {medicine.isAvailable && medicine.quantity > 0 ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-slate-900">
                      {medicine.medicineName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {medicine.brandName || "No brand"}{" "}
                      {medicine.strength ? `• ${medicine.strength}` : ""}
                    </p>

                    {medicine.genericName && (
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        Generic: {medicine.genericName}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(medicine)}
                      className="rounded-xl bg-cyan-50 p-2 text-cyan-700 transition hover:bg-cyan-100"
                    >
                      <Edit3 size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(medicine._id)}
                      className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniInfo label="Quantity" value={medicine.quantity} />
                  <MiniInfo label="Price" value={`₹${medicine.price || 0}`} />
                  <MiniInfo
                    label="Expiry"
                    value={
                      medicine.expiryDate
                        ? new Date(medicine.expiryDate).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </div>

                {medicine.description && (
                  <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                    {medicine.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, desc, icon }) => {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-lg shadow-cyan-100/50 backdrop-blur">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h3 className="mt-1 text-2xl font-black text-slate-900">{value}</h3>
      <p className="mt-1 text-xs font-medium text-slate-500">{desc}</p>
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

const Checkbox = ({ name, label, checked, onChange }) => {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50/40">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 accent-cyan-600"
      />

      <p className="text-sm font-black text-slate-800">{label}</p>
    </label>
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

export default MedicalInventory;
