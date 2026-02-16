import React, { useState, useEffect } from "react";
import {
  getProviderEarnings,
  getProviderProfile,
  toggleAvailability,
} from "../../apiservice/provider";
import {
  IndianRupee,
  CheckCircle,
  Wifi,
  WifiOff,
  TrendingUp,
  Calendar,
  Zap,
  ChevronRight,
  ShieldCheck,
  Award
} from "lucide-react";
import KycModal from "./KycModal";
import ServiceSelectionModal from "./ServiceSelectionModal";
import { Link } from "react-router-dom";

const ProviderDashboard = () => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [earningsRes, profileRes] = await Promise.all([
        getProviderEarnings(),
        getProviderProfile(),
      ]);
      setStats(earningsRes.data.data);
      const profileData = profileRes.data.data;
      setProfile(profileData);

      if (!profileData.aadharNumber) {
        setIsKycModalOpen(true);
      }
      else if (!profileData.providerServices || profileData.providerServices.length === 0) {
        setIsServiceModalOpen(true);
      }
    } catch (err) {
      setError("Could not fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleKycComplete = () => {
    setIsKycModalOpen(false);
    fetchData();
  };

  const handleToggleAvailability = async () => {
    const currentStatus = profile.availability || profile.status;
    const newStatus = currentStatus === "online" ? "offline" : "online";
    try {
      const res = await toggleAvailability(newStatus);
      setProfile(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Could not update availability. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-700 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="h-5 w-5" />
          <p className="font-black uppercase tracking-tight">System Notice</p>
        </div>
        <p className="font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
          Retry Connection
        </button>
      </div>
    );
  }

  const currentStatus = profile?.availability || profile?.status || "offline";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Welcome Back, {profile?.name || "Provider"}!
            <Award className="text-amber-500 h-8 w-8" />
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Your service performance and earnings are looking great today.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className={`p-4 rounded-xl ${currentStatus === 'online' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
            {currentStatus === 'online' ? <Wifi size={24} /> : <WifiOff size={24} />}
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Status</p>
            <p className={`text-sm font-black uppercase ${currentStatus === 'online' ? 'text-green-600' : 'text-slate-500'}`}>{currentStatus}</p>
          </div>
          <button
            onClick={handleToggleAvailability}
            className={`px-6 py-3 rounded-xl font-black text-xs tracking-widest transition-all active:scale-95 shadow-lg ${currentStatus === 'online'
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
              }`}
          >
            GO {currentStatus === 'online' ? 'OFFLINE' : 'ONLINE'}
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Today Stat */}
        <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Today's Earnings</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">₹{(stats?.todayEarnings || 0).toLocaleString()}</h2>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Live Tracking
          </div>
        </div>

        {/* Yesterday Stat */}
        <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Calendar size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Yesterday</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">₹{(stats?.yesterdayEarnings || 0).toLocaleString()}</h2>
          <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Volume</p>
        </div>

        {/* Monthly Stat */}
        <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <IndianRupee size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Total</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">₹{(stats?.monthlyEarnings || 0).toLocaleString()}</h2>
          <Link to="/provider/earnings" className="mt-4 flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
            View Details <ChevronRight size={12} />
          </Link>
        </div>

        {/* Jobs Stat */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-7 rounded-[2rem] shadow-2xl shadow-slate-200 text-white group relative overflow-hidden">
          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Work Done</p>
            <h2 className="text-5xl font-black tracking-tighter">{stats?.completedJobs || 0}</h2>
            <p className="mt-4 text-[10px] font-bold opacity-60 uppercase tracking-widest">Completed Jobs</p>
          </div>
          <CheckCircle size={140} className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Summary Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 flex items-start gap-8">
          <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <ShieldCheck size={48} />
          </div>
          <div className="flex-grow">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 italic">Verified Partner</p>
            <h3 className="text-2xl font-black text-slate-900 mb-4">Partner Profile Status</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">KYC Status</p>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${profile?.kycStatus === 'approved' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  {profile?.kycStatus || 'Pending'}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Experience</p>
                <p className="text-lg font-black text-slate-700">{profile?.experienceYears || 0} Years</p>
              </div>
            </div>
            <div className="mt-8">
              <Link to="/provider/profile" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                EDIT FULL PROFILE
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Trust & Safety Panel */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10 max-w-[60%]">
            <h3 className="text-3xl font-black tracking-tight mb-3 italic">Safety First</h3>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-6">Always maintain professional standards and follow local safety guidelines at work sites.</p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-400"></div>
                ))}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">200+ Active Providers Online</p>
            </div>
          </div>
          <Zap size={200} className="absolute -right-16 -bottom-16 text-white opacity-10 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center">
              <p className="text-[10px] font-black uppercase mb-1">Performance</p>
              <p className="text-4xl font-black">98%</p>
            </div>
          </div>
        </div>
      </div>

      <KycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        onComplete={handleKycComplete}
      />

      <ServiceSelectionModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onComplete={fetchData}
      />
    </div>
  );
};

export default ProviderDashboard;
