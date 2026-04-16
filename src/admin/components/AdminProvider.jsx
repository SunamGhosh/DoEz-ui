import { useEffect, useState } from "react";
import { Edit, Trash2, UserCheck, CheckCircle2, XCircle, Clock, Eye, Briefcase, X } from "lucide-react";
import { getAllProviders, addProvider, updateProvider, deleteProvider, approveProviderKyc } from "../../apiservice/provider";
import { getImageUrl } from "../../utils/imageUtils";

const kycBadge = (status) => {
  if (status === "approved") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 size={13} />Approved</span>;
  if (status === "rejected") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><XCircle size={13} />Rejected</span>;
  if (status === "pending") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"><Clock size={13} />Pending</span>;
  return <span className="text-xs text-gray-400">Not Submitted</span>;
};

const DocImage = ({ src, alt }) => src ? (
  <div className="relative group cursor-pointer" onClick={() => window.open(getImageUrl(src), "_blank")}>
    <img src={getImageUrl(src)} alt={alt} className="w-full h-36 object-cover rounded-xl border border-gray-100" />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
      <Eye className="text-white" size={24} />
    </div>
  </div>
) : <div className="w-full h-36 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 text-sm border border-dashed border-gray-200">No image</div>;

const AdminProvider = () => {
  const [providers, setProviders] = useState([]);
  const [modal, setModal] = useState({ open: false, data: null });
  const [kycModal, setKycModal] = useState({ open: false, provider: null });
  const [form, setForm] = useState({ name: "", workArea: "", experienceYears: "" });

  useEffect(() => { loadProviders(); }, []);

  const loadProviders = async () => {
    const res = await getAllProviders();
    setProviders(res.data.data || []);
  };

  const openModal = (data = null) => { setModal({ open: true, data }); setForm(data || { name: "", workArea: "", experienceYears: "" }); };
  const closeModal = () => { setModal({ open: false, data: null }); setForm({ name: "", workArea: "", experienceYears: "" }); };

  const handleSave = async () => {
    if (modal.data) await updateProvider(modal.data._id, form);
    else await addProvider(form);
    closeModal(); loadProviders();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this provider?")) { await deleteProvider(id); loadProviders(); }
  };

  const handleKyc = async (id, status) => {
    try { await approveProviderKyc(id, status); loadProviders(); }
    catch { alert("Failed to update KYC"); }
  };

  const inp = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Service Providers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{providers.length} providers registered</p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr_1.5fr_80px_60px] px-5 py-3.5 border-b border-gray-100">
          {["Name", "Work Area", "Exp.", "Availability", "Expertise", "KYC", "Edit", "Del"].map((h, i) => (
            <div key={h} className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i >= 6 ? "text-center" : ""}`}>{h}</div>
          ))}
        </div>
        {providers.map((p) => (
          <div key={p._id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr_1.5fr_80px_60px] px-5 py-4 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
            <p className="text-sm font-semibold text-gray-900">{p.name}</p>
            <p className="text-sm text-blue-600">{p.workArea}</p>
            <p className="text-sm text-gray-600">{p.experienceYears || "—"}</p>
            <p className="text-sm text-gray-600 capitalize">{p.availability || "—"}</p>
            <div>
              {p.providerServices?.[0]
                ? <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-semibold">{p.providerServices[0].subServiceId?.name || "Service"}{p.providerServices.length > 1 && ` +${p.providerServices.length - 1}`}</span>
                : <span className="text-[10px] text-gray-400 italic">None</span>}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {kycBadge(p.kycStatus)}
              <button onClick={() => setKycModal({ open: true, provider: p })} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={13} /></button>
              {p.kycStatus === "pending" && (
                <>
                  <button onClick={() => handleKyc(p._id, "approved")} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-200">✓</button>
                  <button onClick={() => handleKyc(p._id, "rejected")} className="px-2 py-0.5 bg-red-100 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-200">✗</button>
                </>
              )}
            </div>
            <div className="text-center"><button onClick={() => openModal(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={14} /></button></div>
            <div className="text-center"><button onClick={() => handleDelete(p._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button></div>
          </div>
        ))}
        {providers.length === 0 && <div className="py-12 text-center text-sm text-gray-400">No providers found</div>}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {providers.map((p) => (
          <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-gray-900">{p.name}</p>
                <p className="text-xs text-blue-600">{p.workArea}</p>
              </div>
              {kycBadge(p.kycStatus)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
              <span>Exp: {p.experienceYears || "—"}</span>
              <span>Avail: {p.availability || "—"}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openModal(p)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">Edit</button>
              <button onClick={() => setKycModal({ open: true, provider: p })} className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">KYC</button>
              <button onClick={() => handleDelete(p._id)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-[#1a1f36]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900">{modal.data ? "Edit" : "Add"} Provider</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                { label: "Name", key: "name", placeholder: "Provider name" },
                { label: "Work Area", key: "workArea", placeholder: "City / Area" },
                { label: "Experience (years)", key: "experienceYears", placeholder: "e.g. 3" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} className={inp} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold transition-all shadow-md">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* KYC Modal */}
      {kycModal.open && kycModal.provider && (
        <div className="fixed inset-0 bg-[#1a1f36]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">KYC Details</p>
                <h3 className="font-extrabold text-gray-900">{kycModal.provider.name}</h3>
              </div>
              <button onClick={() => setKycModal({ open: false, provider: null })} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Basic info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Name", value: kycModal.provider.name },
                  { label: "Email", value: kycModal.provider.email },
                  { label: "Phone", value: kycModal.provider.phone },
                  { label: "Work Area", value: kycModal.provider.workArea },
                  { label: "Experience", value: `${kycModal.provider.experienceYears || "—"} yrs` },
                  { label: "KYC Status", value: kycModal.provider.kycStatus || "—" },
                ].map((d, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{d.label}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{d.value || "—"}</p>
                  </div>
                ))}
              </div>
              {/* Services */}
              {kycModal.provider.providerServices?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Briefcase size={11} />Services</p>
                  <div className="flex flex-wrap gap-2">
                    {kycModal.provider.providerServices.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">{s.subServiceId?.name || "Service"}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Documents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Aadhar ({kycModal.provider.aadharNumber || "—"})</p>
                  <DocImage src={kycModal.provider.aadharFile} alt="Aadhar" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">PAN ({kycModal.provider.panNumber || "—"})</p>
                  <DocImage src={kycModal.provider.panFile} alt="PAN" />
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bank Passbook (IFSC: {kycModal.provider.bankDetails?.ifscCode || "—"}, Acc: {kycModal.provider.bankDetails?.accountNumber || "—"})</p>
                  <DocImage src={kycModal.provider.bankDetails?.passbookImage} alt="Passbook" />
                </div>
              </div>
            </div>
            {kycModal.provider.kycStatus === "pending" && (
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => { handleKyc(kycModal.provider._id, "rejected"); setKycModal({ open: false, provider: null }); }}
                  className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                  <XCircle size={15} /> Reject
                </button>
                <button onClick={() => { handleKyc(kycModal.provider._id, "approved"); setKycModal({ open: false, provider: null }); }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2">
                  <CheckCircle2 size={15} /> Approve KYC
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProvider;
