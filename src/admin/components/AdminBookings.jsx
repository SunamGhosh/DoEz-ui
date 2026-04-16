import React, { useEffect, useState } from "react";
import { getAllBookings } from "../../apiservice/admin";
import { Loader2, Search, Calendar, Clock, MapPin, User, Eye, Phone, Wrench, X } from "lucide-react";
import toast from "react-hot-toast";

const statusConfig = {
  Completed:  { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  Pending:    { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400" },
  Cancelled:  { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-400" },
  Confirmed:  { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500" },
  Ongoing:    { bg: "bg-violet-100",  text: "text-violet-700",  dot: "bg-violet-500" },
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAllBookings()
      .then((res) => { if (res.data.success) setBookings(res.data.data); })
      .catch(() => toast.error("Failed to fetch bookings"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.customer_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.provider_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch && (statusFilter === "All" || b.status === statusFilter);
  });

  const sc = (status) => statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Booking Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} bookings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          >
            {["All", "Pending", "Confirmed", "Ongoing", "Completed", "Cancelled"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-52" />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium text-sm">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const s = sc(b.status);
            return (
              <div key={b._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 flex-1">
                    <div className="shrink-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</p>
                      <p className="text-sm font-mono font-bold text-gray-900">#{b._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-100 hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold">Customer</p>
                        <p className="text-sm font-bold text-gray-900">{b.customer_id?.name || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center text-violet-600 shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold">Provider</p>
                        <p className="text-sm font-bold text-gray-900">{b.provider_id?.name || "Unassigned"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">Amount</p>
                      <p className="text-sm font-extrabold text-gray-900">₹{b.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{b.status}
                    </span>
                    <button onClick={() => setSelected(b)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-[#1a1f36]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking Details</p>
                <h3 className="text-base font-extrabold text-gray-900">#{selected._id.slice(-6).toUpperCase()}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-600">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${sc(selected.status).bg} ${sc(selected.status).text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc(selected.status).dot}`} />{selected.status}
                </span>
              </div>
              {/* Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Customer", name: selected.customer_id?.name, phone: selected.customer_id?.phone, bg: "bg-blue-50", text: "text-blue-600", icon: <User className="w-4 h-4" /> },
                  { label: "Provider", name: selected.provider_id?.name || "Unassigned", phone: selected.provider_id?.phone, bg: "bg-violet-50", text: "text-violet-600", icon: <Wrench className="w-4 h-4" /> },
                ].map((p, i) => (
                  <div key={i} className={`flex items-center gap-3 p-4 ${p.bg} rounded-xl`}>
                    <div className={`w-9 h-9 bg-white rounded-xl flex items-center justify-center ${p.text} shrink-0`}>{p.icon}</div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${p.text}`}>{p.label}</p>
                      <p className="text-sm font-bold text-gray-900">{p.name}</p>
                      {p.phone && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{p.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {/* Location */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Address</p>
                  <p className="text-sm text-gray-700">{selected.address}</p>
                </div>
              </div>
              {/* Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Amount", value: `₹${selected.amount}` },
                  { label: "Date", value: new Date(selected.createdAt).toLocaleDateString() },
                  { label: "Time", value: new Date(selected.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
                  { label: "Service", value: selected.service_id?.subService3Name || "—" },
                  { label: "Payment", value: selected.paymentStatus || "—" },
                  { label: "ID", value: `#${selected._id.slice(-8).toUpperCase()}` },
                ].map((d, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{d.label}</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
