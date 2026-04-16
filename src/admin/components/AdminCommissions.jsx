import React, { useState, useEffect } from "react";
import API from "../../api";
import { TrendingUp, Users, IndianRupee, Calendar, ChevronRight, User, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AdminCommissions = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [details, setDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    API.get("/admin/commissions")
      .then((res) => setStats(res.data.data))
      .catch(() => toast.error("Failed to fetch commission statistics"))
      .finally(() => setLoading(false));
  }, []);

  const fetchProviderDetails = async (provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await API.get(`/admin/commissions/${provider._id?._id}`);
      setDetails(res.data.data);
    } catch { toast.error("Failed to fetch provider details"); }
    finally { setLoadingDetails(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
    </div>
  );

  const { overall = {}, providers = [] } = stats || {};

  const MetricCard = ({ label, value, accent }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-2xl font-extrabold ${accent || "text-gray-900"}`}>₹{value?.toLocaleString() ?? "—"}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">Platform Earnings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Commission and business volume overview</p>
      </div>

      {/* Business volume */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><TrendingUp size={13} />Business Volume</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Today" value={overall.todayAmount} />
          <MetricCard label="Yesterday" value={overall.yesterdayAmount} />
          <MetricCard label="Last 10 Days" value={overall.tenDaysAmount} />
          <MetricCard label="Total Volume" value={overall.totalBusiness} />
        </div>
      </div>

      {/* Commissions */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><IndianRupee size={13} />Platform Commission (10%)</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Today" value={overall.todayCommission} accent="text-blue-600" />
          <MetricCard label="Yesterday" value={overall.yesterdayCommission} accent="text-blue-600" />
          <MetricCard label="Last 10 Days" value={overall.tenDaysCommission} accent="text-blue-600" />
          <MetricCard label="Total Commission" value={overall.totalCommission} accent="text-blue-600" />
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Completed Jobs", value: overall.jobCount || 0, icon: <Calendar className="w-5 h-5" />, bg: "bg-amber-50", text: "text-amber-600" },
          { label: "Active Providers", value: providers.length, icon: <Users className="w-5 h-5" />, bg: "bg-violet-50", text: "text-violet-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">{s.label}</p>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            </div>
            <div className={`w-12 h-12 ${s.bg} ${s.text} rounded-xl flex items-center justify-center`}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Provider table — desktop */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Per-Provider Summary</h3>
        </div>

        {/* Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Provider", "Jobs", "Business", "Commission (10%)", ""].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {providers.length === 0 ? (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-sm text-gray-400">No data yet</td></tr>
              ) : providers.map((p) => (
                <tr key={p._id?._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0"><User className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{p._id?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{p._id?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">{p.jobCount}</span></td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-700">₹{p.totalBusiness?.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm font-extrabold text-blue-600">₹{p.totalCommission?.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => fetchProviderDetails(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><ChevronRight size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {providers.length === 0
            ? <div className="py-12 text-center text-sm text-gray-400">No data yet</div>
            : providers.map((p) => (
              <div key={p._id?._id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0"><User className="w-4 h-4" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p._id?.name || "—"}</p>
                    <p className="text-xs text-gray-400">{p.jobCount} jobs · <span className="text-blue-600 font-bold">₹{p.totalCommission?.toLocaleString()}</span></p>
                  </div>
                </div>
                <button onClick={() => fetchProviderDetails(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all shrink-0"><ChevronRight size={16} /></button>
              </div>
            ))}
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1a1f36]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Provider Breakdown</p>
                <h3 className="font-extrabold text-gray-900">{selectedProvider?._id?.name}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div>
              ) : details.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">No history available</div>
              ) : (
                <div className="space-y-3">
                  {details.map((job) => (
                    <div key={job._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{job.service_id?.subService3Name || "Service"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{job.service_id?.serviceId?.name} → {job.service_id?.subServiceId?.name}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-semibold">Amount</p>
                          <p className="text-sm font-extrabold text-gray-900">₹{job.amount}</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-semibold">Commission</p>
                          <p className="text-sm font-extrabold text-blue-600">₹{job.commissionAmount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex gap-6 sm:gap-8">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Jobs</p>
                  <p className="text-xl font-extrabold text-gray-900">{details.length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Commission</p>
                  <p className="text-xl font-extrabold text-blue-600">₹{details.reduce((a, c) => a + (c.commissionAmount || 0), 0)}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommissions;
