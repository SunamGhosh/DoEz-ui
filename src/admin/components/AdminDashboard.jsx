import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAdminStats, getAllUsers, getAllBookings, getAllReviews } from "../../apiservice/admin";
import {
  Users,
  Wrench,
  CalendarCheck,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

const AdminDashboard = () => {
  const { user: admin } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    providers: 0,
    bookings: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    reviews: 0,
    commission: 0
  });

  const fetchData = async () => {
    try {
      const [resUsers, resBookings, resReviews, resComm] = await Promise.all([
        getAllUsers(),
        getAllBookings(),
        getAllReviews(),
        getAdminStats()
      ]);

      const allUsers = resUsers.data?.data || [];
      const allBookings = resBookings.data?.data || [];

      setStats({
        users: allUsers.filter(u => u.role === 'customer').length,
        providers: allUsers.filter(u => u.role === 'provider').length,
        bookings: allBookings.length,
        ongoing: allBookings.filter(b => b.status === 'Ongoing' || b.status === 'Confirmed').length,
        completed: allBookings.filter(b => b.status === 'Completed').length,
        cancelled: allBookings.filter(b => b.status === 'Cancelled').length,
        reviews: resReviews.data?.data?.length || 0,
        commission: resComm.data?.data?.overall?.totalCommission || 0
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <ShieldCheck className="w-64 h-64 -mr-20 -mt-20" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
              Welcome back, <span className="text-teal-400 capitalize">{admin?.name || "Administrator"}</span>!
            </h1>
            <p className="text-slate-400 font-medium text-lg">Here's what's happening on your platform today.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm shadow-xl">
            <div className="p-3 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Commission</div>
              <div className="text-xl font-black text-white">₹{stats.commission.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.users}
          icon={<Users className="w-6 h-6" />}
          color="teal"
        />
        <StatCard
          title="Active Providers"
          value={stats.providers}
          icon={<Wrench className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Bookings"
          value={stats.bookings}
          icon={<CalendarCheck className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Reviews Received"
          value={stats.reviews}
          icon={<Star className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Secondary Bookings Breakdown */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Bookings Overview</h3>
          <button className="text-teal-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            Full Report <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-teal-500/30 transition-all">
            <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{stats.ongoing}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ongoing/Live</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-teal-500/30 transition-all">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{stats.completed}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completed Jobs</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-teal-500/30 transition-all">
            <div className="p-4 bg-red-100 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{stats.cancelled}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cancelled Bookings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    teal: "text-teal-600 bg-teal-50 shadow-teal-500/10",
    blue: "text-blue-600 bg-blue-50 shadow-blue-500/10",
    purple: "text-purple-600 bg-purple-50 shadow-purple-500/10",
    amber: "text-amber-600 bg-amber-50 shadow-amber-500/10",
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className={`w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-black text-gray-900 mb-1">{value.toLocaleString()}</div>
        <div className="text-sm font-bold text-gray-400 uppercase tracking-tight">{title}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
