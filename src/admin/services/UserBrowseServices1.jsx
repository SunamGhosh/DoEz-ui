import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Check, Star, Clock, Shield,
  X, Sparkles, ArrowRight, Package, BadgeCheck, TrendingUp, Zap,
} from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../../components/Layout";
import { getAllSubService1 } from "../../apiservice/subservice_1";
import { getAllSubService2 } from "../../apiservice/subservice_2";
import { getAllSubService3 } from "../../apiservice/subservice_3";
import Reveal from "../../components/Reveal";

const BrowseSubService1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subId } = useParams();

  const [sub1, setSub1] = useState([]);
  const [sub2, setSub2] = useState([]);
  const [sub3, setSub3] = useState([]);
  const [selectedSub1, setSelectedSub1] = useState(null);
  const [selectedSub2, setSelectedSub2] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const filtered = allSub1.filter((item) => item.subServiceId?._id === subId);
        const preselectedSub1Id = location.state?.autoSelectSub1Id;
        const preselectedSub2Id = location.state?.autoSelectSub2Id;

        const initialSub1 =
          filtered.find((item) => item._id === preselectedSub1Id) ||
          filtered[0] ||
          null;

        setSub1(filtered);
        setSub2(allSub2);
        setSub3(allSub3);
        setSelectedSub1(initialSub1);

        if (preselectedSub2Id) {
          const preselectedSub2 = allSub2.find((item) => item._id === preselectedSub2Id) || null;
          setSelectedSub2(preselectedSub2);
        } else {
          setSelectedSub2(null);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [subId, location.state]);

  const filteredSub2 = selectedSub1
    ? sub2.filter((item) => item.subService1Id?._id === selectedSub1._id)
    : [];

  const filteredSub3 = selectedSub2
    ? sub3.filter((item) => item.subService2Id?._id === selectedSub2._id)
    : [];

  const getSub2ForSub1 = (sub1Id) => sub2.filter((item) => item.subService1Id?._id === sub1Id);

  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleBook = (id) => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }
    navigate(`/bookservice/${id}`);
  };

  const navigateToServiceRoot = () => {
    if (!selectedSub1?.serviceId?._id) return;
    navigate("/services", {
      state: { autoSelectId: selectedSub1.serviceId._id },
    });
  };

  const navigateToSubServiceRoot = () => {
    if (!selectedSub1?.subServiceId?._id) return;
    navigate(`/sub-ser1/${selectedSub1.subServiceId._id}`);
  };

  const navigateToSub1Node = () => {
    if (!selectedSub1?.subServiceId?._id || !selectedSub1?._id) return;
    navigate(`/sub-ser1/${selectedSub1.subServiceId._id}`, {
      state: { autoSelectSub1Id: selectedSub1._id },
    });
  };

  const navigateToSub2Node = () => {
    if (!selectedSub1?.subServiceId?._id || !selectedSub1?._id || !selectedSub2?._id) return;
    navigate(`/sub-ser1/${selectedSub1.subServiceId._id}`, {
      state: {
        autoSelectSub1Id: selectedSub1._id,
        autoSelectSub2Id: selectedSub2._id,
      },
    });
  };

  if (loading) {
    return (
      <Layout noPadding>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm font-medium">Loading details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout noPadding>
      <div className="min-h-screen bg-white antialiased">

        {/* ═══════════════════════════════════════════
            HERO — compact, matches site theme
        ═══════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f36] via-[#1e2a4a] to-[#2563eb]" />
          <div className="absolute top-1/2 right-0 w-[55%] h-[140%] -translate-y-1/2 bg-gradient-to-l from-blue-500/20 via-blue-400/10 to-transparent rounded-full blur-3xl" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-20 lg:pt-24 pb-6 sm:pb-8 lg:pb-10">
            {/* Breadcrumb + back */}
            <button
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Back to Services
            </button>

            {selectedSub1 && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">
                <button type="button" onClick={navigateToServiceRoot} className="hover:text-white transition-colors">
                  {selectedSub1.serviceId?.name}
                </button>
                <ChevronRight size={12} className="text-white/30" />
                <button type="button" onClick={navigateToSubServiceRoot} className="hover:text-white transition-colors">
                  {selectedSub1.subServiceId?.name}
                </button>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-3">
              {selectedSub1?.name || "Select a Category"}
            </h1>
            <p className="text-white/50 text-[15px]">
              Choose a service below to explore available packages.
            </p>
          </div>

          {/* Curved bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 36V18C360 0 1080 0 1440 18V36H0Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            MAIN CONTENT
        ═══════════════════════════════════════════ */}
        <section className="py-8 lg:py-10 bg-white">
          <Reveal>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Mobile category scroll (visible only on < lg) */}
              {sub1.length > 0 && (
                <div className="lg:hidden mb-4 -mx-4 px-4 overflow-x-auto">
                  <div className="flex gap-2 pb-2 w-max">
                    {sub1.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => { setSelectedSub1(item); setSelectedSub2(null); }}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                          selectedSub1?._id === item._id
                            ? "bg-[#1a1f36] text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile nested sub-categories */}
              {selectedSub1 && (
                <div className="lg:hidden mb-6 border border-gray-100 rounded-2xl p-3 bg-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
                    {selectedSub1.name} Sub-Categories
                  </p>
                  {filteredSub2.length === 0 ? (
                    <p className="text-sm text-gray-400 px-1">No sub-categories found.</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredSub2.map((item) => (
                        <button
                          key={item._id}
                          onClick={() => setSelectedSub2(item)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all duration-200 ${
                            selectedSub2?._id === item._id
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span className="text-sm font-semibold">{item.name}</span>
                          <ChevronRight size={14} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">

                {/* LEFT — category sidebar (desktop only) */}
                <div className="hidden lg:block lg:col-span-3">
                  <div className="sticky top-28">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 px-1">
                      Hierarchy
                    </p>
                    <div className="space-y-2">
                      {sub1.map((item) => {
                        const isActive = selectedSub1?._id === item._id;
                        const nestedSub2 = getSub2ForSub1(item._id);

                        return (
                          <div key={item._id} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                            <button
                              onClick={() => { setSelectedSub1(item); setSelectedSub2(null); }}
                              className={`w-full text-left px-4 py-3 flex items-center justify-between transition-all duration-200 ${
                                isActive
                                  ? "bg-[#1a1f36] text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <span className="font-semibold text-sm">{item.name}</span>
                              <ChevronRight size={15} className={`${isActive ? "rotate-90" : ""} transition-transform`} />
                            </button>

                            {isActive && (
                              <div className="px-3 py-2 bg-white border-t border-gray-100">
                                {nestedSub2.length === 0 ? (
                                  <p className="text-xs text-gray-400 px-1 py-2">No sub-categories yet.</p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {nestedSub2.map((node) => (
                                      <button
                                        key={node._id}
                                        onClick={() => setSelectedSub2(node)}
                                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                          selectedSub2?._id === node._id
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                      >
                                        <span className="text-gray-300">└</span>
                                        <span className="text-sm font-medium truncate">{node.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {sub1.length === 0 && (
                        <p className="text-sm text-gray-400 px-1">No categories found.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT — service cards */}
                <div className="col-span-1 lg:col-span-9">
                  {selectedSub1 && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Current Path</p>
                      <div className="flex items-center flex-wrap gap-1.5 text-sm font-semibold text-gray-700">
                        <button type="button" onClick={navigateToServiceRoot} className="hover:text-blue-700 transition-colors">
                          {selectedSub1.serviceId?.name}
                        </button>
                        <ChevronRight size={13} className="text-gray-300" />
                        <button type="button" onClick={navigateToSubServiceRoot} className="hover:text-blue-700 transition-colors">
                          {selectedSub1.subServiceId?.name}
                        </button>
                        <ChevronRight size={13} className="text-gray-300" />
                        <button type="button" onClick={navigateToSub1Node} className="text-[#1a1f36] hover:text-blue-700 transition-colors">
                          {selectedSub1.name}
                        </button>
                        {selectedSub2 && (
                          <>
                            <ChevronRight size={13} className="text-gray-300" />
                            <button type="button" onClick={navigateToSub2Node} className="text-blue-700 hover:text-blue-800 transition-colors">
                              {selectedSub2.name}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {filteredSub2.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-gray-200 rounded-2xl">
                      <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="text-gray-300 w-7 h-7" />
                      </div>
                      <p className="text-gray-400 font-medium text-sm">No services found in this category.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredSub2.map((item) => (
                        <div
                          key={item._id}
                          className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 p-6 lg:p-7"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1.5">
                                {item.name}
                              </h3>
                              <p className="text-gray-500 text-sm leading-relaxed">
                                {item.description || "Top-rated professional service with quality guarantee."}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Star size={13} className="fill-amber-400 text-amber-400" /> 4.8 (2k+)
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={13} /> 45–60 mins
                                </span>
                                <span className="flex items-center gap-1">
                                  <BadgeCheck size={13} className="text-emerald-500" /> Verified Pro
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedSub2(item)}
                              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1a1f36] text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-blue-500/30 hover:-translate-y-0.5"
                            >
                              View Packages
                              <ArrowRight size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </Reveal>
        </section>

      </div>

      {/* ═══════════════════════════════════════════
          PACKAGES MODAL
      ═══════════════════════════════════════════ */}
      {selectedSub2 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedSub2(null)}
        >
          <div className="absolute inset-0 bg-[#1a1f36]/70 backdrop-blur-md animate-fadeIn" />

          <div
            className="relative bg-white w-full max-w-5xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row animate-scaleIn max-h-[86vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT — dark context panel (hidden on mobile) */}
            <div className="hidden md:flex md:w-[35%] bg-gradient-to-br from-[#1a1f36] to-[#1e2a4a] p-6 md:p-7 text-white flex-col relative overflow-hidden shrink-0">
              <div className="absolute -top-20 -left-20 w-56 h-56 bg-blue-500/15 rounded-full blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-cyan-500/10 rounded-full blur-[80px]" />

              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-4 bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/10">
                  <button type="button" onClick={navigateToSub1Node} className="hover:text-white transition-colors">
                    {selectedSub1?.name}
                  </button>
                  <ChevronRight size={10} className="opacity-50" />
                  <button type="button" onClick={navigateToSub2Node} className="opacity-70 hover:opacity-100 transition-opacity">
                    {selectedSub2.name}
                  </button>
                </div>

                <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center mb-5 border border-white/10">
                  <Zap className="text-blue-400 w-6 h-6" />
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight leading-tight">
                  {selectedSub2.name}
                </h2>
                <span className="block h-1 w-10 bg-blue-500 rounded-full mb-4" />

                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  {selectedSub2.description || "Browse curated packages designed for efficiency and quality results."}
                </p>

                <div className="space-y-3">
                  {[
                    { icon: Shield, text: "Service Guarantee", color: "text-emerald-400" },
                    { icon: Clock, text: "On-Time Arrival", color: "text-blue-400" },
                    { icon: BadgeCheck, text: "Verified Professional", color: "text-violet-400" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                        <item.icon size={15} className={item.color} />
                      </div>
                      <span className="text-sm font-medium text-white/60">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedSub2(null)}
                className="relative z-10 mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors"
              >
                <X size={14} />
                Close
              </button>
            </div>

            {/* RIGHT — packages grid */}
            <div className="w-full md:flex-1 bg-white p-4 sm:p-5 md:p-7 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  {/* Mobile-only context */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-1 md:hidden">
                    <button type="button" onClick={navigateToSub1Node} className="hover:text-blue-800 transition-colors">
                      {selectedSub1?.name}
                    </button>
                    <ChevronRight size={10} />
                    <button type="button" onClick={navigateToSub2Node} className="hover:text-blue-800 transition-colors">
                      {selectedSub2.name}
                    </button>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Available Packages</p>
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">Choose a Package</h3>
                </div>
                <button
                  onClick={() => setSelectedSub2(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {filteredSub3.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Package className="text-gray-300 w-7 h-7" />
                    </div>
                    <p className="text-gray-400 font-medium text-sm">No packages listed for this service yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredSub3.map((opt, idx) => (
                      <div
                        key={opt._id}
                        onClick={() => handleBook(opt._id)}
                        className="group relative flex flex-col p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition-colors leading-tight pr-3">
                            {opt.subService3Name}
                          </h4>
                          <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-600 flex items-center justify-center transition-colors shrink-0">
                            <ArrowRight size={15} className="text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-2xl font-extrabold text-gray-900">₹{opt.price}</span>
                            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">/ service</span>
                          </div>
                          <div className="space-y-2">
                            {["Verified Professional", "Service Warranty"].map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <Check size={9} strokeWidth={3} className="text-emerald-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-500">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
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
