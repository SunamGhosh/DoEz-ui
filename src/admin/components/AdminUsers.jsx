import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser, updateUserStatus } from "../../apiservice/admin";
import {
  Loader2, Search, User, Mail, Phone, Trash2, CheckCircle,
  XCircle, MapPin, Eye, Ban, Shield, UserCircle, Briefcase, X, FileText, Award, QrCode, ClipboardList,
  Clock, ShieldCheck, CreditCard
} from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";
import toast from "react-hot-toast";
import API from "../../api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewModal, setViewModal] = useState({ open: false, user: null });

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      if (res.data.success) setUsers(res.data.data);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const isSuspended = currentStatus === "suspended";
    const action = isSuspended ? "activate" : "suspend";
    const newStatus = isSuspended ? "active" : "suspended";

    if (!window.confirm(`Are you sure you want to ${action} this account?`)) return;

    try {
      await updateUserStatus(id, newStatus);
      toast.success(`User ${action}ed successfully`);
      fetchUsers();
    } catch (err) {
      console.error("Status Toggle Error:", err);
      const errorMsg = err.response?.data?.message || err.message || `Failed to ${action} user`;
      toast.error(errorMsg);
    }
  };

  const filtered = users.filter((u) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      (u.name?.toLowerCase() || "").includes(s) ||
      (u.email?.toLowerCase() || "").includes(s) ||
      (u.phone?.toLowerCase() || "").includes(s) ||
      (u.role?.toLowerCase() || "").includes(s);

    const matchesFilter = activeFilter === "all" || u.role === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case "admin": return <Shield className="w-3.5 h-3.5" />;
      case "provider": return <Briefcase className="w-3.5 h-3.5" />;
      default: return <UserCircle className="w-3.5 h-3.5" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin": return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "provider": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-blue-50 text-blue-700 border-blue-100";
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <Loader2 className="w-6 h-6 text-blue-600 absolute inset-0 m-auto animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            User Directory
            <span className="text-xs font-black px-3 py-1 bg-blue-600 text-white rounded-full tracking-widest uppercase shadow-lg shadow-blue-200">System</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative group flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text" placeholder="Search by name, email, or role..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-[1.25rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium shadow-sm transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs Section */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-100/40 p-2 rounded-[1.5rem] border border-gray-200/50 w-fit backdrop-blur-sm">
        {[
          { label: "All Directory", value: "all", count: users.length, color: "blue" },
          { label: "Customers", value: "customer", count: users.filter(u => u.role === "customer").length, color: "blue" },
          { label: "Providers", value: "provider", count: users.filter(u => u.role === "provider").length, color: "blue" },
          { label: "Admins", value: "admin", count: users.filter(u => u.role === "admin").length, color: "blue" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-6 py-3 rounded-[1.1rem] text-xs font-black transition-all flex items-center gap-3 uppercase tracking-wider ${activeFilter === tab.value
              ? "bg-white text-blue-600 shadow-xl shadow-blue-100 ring-1 ring-gray-200/50"
              : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
              }`}
          >
            {tab.label}
            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] ${activeFilter === tab.value ? "bg-blue-50 text-blue-600" : "bg-gray-200/50 text-gray-500"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Profile</th>
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact</th>
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Verification</th>
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length > 0 ? filtered.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/40 transition-all group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 shrink-0 overflow-hidden border border-gray-200 shadow-sm transition-transform group-hover:scale-105">
                          {user.profileImage
                            ? <img src={getImageUrl(user.profileImage)} alt="" className="w-full h-full object-cover" />
                            : <UserCircle className="w-6 h-6" />}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${user.status === "suspended" ? "bg-red-500" : "bg-emerald-500"}`}>
                          {user.status === "suspended" ? <X className="w-2 h-2 text-white stroke-[4]" /> : <CheckCircle className="w-2 h-2 text-white stroke-[4]" />}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{user.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className={`text-[8px] font-black uppercase tracking-wider flex items-center gap-1.5 px-1.5 py-0.5 rounded-md ${user.status === 'suspended' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                            <span className={`w-1 h-1 rounded-full ${user.status === 'suspended' ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
                            {user.status === 'suspended' ? 'Suspended' : 'Active'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="space-y-0.5">
                      <p className="flex items-center gap-2 text-xs text-gray-700 font-bold">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {user.email}
                      </p>
                      <p className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {user.phone || "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase border shadow-sm ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 rounded-lg ${user.isVerified ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {user.isVerified ? <CheckCircle size={10} /> : <X size={10} />}
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3">
                      {/* Profile View */}
                      <button
                        onClick={() => setViewModal({ open: true, user })}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="View Profile"
                      >
                        <Eye size={20} />
                      </button>

                      {/* Status Toggle Button */}
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleStatusToggle(user._id, user.status)}
                          className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all shadow-sm ${user.status === "suspended"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                        >
                          {user.status === "suspended" ? "Activate" : "Suspend"}
                        </button>
                      )}


                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto gap-4">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 border-4 border-gray-100 animate-pulse">
                        <Search size={48} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-gray-900">Search Yielded Nothing</p>
                        <p className="text-sm text-gray-500">We couldn't find any users matching your criteria. Try different keywords.</p>
                      </div>
                      <button onClick={() => { setSearchTerm(""); setActiveFilter("all") }} className="mt-2 px-6 py-2.5 bg-blue-600 text-white text-xs font-black uppercase rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Clear Search</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {viewModal.open && viewModal.user && (
        <div className="fixed inset-0 bg-[#1a1f36]/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in duration-300 border border-white/20 flex flex-col md:flex-row">
            {/* Sidebar Info */}
            <div className="bg-gray-50/50 p-6 md:w-64 flex flex-col items-center text-center border-r border-gray-100 shrink-0">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-[1.5rem] bg-white p-1.5 shadow-xl">
                  <div className="w-full h-full rounded-[1.25rem] bg-gray-50 flex items-center justify-center text-gray-200 overflow-hidden border border-gray-100">
                    {viewModal.user.profileImage
                      ? <img src={getImageUrl(viewModal.user.profileImage)} alt="" className="w-full h-full object-cover" />
                      : <User size={32} />}
                  </div>
                </div>
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white shadow-lg ${viewModal.user.status === 'suspended' ? 'bg-red-500' : 'bg-emerald-500'}`} />
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight mb-1.5">{viewModal.user.name}</h3>
              <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase border shadow-sm ${getRoleColor(viewModal.user.role)}`}>
                {viewModal.user.role}
              </span>
              <div className="mt-6 w-full space-y-2">
                <div className="p-2.5 bg-white rounded-xl border border-gray-100 text-left">
                  <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Status</p>
                  <p className={`text-[10px] font-black ${viewModal.user.status === 'suspended' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {viewModal.user.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gray-100 text-left">
                  <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Joined</p>
                  <p className="text-[10px] font-black text-gray-900">{new Date(viewModal.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative">
                <button onClick={() => setViewModal({ open: false, user: null })} className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-all z-10">
                  <X size={18} />
                </button>

                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Contact Information</h4>
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Primary Email</p>
                      <p className="text-sm font-bold text-gray-900">{viewModal.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Mobile Number</p>
                      <p className="text-sm font-bold text-gray-900">{viewModal.user.phone || "Missing"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Physical Address</p>
                      <p className="text-sm font-bold text-gray-700 leading-relaxed">{viewModal.user.address || "No address on file"}</p>
                    </div>
                  </div>
                </div>

                {/* Provider Specific Data Section */}
                {viewModal.user.role === 'provider' && (
                  <div className="mt-8 pt-8 border-t border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Professional & Verification Details</h4>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Award className="w-3.5 h-3.5 text-blue-600" />
                          <p className="text-[9px] font-black text-gray-400 uppercase">Experience</p>
                        </div>
                        <p className="text-xs font-bold text-gray-900">{viewModal.user.experienceYears || viewModal.user.experience || "0"} Years</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <p className="text-[9px] font-black text-gray-400 uppercase">Work Area</p>
                        </div>
                        <p className="text-xs font-bold text-gray-900 truncate">{viewModal.user.workArea || "Not set"}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <p className="text-[9px] font-black text-gray-400 uppercase">Availability</p>
                        </div>
                        <p className="text-xs font-bold text-gray-900 capitalize">{viewModal.user.availability || "Standard"}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck className={`w-3.5 h-3.5 ${viewModal.user.kycStatus === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <p className="text-[9px] font-black text-gray-400 uppercase">KYC Status</p>
                        </div>
                        <p className={`text-xs font-bold uppercase ${viewModal.user.kycStatus === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`}>{viewModal.user.kycStatus || "Pending"}</p>
                      </div>
                    </div>

                    {viewModal.user.providerServices?.length > 0 && (
                      <div className="mb-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase size={12} />Expertise</p>
                        <div className="flex flex-wrap gap-2">
                          {viewModal.user.providerServices.map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-100">{s.subServiceId?.name || "Service"}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          KYC Documents
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Aadhar", file: viewModal.user.aadharFile, num: viewModal.user.aadharNumber },
                            { label: "PAN", file: viewModal.user.panFile, num: viewModal.user.panNumber },
                            { label: "Passbook", file: viewModal.user.bankDetails?.passbookImage }
                          ].map((doc, i) => (
                            <div key={i} className="space-y-1">
                              <div className="group relative aspect-[4/3] bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-zoom-in" onClick={() => doc.file && window.open(getImageUrl(doc.file), "_blank")}>
                                {doc.file ? (
                                  <img src={getImageUrl(doc.file)} alt={doc.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                    <FileText className="w-4 h-4 opacity-20" />
                                  </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/60 to-transparent">
                                  <p className="text-[7px] font-black text-white uppercase">{doc.label}</p>
                                </div>
                              </div>
                              {doc.num && <p className="text-[8px] font-bold text-gray-900 truncate px-1 opacity-60 text-center">{doc.num}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center gap-2"><CreditCard size={12} />Banking Info</p>
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-[9px] text-gray-400 font-bold">IFSC:</span>
                              <span className="text-[10px] font-bold text-gray-900">{viewModal.user.bankDetails?.ifscCode || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[9px] text-gray-400 font-bold">ACC:</span>
                              <span className="text-[10px] font-bold text-gray-900">{viewModal.user.bankDetails?.accountNumber || "—"}</span>
                            </div>
                          </div>
                        </div>
                        {viewModal.user.paymentQrCode && (
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
                              <QrCode className="w-3 h-3" />
                              Payment Setup
                            </p>
                            <div className="w-20 h-20 bg-white rounded-xl border border-gray-200 p-1 shadow-sm hover:shadow-md transition-all cursor-zoom-in" onClick={() => window.open(getImageUrl(viewModal.user.paymentQrCode), "_blank")}>
                              <img src={getImageUrl(viewModal.user.paymentQrCode)} alt="QR Code" className="w-full h-full object-contain" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex gap-3 shrink-0">
                {viewModal.user.role !== 'admin' && (
                  <button
                    onClick={() => { handleStatusToggle(viewModal.user._id, viewModal.user.status); setViewModal({ open: false, user: null }); }}
                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg ${viewModal.user.status === 'suspended'
                      ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700'
                      : 'bg-red-600 text-white shadow-red-200 hover:bg-red-700'
                      }`}
                  >
                    {viewModal.user.status === 'suspended' ? 'Re-Activate Account' : 'Suspend Account'}
                  </button>
                )}
                <button
                  onClick={() => setViewModal({ open: false, user: null })}
                  className="px-8 py-3.5 bg-gray-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-gray-800 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
