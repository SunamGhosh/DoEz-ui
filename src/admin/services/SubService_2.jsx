import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2, X, Search } from "lucide-react";
import { getServices } from "../../apiservice/service";
import { getSubServices } from "../../apiservice/subservice";
import { getAllSubService1 } from "../../apiservice/subservice_1";
import { addSubService2, getAllSubService2, updateSubService2, deleteSubService2 } from "../../apiservice/subservice_2";
import toast from "react-hot-toast";

const inp = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";

const SubService2 = () => {
  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [sub1List, setSub1List] = useState([]);
  const [list, setList] = useState([]);
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [search, setSearch] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [subServiceId, setSubServiceId] = useState("");
  const [subService1Id, setSubService1Id] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [s, ss, ss1, ss2] = await Promise.all([getServices(), getSubServices(), getAllSubService1(), getAllSubService2()]);
    setServices(s.data.data || []);
    setSubServices(ss.data.data || []);
    setSub1List(ss1.data.data || []);
    setList(ss2.data.data || []);
  };

  const resetForm = () => { setServiceId(""); setSubServiceId(""); setSubService1Id(""); setName(""); setPrice(""); setDescription(""); };

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });
    if (data) { setServiceId(data.serviceId?._id || ""); setSubServiceId(data.subServiceId?._id || ""); setSubService1Id(data.subService1Id?._id || ""); setName(data.name || ""); setPrice(data.price || ""); setDescription(data.description || ""); }
    else resetForm();
  };

  const closeModal = () => { setModal({ open: false, type: "", data: null }); resetForm(); };

  const handleSave = async () => {
    if (!serviceId || !subServiceId || !subService1Id || !name || !price || !description) { toast.error("All fields are required"); return; }
    const fd = new FormData();
    fd.append("serviceId", serviceId); fd.append("subServiceId", subServiceId);
    fd.append("subService1Id", subService1Id);
    fd.append("name", name); fd.append("price", price); fd.append("description", description);
    if (modal.type === "add") await addSubService2(fd);
    else await updateSubService2(modal.data._id, fd);
    toast.success(modal.type === "add" ? "Added!" : "Updated!");
    fetchAll(); closeModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    await deleteSubService2(id); fetchAll();
  };

  const filtered = list.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.subService1Id?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.subServiceId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.serviceId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Sub Services Level 2</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter entries..."
              className="pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all w-48"
            />
          </div>
          <button onClick={() => openModal("add")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md">
            <PlusCircle size={16} /> Add
          </button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_2fr_2fr_2fr_80px_60px] px-5 py-3.5 border-b border-gray-100">
          {["Name", "Price", "Sub Svc 1", "Sub Svc", "Service", "Edit", "Del"].map((h, i) => (
            <div key={h} className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i >= 5 ? "text-center" : ""}`}>{h}</div>
          ))}
        </div>
//         {filtered.length === 0
//           ? <div className="py-12 text-center text-sm text-gray-400">No entries found</div>
//           : filtered.map((item) => (
//             <div key={item._id} className="grid grid-cols-[2fr_2fr_2fr_2fr_80px_60px] px-5 py-4 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors">

        {list.length === 0
          ? <div className="py-12 text-center text-sm text-gray-400">No entries yet</div>
          : list.map((item) => (
            <div key={item._id} className="grid grid-cols-[2fr_1fr_2fr_2fr_2fr_80px_60px] px-5 py-4 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
 main
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
              <p className="text-sm font-extrabold text-blue-600">₹{item.price}</p>
              <p className="text-sm text-violet-600">{item.subService1Id?.name}</p>
              <p className="text-sm text-emerald-600">{item.subServiceId?.name}</p>
              <p className="text-sm text-blue-600">{item.serviceId?.name}</p>
              <div className="text-center"><button onClick={() => openModal("edit", item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={14} /></button></div>
              <div className="text-center"><button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button></div>
            </div>
          ))}
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0
          ? <div className="py-12 text-center text-sm text-gray-400 bg-white rounded-2xl border border-gray-100">No entries found</div>
          : filtered.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                  <p className="text-sm font-extrabold text-blue-600 mt-0.5">₹{item.price}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal("edit", item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {[
                  { label: item.serviceId?.name, color: "bg-blue-50 text-blue-700" },
                  { label: item.subServiceId?.name, color: "bg-emerald-50 text-emerald-700" },
                  { label: item.subService1Id?.name, color: "bg-violet-50 text-violet-700" },
                ].filter(t => t.label).map((tag, i) => (
                  <span key={i} className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${tag.color}`}>{tag.label}</span>
                ))}
              </div>
            </div>
          ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-[#1a1f36]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-extrabold text-gray-900">{modal.type === "add" ? "Add" : "Edit"} Sub Service 2</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                { label: "Service", val: serviceId, set: (v) => { setServiceId(v); setSubServiceId(""); setSubService1Id(""); }, opts: services },
                { label: "Sub Service", val: subServiceId, set: (v) => { setSubServiceId(v); setSubService1Id(""); }, opts: subServices.filter((s) => s.serviceId?._id === serviceId) },
                { label: "Sub Service 1", val: subService1Id, set: setSubService1Id, opts: sub1List.filter((s) => s.subServiceId?._id === subServiceId) },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <select value={f.val} onChange={(e) => f.set(e.target.value)} className={inp}>
                    <option value="">Select {f.label.toLowerCase()}</option>
                    {f.opts.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Level 2 name" className={inp} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Price (₹)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 499" className={inp} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className={inp + " resize-none"} />
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

export default SubService2;
