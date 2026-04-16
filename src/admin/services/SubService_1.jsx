import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2, X } from "lucide-react";
import { getServices } from "../../apiservice/service";
import { getSubServices } from "../../apiservice/subservice";
import { addSubService1, getAllSubService1, updateSubService1, deleteSubService1 } from "../../apiservice/subservice_1";
import toast from "react-hot-toast";

const inp = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";

const SubService1 = () => {
  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [list, setList] = useState([]);
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [serviceId, setServiceId] = useState("");
  const [subServiceId, setSubServiceId] = useState("");
  const [name, setName] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [s, ss, ss1] = await Promise.all([getServices(), getSubServices(), getAllSubService1()]);
    setServices(s.data.data || []);
    setSubServices(ss.data.data || []);
    setList(ss1.data.data || []);
  };

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });
    if (data) { setServiceId(data.serviceId?._id || ""); setSubServiceId(data.subServiceId?._id || ""); setName(data.name || ""); }
    else { setServiceId(""); setSubServiceId(""); setName(""); }
  };

  const closeModal = () => { setModal({ open: false, type: "", data: null }); setServiceId(""); setSubServiceId(""); setName(""); };

  const handleSave = async () => {
    if (!serviceId || !subServiceId || !name) { toast.error("All fields are required"); return; }
    const payload = { serviceId, subServiceId, name };
    if (modal.type === "add") await addSubService1(payload);
    else await updateSubService1(modal.data._id, payload);
    toast.success(modal.type === "add" ? "Added!" : "Updated!");
    fetchAll(); closeModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    await deleteSubService1(id); fetchAll();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Sub Services Level 1</h1>
          <p className="text-sm text-gray-500 mt-0.5">{list.length} entries</p>
        </div>
        <button onClick={() => openModal("add")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md">
          <PlusCircle size={16} /> Add
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_2fr_80px_60px] px-5 py-3.5 border-b border-gray-100">
          {["Name", "Sub Service", "Service", "Edit", "Del"].map((h, i) => (
            <div key={h} className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i >= 3 ? "text-center" : ""}`}>{h}</div>
          ))}
        </div>
        {list.length === 0
          ? <div className="py-12 text-center text-sm text-gray-400">No entries yet</div>
          : list.map((item) => (
            <div key={item._id} className="grid grid-cols-[2fr_2fr_2fr_80px_60px] px-5 py-4 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
              <p className="text-sm text-violet-600">{item.subServiceId?.name}</p>
              <p className="text-sm text-blue-600">{item.serviceId?.name}</p>
              <div className="text-center"><button onClick={() => openModal("edit", item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={14} /></button></div>
              <div className="text-center"><button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button></div>
            </div>
          ))}
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {list.length === 0
          ? <div className="py-12 text-center text-sm text-gray-400 bg-white rounded-2xl border border-gray-100">No entries yet</div>
          : list.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                <div className="flex gap-1">
                  <button onClick={() => openModal("edit", item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-xs text-violet-600">{item.subServiceId?.name}</p>
              <p className="text-xs text-blue-600">{item.serviceId?.name}</p>
            </div>
          ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-[#1a1f36]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900">{modal.type === "add" ? "Add" : "Edit"} Sub Service 1</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Service</label>
                <select value={serviceId} onChange={(e) => { setServiceId(e.target.value); setSubServiceId(""); }} className={inp}>
                  <option value="">Select service</option>
                  {services.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sub Service</label>
                <select value={subServiceId} onChange={(e) => setSubServiceId(e.target.value)} className={inp}>
                  <option value="">Select sub service</option>
                  {subServices.filter((s) => s.serviceId?._id === serviceId).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Level 1 name" className={inp} />
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

export default SubService1;
