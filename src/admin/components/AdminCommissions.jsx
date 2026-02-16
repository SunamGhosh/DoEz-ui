import React, { useState, useEffect } from "react";
import API from "../../api";
import {
    TrendingUp,
    Users,
    IndianRupee,
    Calendar,
    ChevronRight,
    User,
    ArrowUpRight,
    X,
    FileText,
    BrainCircuit,
    Layers,
    History
} from "lucide-react";
import toast from "react-hot-toast";

const AdminCommissions = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [details, setDetails] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await API.get("/admin/commissions");
                setStats(res.data.data);
            } catch (err) {
                toast.error("Failed to fetch commission statistics");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const fetchProviderDetails = async (provider) => {
        setSelectedProvider(provider);
        setIsModalOpen(true);
        setLoadingDetails(true);
        try {
            const res = await API.get(`/admin/commissions/${provider._id?._id}`);
            setDetails(res.data.data);
        } catch (err) {
            toast.error("Failed to fetch provider details");
        } finally {
            setLoadingDetails(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    const { overall, providers } = stats || { overall: {}, providers: [] };

    return (
        <div className="p-6 lg:p-10 space-y-10 bg-slate-50 min-h-screen">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Earnings</h1>
                <p className="text-slate-500 mt-2 font-medium">Track your platform commission and provider business performance.</p>
            </div>

            {/* Business Volume Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                        <TrendingUp size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Business Volume</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Today</p>
                        <h2 className="text-3xl font-black text-slate-900 mt-1">₹{overall.todayAmount?.toLocaleString()}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-lg">
                            <span>Business</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Yesterday</p>
                        <h2 className="text-3xl font-black text-slate-900 mt-1">₹{overall.yesterdayAmount?.toLocaleString()}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-lg">
                            <span>Business</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Last 10 Days</p>
                        <h2 className="text-3xl font-black text-slate-900 mt-1">₹{overall.tenDaysAmount?.toLocaleString()}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-lg">
                            <span>Business</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Volume</p>
                        <h2 className="text-3xl font-black text-slate-900 mt-1">₹{overall.totalBusiness?.toLocaleString()}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-lg">
                            <span>Overall</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Commissions Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 text-teal-600 rounded-xl">
                        <IndianRupee size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Platform Commissions (10%)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-xl hover:shadow-teal-500/5 group">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Today</p>
                        <h2 className="text-3xl font-black text-teal-600 mt-1">₹{overall.todayCommission?.toLocaleString()}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 w-fit px-2 py-1 rounded-lg">
                            <span>Earnings</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-xl hover:shadow-teal-500/5 group">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Yesterday</p>
                        <h2 className="text-3xl font-black text-teal-600 mt-1">₹{overall.yesterdayCommission?.toLocaleString()}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 w-fit px-2 py-1 rounded-lg">
                            <span>Earnings</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-xl hover:shadow-teal-500/5 group">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Last 10 Days</p>
                        <h2 className="text-3xl font-black text-teal-600 mt-1">₹{overall.tenDaysCommission?.toLocaleString()}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 w-fit px-2 py-1 rounded-lg">
                            <span>Earnings</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-xl hover:shadow-teal-500/5 group">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Commission</p>
                        <h2 className="text-3xl font-black text-teal-600 mt-1">₹{overall.totalCommission?.toLocaleString()}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 w-fit px-2 py-1 rounded-lg">
                            <span>Overall</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Other Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-xl hover:shadow-amber-500/5 group flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Completed Jobs</p>
                        <h2 className="text-3xl font-black text-slate-900 mt-1">{overall.jobCount || 0}</h2>
                        <p className="text-xs font-bold text-amber-600 mt-1">Successful Deliveries</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
                        <Calendar size={32} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-xl hover:shadow-pink-500/5 group flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Providers</p>
                        <h2 className="text-3xl font-black text-slate-900 mt-1">{providers.length}</h2>
                        <p className="text-xs font-bold text-pink-600 mt-1">With performance data</p>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-2xl text-pink-600">
                        <Users size={32} />
                    </div>
                </div>
            </div>

            {/* Provider List */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-900">Per-Provider Summary</h2>
                    <div className="flex items-center gap-2 text-sm text-slate-400 font-bold">
                        < IndianRupee size={16} />
                        <span>Figures in INR</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Provider</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Jobs Done</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Total Business</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Comm. Owed (10%)</th>
                                <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {providers.map((p) => (
                                <tr key={p._id?._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-md transition-all">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900">{p._id?.name || "System User"}</p>
                                                <p className="text-xs text-slate-400 font-medium">{p._id?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 text-xs font-black rounded-full">
                                            {p.jobCount} Jobs
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-slate-700">₹{p.totalBusiness?.toLocaleString()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-black text-teal-600 text-lg">₹{p.totalCommission?.toLocaleString()}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => fetchProviderDetails(p)}
                                            className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-95"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {providers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                                <IndianRupee className="text-slate-200" size={40} />
                                            </div>
                                            <p className="text-slate-400 font-black">No completion data found yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Summary Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-3xl bg-teal-600 flex items-center justify-center text-white shadow-xl shadow-teal-500/20">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">{selectedProvider?._id?.name}</h2>
                                    <p className="text-slate-500 font-bold flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                                        Detailed Performance Breakdown
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-3 hover:bg-white hover:shadow-md rounded-2xl text-slate-400 hover:text-rose-500 transition-all active:scale-90"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8">
                            {loadingDetails ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-12 h-12 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin"></div>
                                    <p className="text-slate-500 font-bold animate-pulse">Compiling detailed report...</p>
                                </div>
                            ) : details.length === 0 ? (
                                <div className="text-center py-20">
                                    <History size={48} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold">No detailed history available.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        {details.map((job, idx) => (
                                            <div key={job._id} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group">
                                                <div className="flex flex-wrap items-start justify-between gap-6">
                                                    <div className="flex-1 min-w-[300px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                                                <BrainCircuit size={10} /> Service
                                                            </p>
                                                            <p className="font-black text-slate-900">{job.service_id?.serviceId?.name || "N/A"}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                                                <Layers size={10} /> Subservice
                                                            </p>
                                                            <p className="font-bold text-slate-700">{job.service_id?.subServiceId?.name || "N/A"}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                                                <Layers size={10} /> Level 1
                                                            </p>
                                                            <p className="font-bold text-slate-600 text-sm">{job.service_id?.subService1Id?.name || "N/A"}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest flex items-center gap-1">
                                                                <Layers size={10} /> Level 2
                                                            </p>
                                                            <p className="font-bold text-slate-600 text-sm">{job.service_id?.subService2Id?.name || "N/A"}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1">
                                                                <FileText size={10} /> Final Selection
                                                            </p>
                                                            <p className="font-black text-slate-900">{job.service_id?.subService3Name || "N/A"}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6 px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                                                            <p className="text-xl font-black text-slate-900">₹{job.amount}</p>
                                                        </div>
                                                        <div className="w-px h-8 bg-slate-100"></div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Comm (10%)</p>
                                                            <p className="text-xl font-black text-teal-600">₹{job.commissionAmount}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex gap-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Jobs</p>
                                    <p className="text-2xl font-black text-slate-900">{details.length}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Commission Owed</p>
                                    <p className="text-2xl font-black text-teal-600">₹{details.reduce((acc, curr) => acc + (curr.commissionAmount || 0), 0)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                            >
                                Close Summary
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCommissions;
