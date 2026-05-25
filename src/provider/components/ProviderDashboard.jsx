import React, { useState, useEffect } from "react";
import { getProviderEarnings, getProviderProfile, toggleAvailability } from "../../apiservice/provider";
import {
  IndianRupee, CheckCircle, Wifi, WifiOff, TrendingUp,
  Calendar, ChevronRight, ShieldCheck, Loader2, Zap, MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import KycModal from "./KycModal";
import ServiceSelectionModal from "./ServiceSelectionModal";
import { Link } from "react-router-dom";

const ProviderDashboard = () => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [earningsRes, profileRes] = await Promise.all([getProviderEarnings(), getProviderProfile()]);
      setStats(earningsRes.data.data);
      const p = profileRes.data.data;
      setProfile(p);
      if (!p.aadharNumber) setIsKycModalOpen(true);
      else if (!p.providerServices?.length) setIsServiceModalOpen(true);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async () => {
    const cur = profile?.availability || profile?.status || "offline";
    const newStatus = cur === "online" ? "offline" : "online";

    // Going online → MUST get GPS first
    if (newStatus === "online") {
      if (!navigator.geolocation) {
        toast.error("Your browser does not support location services. Please use a modern browser.");
        return;
      }

      setLocationLoading(true);

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        });

        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const res = await toggleAvailability("online", coords);
        setProfile(res.data.data);
        toast.success("You are now online! Your location has been saved.");
      } catch (err) {
        // GPS denied or failed
        if (err.code === 1) {
          toast.error("Location permission denied. You must allow location access to go online.", { duration: 5000 });
        } else if (err.code === 2) {
          toast.error("Unable to determine your location. Please check your GPS settings.", { duration: 5000 });
        } else if (err.code === 3) {
          toast.error("Location request timed out. Please try again.", { duration: 4000 });
        } else {
          // API error from backend
          const msg = err?.response?.data?.error || err?.reason || "Failed to go online. Please try again.";
          toast.error(msg, { duration: 4000 });
        }
      } finally {
        setLocationLoading(false);
      }
    } else {
      // Going offline → no GPS needed
      try {
        const res = await toggleAvailability("offline");
        setProfile(res.data.data);
        toast.success("You are now offline.");
      } catch {
        toast.error("Failed to go offline. Please try again.");
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  const isOnline = (profile?.availability || profile?.status) === "online";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#1a1f36] rounded-2xl p-5 sm:p-7 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Provider Dashboard</p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-blue-400">{profile?.name || "Provider"}</span>
            </h1>
            <p className="text-white/40 text-sm mt-1">Your performance and earnings overview.</p>
          </div>
          {/* Availability toggle */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-xl self-start sm:self-auto">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOnline ? "bg-emerald-500/20 text-emerald-400" : locationLoading ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/40"}`}>
              {locationLoading ? <Loader2 size={16} className="animate-spin" /> : isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            </div>
            <div className="mr-2">
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Status</p>
              <p className={`text-xs font-extrabold uppercase ${locationLoading ? "text-blue-400" : isOnline ? "text-emerald-400" : "text-white/50"}`}>
                {locationLoading ? "Detecting GPS…" : isOnline ? "Online" : "Offline"}
              </p>
            </div>
            <button
              onClick={handleToggle}
              disabled={locationLoading}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                locationLoading
                  ? "bg-blue-500 text-white cursor-wait opacity-80"
                  : isOnline
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              {locationLoading ? (
                <><Loader2 size={12} className="animate-spin" /> Locating…</>
              ) : (
                <>
                  {!isOnline && <MapPin size={12} />}
                  Go {isOnline ? "Offline" : "Online"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Earnings", value: `₹${(stats?.todayEarnings || 0).toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, bg: "bg-blue-50", text: "text-blue-600", sub: <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />Live</span> },
          { label: "Yesterday", value: `₹${(stats?.yesterdayEarnings || 0).toLocaleString()}`, icon: <Calendar className="w-5 h-5" />, bg: "bg-violet-50", text: "text-violet-600", sub: <span className="text-[10px] text-gray-400 font-semibold">Business volume</span> },
          { label: "Monthly Total", value: `₹${(stats?.monthlyEarnings || 0).toLocaleString()}`, icon: <IndianRupee className="w-5 h-5" />, bg: "bg-emerald-50", text: "text-emerald-600", sub: <Link to="/provider/earnings" className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 hover:underline">View details <ChevronRight size={10} /></Link> },
          { label: "Completed Jobs", value: stats?.completedJobs || 0, icon: <CheckCircle className="w-5 h-5" />, bg: "bg-[#1a1f36]", text: "text-white", dark: true, sub: <span className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">Total jobs done</span> },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border p-5 hover:shadow-md transition-all ${s.dark ? "bg-[#1a1f36] border-white/10" : "bg-white border-gray-100"}`}>
            <div className={`w-10 h-10 ${s.bg} ${s.text} rounded-xl flex items-center justify-center mb-4`}>
              {s.icon}
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${s.dark ? "text-white/40" : "text-gray-400"}`}>{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.dark ? "text-white" : "text-gray-900"}`}>{s.value}</p>
            <div className="mt-2">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Profile status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-start gap-5">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <ShieldCheck size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Verified Partner</p>
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">Partner Profile Status</h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">KYC Status</p>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${profile?.kycStatus === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {profile?.kycStatus || "Pending"}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Experience</p>
                <p className="text-base font-extrabold text-gray-900">{profile?.experienceYears || 0} Years</p>
              </div>
            </div>
            <Link to="/provider/profile" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1f36] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md">
              Edit Profile <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Safety card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Zap size={160} />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <h3 className="text-xl font-extrabold mb-2">Safety First</h3>
              <p className="text-blue-100 text-sm leading-relaxed max-w-xs">Always maintain professional standards and follow local safety guidelines at work sites.</p>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-4">200+ Active Providers Online</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Performance</p>
              <p className="text-3xl font-extrabold">98%</p>
            </div>
          </div>
        </div>
      </div>

      <KycModal isOpen={isKycModalOpen} onClose={() => setIsKycModalOpen(false)} onComplete={() => { setIsKycModalOpen(false); fetchData(); }} />
      <ServiceSelectionModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onComplete={fetchData} />
    </div>
  );
};

export default ProviderDashboard;
