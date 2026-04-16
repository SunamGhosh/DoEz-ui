// admin
import { useEffect, useState } from "react";
import { PlusCircle, Edit, ShieldCheck, Mail, Phone, Eye, EyeOff, X, UserCog, CheckCircle, Ban } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api";

const Avatar = ({ name }) => {
  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-xl bg-[#1a1f36] flex items-center justify-center text-white text-xs font-bold shrink-0">
      {initials || "?"}
    </div>
  );
};

const AdminAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [modal, setModal] = useState({ open: false, type: "", data: null });

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    const res = await API.get("/admin/admins");
    setAdmins(res.data.data || []);
  };

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });
    setForm(data ? { name: data.name, email: data.email, phone: data.phone, password: "" } : { name: "", email: "", phone: "", password: "" });
    setShowPass(false);
  };

  const closeModal = () => setModal({ open: false, type: "", data: null });

  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone || (modal.type === "add" && !form.password)) {
      toast.error("All fields are required"); return;
    }
    const payload = { ...form, role: "admin" };
    if (!form.password) delete payload.password;
    if (modal.type === "add") await API.post("/admin/admins", payload);
    else await API.put(`/admin/admins/${modal.data._id}`, payload);
    fetchAdmins(); closeModal();
    toast.success(modal.type === "add" ? "Admin added!" : "Admin updated!");
  };

  const handleStatusToggle = async (id, status) => {
    const action = status === "suspended" ? "activate" : "suspend";
    if (!window.confirm(`${action} this admin?`)) return;
    try { await API.patch(`/admin/admins/status/${id}`); toast.success(`Admin ${action}d`); fetchAdmins(); }
    catch { toast.error("Failed to update status"); }
  };

  const inp = "w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Admin Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage system administrators</p>
        </div>
        <button onClick={() => openModal("add")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md">
          <PlusCircle size={16} /> Add Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: admins.length, bg: "bg-blue-50", text: "text-blue-600" },
          { label: "Active", value: admins.filter((a) => a.status !== "suspended").length, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: "Suspended", value: admins.filter((a) => a.status === "suspended").length, bg: "bg-red-50", text: "text-red-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${s.bg} ${s.text} rounded-xl flex items-center justify-center text-base font-extrabold`}>{s.value}</div>
            <span className="text-sm font-semibold text-gray-600">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_1.5fr_80px_100px] px-5 py-3.5 border-b border-gray-100">
          {["Administrator", "Email", "Phone", "Edit", "Status"].map((h, i) => (
            <div key={h} className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i >= 3 ? "text-center" : ""}`}>{h}</div>
          ))}
        </div>
        {admins.length === 0
          ? <div className="py-12 text-center text-sm text-gray-400">No administrators found</div>
          : admins.map((a) => (
            <div key={a._id} className={`grid grid-cols-[2fr_2fr_1.5fr_80px_100px] px-5 py-4 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${a.status === "suspended" ? "bg-red-50/30" : ""}`}>
              <div className="flex items-center gap-3">
                <Avatar name={a.name} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{a.name}</p>
                  {a.status === "suspended" && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">Suspended</span>}
                </div>
              </div>
              <p className="text-sm text-gray-600 truncate pr-4">{a.email}</p>
              <p className="text-sm text-gray-600">{a.phone}</p>
              <div className="text-center">
                <button onClick={() => openModal("edit", a)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  <Edit size={15} />
                </button>
              </div>
              <div className="text-center">
                <button onClick={() => handleStatusToggle(a._id, a.status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${a.status === "suspended" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                  {a.status === "suspended" ? "Activate" : "Suspend"}
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {admins.map((a) => (
          <div key={a._id} className={`bg-white rounded-2xl border p-4 ${a.status === "suspended" ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={a.name} />
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">{a.name}</p>
                {a.status === "suspended" && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">Suspended</span>}
              </div>
            </div>
            <div className="space-y-1 mb-3">
              <p className="flex items-center gap-2 text-xs text-gray-600"><Mail size={12} className="text-gray-400" />{a.email}</p>
              <p className="flex items-center gap-2 text-xs text-gray-600"><Phone size={12} className="text-gray-400" />{a.phone}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openModal("edit", a)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors">
                <Edit size={13} /> Edit
              </button>
              <button onClick={() => handleStatusToggle(a._id, a.status)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors ${a.status === "suspended" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
                {a.status === "suspended" ? <><CheckCircle size={13} /> Activate</> : <><Ban size={13} /> Suspend</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-[#1a1f36]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#1a1f36] rounded-lg flex items-center justify-center text-white"><UserCog size={16} /></div>
                <h3 className="font-extrabold text-gray-900">{modal.type === "add" ? "Add Admin" : "Edit Admin"}</h3>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: "Full Name", key: "name", icon: <UserCog size={14} />, type: "text", placeholder: "Full name" },
                { label: "Email", key: "email", icon: <Mail size={14} />, type: "email", placeholder: "admin@ezfix.in" },
                { label: "Phone", key: "phone", icon: <Phone size={14} />, type: "tel", placeholder: "+91 98765 43210" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{f.icon}</span>
                    <input type={f.type} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder} className={inp} />
                  </div>
                </div>
              ))}
              {modal.type === "add" && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><ShieldCheck size={14} /></span>
                    <input type={showPass ? "text" : "password"} value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min. 8 characters" className={inp + " pr-10"} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold transition-all shadow-md">
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
