import { useEffect, useState } from "react";
import {
  PlusCircle,
  Edit,
  ShieldCheck,
  Mail,
  Phone,
  Eye,
  EyeOff,
  X,
  UserCog,
  CheckCircle,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api";

const Avatar = ({ name }) => {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow shrink-0">
      {initials || "?"}
    </div>
  );
};

const Field = ({ label, icon: Icon, type = "text", value, onChange, placeholder, rightEl }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={15} />
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? "pl-9" : "pl-4"} ${rightEl ? "pr-10" : "pr-4"} py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all`}
      />
      {rightEl && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</span>
      )}
    </div>
  </div>
);

const AdminAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [modal, setModal] = useState({ open: false, type: "", data: null });

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    const res = await API.get("/admin/admins");
    setAdmins(res.data.data || []);
  };

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });
    if (data) {
      setName(data.name);
      setEmail(data.email);
      setPhone(data.phone);
      setPassword("");
    } else {
      resetForm();
    }
  };

  const resetForm = () => { setName(""); setEmail(""); setPhone(""); setPassword(""); setShowPass(false); };
  const closeModal = () => { setModal({ open: false, type: "", data: null }); resetForm(); };

  const handleSave = async () => {
    if (!name || !email || !phone || (modal.type === "add" && !password)) {
      toast.error("All fields are required");
      return;
    }
    const payload = { name, email, phone, role: "admin", ...(password && { password }) };
    if (modal.type === "add") {
      await API.post("/admin/admins", payload);
    } else {
      await API.put(`/admin/admins/${modal.data._id}`, payload);
    }
    fetchAdmins();
    closeModal();
    toast.success(modal.type === "add" ? "Admin added!" : "Admin updated!");
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const action = currentStatus === "suspended" ? "activate" : "suspend";
    if (window.confirm(`Are you sure you want to ${action} this admin?`)) {
      try {
        await API.patch(`/admin/admins/status/${id}`);
        toast.success(`Admin ${action}d successfully`);
        fetchAdmins();
      } catch {
        toast.error("Failed to update status");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Admin Management
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage system administrators and access
              </p>
            </div>
          </div>

          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow hover:shadow-md active:scale-95 transition-all"
          >
            <PlusCircle size={18} /> Add Admin
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Admins", value: admins.length, color: "from-teal-500 to-emerald-500" },
          { label: "Active", value: admins.filter((a) => a.status !== "suspended").length, color: "from-blue-500 to-indigo-500" },
          { label: "Suspended", value: admins.filter((a) => a.status === "suspended").length, color: "from-red-400 to-rose-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-extrabold text-lg shadow`}>
              {value}
            </div>
            <span className="text-sm font-semibold text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_1.5fr_80px_100px] bg-gradient-to-r from-slate-50 to-white px-6 py-3 border-b border-slate-100">
          {["Administrator", "Email", "Phone", "Edit", "Status"].map((h, i) => (
            <div
              key={h}
              className={`text-xs font-bold text-slate-500 uppercase tracking-wider ${i >= 3 ? "text-center" : ""}`}
            >
              {h}
            </div>
          ))}
        </div>

        {admins.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No administrators found
          </div>
        ) : (
          admins.map((a, idx) => (
            <div
              key={a._id}
              className={`grid grid-cols-[2fr_2fr_1.5fr_80px_100px] px-6 py-4 items-center border-b border-slate-50 transition-colors hover:bg-teal-50/30
                ${a.status === "suspended" ? "bg-red-50/40" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={a.name} />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{a.name}</p>
                  {a.status === "suspended" && (
                    <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full uppercase">
                      Suspended
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-teal-600 font-medium truncate pr-4">
                <Mail size={13} className="shrink-0 text-slate-400" />
                {a.email}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={13} className="shrink-0 text-slate-400" />
                {a.phone}
              </div>
              <div className="text-center">
                <button
                  onClick={() => openModal("edit", a)}
                  className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  title="Edit Admin"
                >
                  <Edit size={15} />
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => handleStatusToggle(a._id, a.status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95
                    ${a.status === "suspended"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white"
                      : "bg-red-100 text-red-600 hover:bg-red-500 hover:text-white"
                    }`}
                >
                  {a.status === "suspended" ? "Activate" : "Suspend"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="md:hidden space-y-4">
        {admins.map((a) => (
          <div
            key={a._id}
            className={`bg-white rounded-2xl shadow-sm border p-5 transition-all
              ${a.status === "suspended" ? "border-red-200 bg-red-50/40" : "border-slate-100"}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={a.name} />
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">{a.name}</h4>
                {a.status === "suspended" && (
                  <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full uppercase">
                    Suspended
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={13} className="text-slate-400" /> {a.email}
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={13} className="text-slate-400" /> {a.phone}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => openModal("edit", a)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-50 text-blue-600 font-semibold text-sm hover:bg-blue-100 transition-colors"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={() => handleStatusToggle(a._id, a.status)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm transition-colors
                  ${a.status === "suspended"
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
              >
                {a.status === "suspended"
                  ? <><CheckCircle size={14} /> Activate</>
                  : <><Ban size={14} /> Suspend</>
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[fadeIn_0.2s_ease]">

            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow">
                <UserCog size={18} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">
                {modal.type === "add" ? "Add New Admin" : "Edit Admin"}
              </h3>
              <button
                onClick={closeModal}
                className="ml-auto text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              <Field
                label="Full Name"
                icon={UserCog}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
              />
              <Field
                label="Email Address"
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ezfix.in"
              />
              <Field
                label="Phone Number"
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />

              {modal.type === "add" && (
                <Field
                  label="Password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  rightEl={
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
              )}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow hover:shadow-md active:scale-95 transition-all"
              >
                {modal.type === "add" ? "Add Admin" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdmin;
