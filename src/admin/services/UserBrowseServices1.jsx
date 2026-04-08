import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Check, Star, Zap, Clock, Shield, X, Sparkles, ArrowRight, Package } from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../../components/Layout";
import { getAllSubService1 } from "../../apiservice/subservice_1";
import { getAllSubService2 } from "../../apiservice/subservice_2";
import { getAllSubService3 } from "../../apiservice/subservice_3";

const BrowseSubService1 = () => {
  const navigate = useNavigate();
  const { subId } = useParams();

  const [sub1, setSub1] = useState([]);
  const [sub2, setSub2] = useState([]);
  const [sub3, setSub3] = useState([]);

  const [selectedSub1, setSelectedSub1] = useState(null);
  const [selectedSub2, setSelectedSub2] = useState(null);

  const [loading, setLoading] = useState(true);

  /* ================= FETCH ALL DATA ONCE ================= */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s1, s2, s3] = await Promise.all([
          getAllSubService1(),
          getAllSubService2(),
          getAllSubService3(),
        ]);

        const allSub1 = s1?.data?.data || [];
        const allSub2 = s2?.data?.data || [];
        const allSub3 = s3?.data?.data || [];

        const filteredSub1 = allSub1.filter(
          (item) => item.subServiceId?._id === subId
        );

        setSub1(filteredSub1);
        setSub2(allSub2);
        setSub3(allSub3);

        // Auto-select first category
        if (filteredSub1.length > 0) {
          setSelectedSub1(filteredSub1[0]);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [subId]);

  /* ================= FILTER LOGIC ================= */
  const filteredSub2 = selectedSub1
    ? sub2.filter((item) => item.subService1Id?._id === selectedSub1._id)
    : [];

  const filteredSub3 = selectedSub2
    ? sub3.filter((item) => item.subService2Id?._id === selectedSub2._id)
    : [];


  /* ================= BOOK HANDLER ================= */
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleBook = (id) => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }
    navigate(`/bookservice/${id}`);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-2 border-gray-900 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm font-medium">Loading details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">

        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <button
              onClick={() => navigate("/services")}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Services
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* LEFT PANEL — SubService1 (Category List) */}
            <div className="lg:col-span-3">
              <div className="sticky top-24 space-y-2">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Categories</h2>

                {sub1.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setSelectedSub1(item);
                      setSelectedSub2(null);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between cursor-pointer transition-all duration-200 group ${selectedSub1?._id === item._id
                      ? "bg-gray-900 text-white shadow-md"
                      : "hover:bg-gray-100 text-gray-600"
                      }`}
                  >
                    <span className="font-bold text-sm">{item.name}</span>
                    {selectedSub1?._id === item._id && (
                      <ChevronRight size={16} />
                    )}
                  </div>
                ))}

                {sub1.length === 0 && (
                  <p className="text-sm text-gray-400 italic px-2">No categories found.</p>
                )}
              </div>
            </div>

            {/* RIGHT PANEL — SubService2 & SubService3 (Main Content) */}
            <div className="lg:col-span-9">
              <div className="mb-10">
                {selectedSub1 && (
                  <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-teal-600 uppercase tracking-wider mb-2 bg-teal-50/50 w-fit px-3 py-1 rounded-full border border-teal-100/50">
                    <span>{selectedSub1.serviceId?.name}</span>
                    <ChevronRight size={12} className="text-teal-300" />
                    <span>{selectedSub1.subServiceId?.name}</span>
                  </div>
                )}
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  {selectedSub1?.name || "Select a Category"}
                </h1>
                <p className="text-gray-500 font-medium">
                  Select a specific service to view packages
                </p>
              </div>

              {filteredSub2.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
                  <p className="text-gray-400 font-medium">No services found in this category.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredSub2.map((item) => (
                    <div
                      key={item._id}
                      className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                            {item.description || "Top-rated professional service with quality guarantee."}
                          </p>

                          <div className="flex items-center gap-4 mt-4 text-xs font-bold text-gray-400">
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-amber-400 fill-amber-400" /> 4.8 (2k+)
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} /> 45-60 mins
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedSub2(item)}
                          className="w-full md:w-auto px-6 py-3 bg-gray-50 text-gray-900 font-bold rounded-xl border border-gray-200 group-hover:bg-gray-900 group-hover:text-white group-hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          View Packages
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= PREMIUM MODAL WITH PACKAGES ================= */}
      {selectedSub2 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedSub2(null)}
        >
          {/* Backdrop with advanced blur */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" />

          {/* Modal Container */}
          <div
            className="relative bg-white w-full max-w-5xl rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col md:flex-row animate-scaleIn h-[90vh] md:h-auto md:max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT PANEL: Context Dashboard */}
            <div className="md:w-[35%] bg-slate-900 p-8 md:p-12 text-white flex flex-col relative overflow-hidden shrink-0">
              {/* Decorative Glow */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black text-teal-400 uppercase tracking-[0.2em] mb-4 bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/5">
                   <span>Explorer</span>
                   <ChevronRight size={12} className="opacity-50" />
                   <span className="opacity-70">{selectedSub1?.name}</span>
                </div>

                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10 shadow-inner">
                  <Zap className="text-teal-400 w-8 h-8" />
                </div>

                <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight leading-tight">
                  {selectedSub2.name}
                  <span className="block h-1.5 w-12 bg-teal-500 rounded-full mt-4" />
                </h2>

                <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                   {selectedSub2.description || "Browse through our curated packages designed for efficiency and high-quality results."}
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Shield, text: "Service Guarantee", color: "text-emerald-400" },
                    { icon: Clock, text: "On-time Arrival", color: "text-blue-400" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/20 transition-all shadow-sm">
                        <item.icon size={18} className={item.color} />
                      </div>
                      <span className="text-sm font-bold text-slate-300 tracking-wide">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

               {/* Close desktop */}
               <button
                onClick={() => setSelectedSub2(null)}
                className="relative z-10 mt-auto pt-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all flex items-center gap-3 group w-fit px-6 py-3 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/5"
              >
                <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Dismiss Explorer</span>
              </button>
            </div>

            {/* RIGHT PANEL: Options Grid */}
            <div className="flex-1 bg-white p-6 md:p-10 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Packages</span>
                  <h3 className="text-2xl font-bold text-slate-900">Choose an Option</h3>
                </div>
                <button
                  onClick={() => setSelectedSub2(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 md:hidden"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {filteredSub3.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Package className="text-slate-300 w-8 h-8" />
                    </div>
                    <p className="text-slate-400 font-bold">No packages currently listed for this service.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredSub3.map((opt, idx) => (
                      <div
                        key={opt._id}
                        className="group relative flex flex-col p-6 rounded-[24px] border border-slate-100 hover:border-teal-500/30 hover:bg-teal-50/20 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/[0.02]"
                        style={{ animationDelay: `${idx * 50}ms` }}
                        onClick={() => handleBook(opt._id)}
                      >
                         <div className="flex justify-between items-start mb-6">
                            <h4 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors leading-tight pr-4">
                              {opt.subService3Name}
                            </h4>
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-teal-500 group-hover:text-white transition-all shadow-sm">
                               <ArrowRight size={18} />
                            </div>
                         </div>
                        
                        <div className="mt-auto">
                          <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-3xl font-black text-slate-900">₹{opt.price}</span>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Per Service</span>
                          </div>

                          <div className="space-y-3">
                            {["Verified Professional", "Service Warranty"].map((feat, fIdx) => (
                               <div key={fIdx} className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                     <Check size={10} strokeWidth={3} />
                                  </div>
                                  <span className="text-[13px] font-medium text-slate-500 group-hover:text-slate-700">{feat}</span>
                               </div>
                            ))}
                          </div>
                        </div>

                        {/* Hover Overlay Background Decoration */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BrowseSubService1;
