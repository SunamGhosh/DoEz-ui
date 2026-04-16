import React, { useState, useEffect } from "react";
import { getProviderEarnings } from "../../apiservice/provider";
import { IndianRupee, BarChart2, ClipboardList, Wallet, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Earnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProviderEarnings()
      .then((res) => setEarnings(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading earnings...</p>
      </div>
    </div>
  );

  if (!earnings) return (
    <div className="py-16 text-center text-gray-400 text-sm">No earnings data yet.</div>
  );

  const stats = [
    { label: "Today", value: earnings.todayEarnings || 0, icon: <TrendingUp className="w-5 h-5" />, bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Yesterday", value: earnings.yesterdayEarnings || 0, icon: <Calendar className="w-5 h-5" />, bg: "bg-violet-50", text: "text-violet-600" },
    { label: "This Month", value: earnings.monthlyEarnings || 0, icon: <BarChart2 className="w-5 h-5" />, bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Total Earnings", value: earnings.totalEarnings || 0, icon: <Wallet className="w-5 h-5" />, bg: "bg-amber-50", text: "text-amber-600" },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-extrabold text-blue-600">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  };

  const peakDay = earnings.dailyEarnings?.length
    ? earnings.dailyEarnings.reduce((p, c) => p.amount > c.amount ? p : c).day
    : "N/A";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#1a1f36] rounded-2xl p-5 sm:p-7 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Provider</p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">Earnings Overview</h1>
          <p className="text-white/40 text-sm mt-1">Your financial performance and trends.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${s.bg} ${s.text} rounded-xl flex items-center justify-center mb-4`}>{s.icon}</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-2xl font-extrabold text-gray-900">₹{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Chart + Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Jobs card */}
        <div className="bg-[#1a1f36] rounded-2xl p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-5"><ClipboardList size={160} /></div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-5">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Jobs Completed</p>
            <p className="text-5xl font-extrabold text-white">{earnings.completedJobs || 0}</p>
            <p className="text-white/30 text-xs font-semibold mt-2 uppercase tracking-widest">Total</p>
          </div>
          <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 relative z-10">
            <p className="text-xs text-white/60 leading-relaxed">
              Avg per job: <span className="text-blue-400 font-bold">
                ₹{earnings.completedJobs > 0 ? Math.round(earnings.totalEarnings / earnings.completedJobs).toLocaleString() : 0}
              </span>
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">7-Day Performance</h3>
              <p className="text-xs text-gray-400 mt-0.5">Daily revenue trend</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Peak Day</p>
                <p className="font-extrabold text-blue-600">{peakDay}</p>
              </div>
            </div>
          </div>
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earnings.dailyEarnings || []}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 600 }} dy={8} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fill="url(#blueGrad)" animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
