import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAdminStats, getAllUsers, getAllBookings, getAllReviews } from "../../apiservice/admin";
import {
  Users, Wrench, CalendarCheck, Star, TrendingUp,
  Clock, CheckCircle2, XCircle, Loader2, IndianRupee,
} from "lucide-react";

const AdminDashboard = () => {
  const { user: admin } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0, providers: 0, bookings: 0,
    ongoing: 0, completed: 0, cancelled: 0,
    reviews: 0, commission: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resUsers, resBookings, resReviews, resComm] = await Promise.all([
          getAllUsers(), getAllBookings(), getAllReviews(), getAdminStats(),
        ]);
        const allUsers = resUsers.data?.data || [];
        const allBookings = resBookings.data?.data || [];
        setStats({
          users: allUsers.filter(u => u.role === "customer").length,
          providers: allUsers.filter(u => u.role === "provider").length,
          bookings: allBookings.length,
          ongoing: allBookings.filter(b => ["Ongoing", "Confirmed"].includes(b.status)).length,
          completed: allBookings.filter(b => b.status === "Completed").length,
          cancelled: allBookings.filter(b => b.status === "Cancelled").length,
          reviews: resReviews.data?.data?.length || 0,
          commission: resComm.data?.data?.overall?.totalCommission || 0,
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#1a1f36] rounded-2xl p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Admin Dashboard</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, <span className="text-blue-400 capitalize">{admin?.name || "Administrator"}</span>
            </h1>
            <p className="text-white/40 text-sm mt-1">Here's your platform overview.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Total Commission</p>
              <p className="text-lg font-extrabold text-white">₹{stats.commission.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Customers",    value: stats.users,     icon: <Users className="w-5 h-5" />,        bg: "bg-blue-50",   text: "text-blue-600" },
          { label: "Providers",    value: stats.providers, icon: <Wrench className="w-5 h-5" />,       bg: "bg-violet-50", text: "text-violet-600" },
          { label: "Bookings",     value: stats.bookings,  icon: <CalendarCheck className="w-5 h-5" />, bg: "bg-emerald-50",text: "text-emerald-600" },
          { label: "Reviews",      value: stats.reviews,   icon: <Star className="w-5 h-5" />,          bg: "bg-amber-50",  text: "text-amber-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${s.bg} ${s.text} rounded-xl flex items-center justify-center mb-4`}>
              {s.icon}
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{s.value.toLocaleString()}</div>
            <div className="text-xs font-semibold text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bookings breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-5">Bookings Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Ongoing",   value: stats.ongoing,   icon: <Clock className="w-5 h-5" />,        bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-400" },
            { label: "Completed", value: stats.completed, icon: <CheckCircle2 className="w-5 h-5" />, bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
            { label: "Cancelled", value: stats.cancelled, icon: <XCircle className="w-5 h-5" />,      bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-400" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className={`w-10 h-10 ${s.bg} ${s.text} rounded-xl flex items-center justify-center shrink-0`}>
                {s.icon}
              </div>
              <div>
                <div className="text-xl font-extrabold text-gray-900">{s.value}</div>
                <div className="text-xs font-semibold text-gray-400">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
