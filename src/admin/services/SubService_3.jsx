import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2, X } from "lucide-react";
import { addSubService3, getAllSubService3, updateSubService3, deleteSubService3 } from "../../apiservice/subservice_3";
import { getServices } from "../../apiservice/service";
import { getSubServices } from "../../apiservice/subservice";
import { getAllSubService1 } from "../../apiservice/subservice_1";
import { getAllSubService2 } from "../../apiservice/subservice_2";
import toast from "react-hot-toast";

const inp = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";

const SubService3 = () => {
  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [sub1List, setSub1List] = useState([]);
  const [sub2List, setSub2List] = useState([]);
  const [list, setList] = useState([]);
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [serviceId, setServiceId] = useState("");
  const [subServiceId, setSubServiceId] = useState("");
  const [subService1Id, setSubService1Id] = useState("");
  const [subService2Id, setSubService2Id] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [s, ss, ss1, ss2, ss3] = await Promise.all([getServices(), getSubServices(), getAllSubService1(), getAllSubService2(), getAllSubService3()]);
    setServices(s.data.data || []);
    setSubServices(ss.data.data || []);
    setSub1List(ss1.data.data || []);
    setSub2List(ss2.data.data || []);
    setList(ss3.data.data || []);
  };

  const resetForm = () => { setServiceId(""); setSubServiceId(""); setSubService1Id(""); setSubService2Id(""); setName(""); setPrice(""); setDescription(""); };

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });
    if (data) { setServiceId(data.serviceId?._id || ""); setSubServiceId(data.subServiceId?._id || ""); setSubService1Id(data.subService1Id?._id || ""); setSubService2Id(data.subService2Id?._id || ""); setName(data.subService3Name || ""); setPrice(data.price || ""); setDescription(data.description || ""); }
    else resetForm();
  };

  const closeModal = () => { setModal({ open: false, type: "", data: null }); resetForm(); };

  const handleSave = async () => {
    if (!serviceId || !subServiceId || !subService1Id || !subService2Id || !name || !price || !description) { toast.error("All fields are required"); return; }
    const fd = new FormData();
    fd.append("serviceId", serviceId); fd.append("subServiceId", subServiceId);
    fd.append("subService1Id", subService1Id); fd.append("subService2Id", subService2Id);
    fd.append("subService3Name", name); fd.append("price", price); fd.append("description", description);
    if (modal.type === "add") await addSubService3(fd);
    else await updateSubService3(modal.data._id, fd);
    toast.success(modal.type === "add" ? "Added!" : "Updated!");
    fetchAll(); closeModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    await deleteSubService3(id); fetchAll();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Sub Services Level 3</h1>
          <p className="text-sm text-gray-500 mt-0.5">{list.length} packages</p>
        </div>
        <button onClick={() => openModal("add")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md">
          <PlusCircle size={16} /> Add Package
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Package Name", "Price", "Sub Svc 2", "Sub Svc 1", "Sub Svc", "Service", "Edit", "Del"].map((h, i) => (
                  <th key={h} className={`px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap ${i >= 6 ? "text-center" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.length === 0
                ? <tr><td colSpan="8" className="px-4 py-12 text-center text-sm text-gray-400">No packages yet</td></tr>
                : list.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">{item.subService3Name}</td>
                    <td className="px-4 py-3.5 text-sm font-extrabold text-blue-600">₹{item.price}</td>
                    <td className="px-4 py-3.5 text-sm text-violet-600 whitespace-nowrap">{item.subService2Id?.name}</td>
                    <td className="px-4 py-3.5 text-sm text-emerald-600 whitespace-nowrap">{item.subService1Id?.name}</td>
                    <td className="px-4 py-3.5 text-sm text-amber-600 whitespace-nowrap">{item.subServiceId?.name}</td>
                    <td className="px-4 py-3.5 text-sm text-blue-600 whitespace-nowrap">{item.serviceId?.name}</td>
                    <td className="px-4 py-3.5 text-center"><button onClick={() => openModal("edit", item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={14} /></button></td>
                    <td className="px-4 py-3.5 text-center"><button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {list.length === 0
            ? <div className="py-12 text-center text-sm text-gray-400">No packages yet</div>
            : list.map((item) => (
              <div key={item._id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{item.subService3Name}</p>
                    <p className="text-sm font-extrabold text-blue-600 mt-0.5">₹{item.price}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal("edit", item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    { label: item.serviceId?.name, color: "bg-blue-50 text-blue-700" },
                    { label: item.subServiceId?.name, color: "bg-amber-50 text-amber-700" },
                    { label: item.subService1Id?.name, color: "bg-emerald-50 text-emerald-700" },
                    { label: item.subService2Id?.name, color: "bg-violet-50 text-violet-700" },
                  ].filter(t => t.label).map((tag, i) => (
                    <span key={i} className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${tag.color}`}>{tag.label}</span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-[#1a1f36]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-extrabold text-gray-900">{modal.type === "add" ? "Add" : "Edit"} Package</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                { label: "Service", val: serviceId, set: (v) => { setServiceId(v); setSubServiceId(""); setSubService1Id(""); setSubService2Id(""); }, opts: services },
                { label: "Sub Service", val: subServiceId, set: (v) => { setSubServiceId(v); setSubService1Id(""); setSubService2Id(""); }, opts: subServices.filter((s) => s.serviceId?._id === serviceId) },
                { label: "Sub Service 1", val: subService1Id, set: (v) => { setSubService1Id(v); setSubService2Id(""); }, opts: sub1List.filter((s) => s.subServiceId?._id === subServiceId) },
                { label: "Sub Service 2", val: subService2Id, set: setSubService2Id, opts: sub2List.filter((s) => s.subService1Id?._id === subService1Id) },
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
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Package Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Basic Repair" className={inp} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Price (₹)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 499" className={inp} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Package description" rows={2} className={inp + " resize-none"} />
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

export default SubService3;
