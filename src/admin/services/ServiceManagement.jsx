import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2, X, ImageIcon } from "lucide-react";
import { addService, getServices, updateService, deleteService } from "../../apiservice/service";
import { getImageUrl } from "../../utils/imageUtils";
import toast from "react-hot-toast";

const inp = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [image, setImage] = useState(null);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try { const res = await getServices(); setServices(res.data.data || []); }
    catch (err) { console.error(err); }
  };

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });
    setForm(data ? { name: data.name || "", description: data.description || "", price: data.price || "" } : { name: "", description: "", price: "" });
    setImage(null);
  };

  const closeModal = () => { setModal({ open: false, type: "", data: null }); setForm({ name: "", description: "", price: "" }); setImage(null); };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price) { toast.error("All fields are required"); return; }
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("price", Number(form.price));
    if (image) fd.append("image", image);
    try {
      if (modal.type === "add") await addService(fd);
      else await updateService(modal.data._id, fd);
      toast.success(modal.type === "add" ? "Service added!" : "Service updated!");
      fetchServices(); closeModal();
    } catch (err) { toast.error("Failed to save service"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    await deleteService(id); toast.success("Deleted"); fetchServices();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Service Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{services.length} services</p>
        </div>
        <button onClick={() => openModal("add")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md">
          <PlusCircle size={16} /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {services.map((s) => (
          <div key={s._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
            <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
              {s.image
                ? <img src={getImageUrl(s.image)} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="w-8 h-8" /></div>}
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm text-gray-900 truncate">{s.name}</h3>
              <p className="text-xs text-gray-500 truncate mt-0.5">{s.description}</p>
              <p className="text-sm font-extrabold text-blue-600 mt-1">₹{s.price}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openModal("edit", s)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                  <Edit size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(s._id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-[#1a1f36]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900">{modal.type === "add" ? "Add" : "Edit"} Service</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                { label: "Service Name", key: "name", type: "text", placeholder: "e.g. Electrical" },
                { label: "Price (₹)", key: "price", type: "number", placeholder: "e.g. 499" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} className={inp} />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Service description" rows={2} className={inp + " resize-none"} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold transition-all shadow-md">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
