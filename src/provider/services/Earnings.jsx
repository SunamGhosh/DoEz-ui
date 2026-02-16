import React, { useState, useEffect } from "react";
import {
  getProviderEarnings,
} from "../../apiservice/provider";
import { IndianRupee, BarChart, ClipboardList, Wallet, Calendar, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Earnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const earningsRes = await getProviderEarnings();
        setEarnings(earningsRes.data.data);
      } catch (err) {
        setError("Could not fetch earnings data");
      } finally {
        setLoading(false);
      }
    };
    fetchEarningsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading your earnings analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
        <p className="font-bold flex items-center mb-1">
          <span className="mr-2">⚠️</span> Error
        </p>
        <p>{error}</p>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-xl shadow-sm italic">
        No earnings data found. Please try refreshing or check back after completing a job.
      </div>
    );
  }

  const earningsStats = [
    {
      name: "Today Earning",
      value: earnings.todayEarnings || 0,
      icon: TrendingUp,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Earnings from jobs today"
    },
    {
      name: "Yesterday Earning",
      value: earnings.yesterdayEarnings || 0,
      icon: Calendar,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Earnings from yesterday"
    },
    {
      name: "Monthly Earning",
      value: earnings.monthlyEarnings || 0,
      icon: BarChart,
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      description: "Current month's total"
    },
    {
      name: "Total Earnings",
      value: earnings.totalEarnings || 0,
      icon: Wallet,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Lifetime business volume"
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-2xl rounded-2xl border border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-xl font-black text-indigo-600">₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl uppercase">Earnings Insights</h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl">
          Visualizing your business performance and financial trends over the past week.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {earningsStats.map((stat) => (
          <div
            key={stat.name}
            className="group relative bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute -top-2 -right-2 p-6 rounded-full opacity-10 ${stat.bgColor.replace('50', '200')}`}>
              <stat.icon className={`h-12 w-12 ${stat.iconColor}`} />
            </div>

            <div className="relative">
              <div className={`inline-flex p-3 rounded-2xl ${stat.bgColor} ${stat.iconColor} mb-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{stat.name}</p>
              <h2 className="text-3xl font-black text-gray-900 mt-2">₹{stat.value.toLocaleString()}</h2>
              <div className="flex items-center mt-3">
                <p className="text-xs text-gray-400 leading-relaxed font-medium">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Completed Jobs Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 -m-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
            <ClipboardList size={220} />
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-xl w-16 h-16 rounded-2xl flex items-center justify-center mb-10 border border-white/20">
              <ClipboardList className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold opacity-80">Jobs Accomplished</h3>
            <p className="text-8xl font-black mt-4 flex items-baseline tracking-tighter">
              {earnings.completedJobs || 0}
              <span className="text-xl font-bold ml-3 opacity-60 tracking-normal">TOTAL</span>
            </p>
          </div>

          <div className="mt-16 relative">
            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-sm font-medium leading-relaxed">
                Your performance is <span className="text-cyan-300 font-black">EXCEPTIONAL</span>. You've consistently maintained high delivery standards this month.
              </p>
            </div>
          </div>
        </div>

        {/* Growth Chart Visualization */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 flex items-center uppercase tracking-tight">
                <BarChart className="h-7 w-7 mr-3 text-indigo-600" />
                7-Day Performance
              </h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 italic">Real-time revenue trends</p>
            </div>
            <div className="hidden sm:flex space-x-2">
              <span className="px-4 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-xl border border-indigo-100 uppercase tracking-widest">LIVE ANALYTICS</span>
            </div>
          </div>

          <div className="flex-grow min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earnings.dailyEarnings}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#4f46e5"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 text-center">Avg / Job</p>
                <p className="text-xl font-black text-gray-900 tracking-tighter">₹{earnings.completedJobs > 0 ? (earnings.totalEarnings / earnings.completedJobs).toFixed(0) : 0}</p>
              </div>
              <div className="w-px h-10 bg-gray-100"></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 text-center">Peak Day</p>
                <p className="text-xl font-black text-indigo-600 tracking-tighter">
                  {Math.max(...(earnings.dailyEarnings?.map(d => d.amount) || [0])) > 0
                    ? earnings.dailyEarnings.reduce((prev, current) => (prev.amount > current.amount) ? prev : current).day
                    : "N/A"
                  }
                </p>
              </div>
            </div>
            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black tracking-widest flex items-center gap-2 hover:bg-black transition-colors cursor-pointer group">
              FULL REPORT
              <TrendingUp size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
