import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Check, Star, Tag, Zap, Clock, Shield, X, Sparkles } from "lucide-react";
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

        // Auto-select first category (Urban Company UX)
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
  const handleBook = (id) => {
    navigate(`/bookservice/${id}`);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-purple-50">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin h-16 w-16 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
              <div className="absolute inset-0 animate-ping h-16 w-16 border-4 border-teal-300 border-t-transparent rounded-full mx-auto opacity-20"></div>
            </div>
            <p className="mt-6 text-gray-700 font-bold text-lg">Loading services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 pb-20 relative">
          {/* Header Navigation */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-6 transition-all font-semibold group hover:gap-3"
          >
            <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            Back to Home
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

            {/* LEFT PANEL — SubService1 (Category List) */}
            <div className="col-span-12 md:col-span-3">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                <div className="p-6 bg-gradient-to-br from-teal-500 to-emerald-600">
                  <h3 className="font-black text-white text-xl">Categories</h3>
                  <p className="text-teal-50 text-sm mt-1">Choose a service</p>
                </div>

                <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
                  {sub1.length === 0 && (
                    <p className="p-6 text-sm text-gray-500 text-center">No categories found</p>
                  )}

                  {sub1.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => {
                        setSelectedSub1(item);
                        setSelectedSub2(null);
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 group ${selectedSub1?._id === item._id
                        ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold shadow-lg scale-105"
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${selectedSub1?._id === item._id
                          ? "bg-white/20 text-white"
                          : "bg-teal-100 text-teal-600"
                          }`}>
                          {item.name.charAt(0)}
                        </div>
                        <span className="font-semibold">{item.name}</span>
                      </div>
                      {selectedSub1?._id === item._id && (
                        <ChevronRight size={20} className="animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL — SubService2 & SubService3 (Main Content) */}
            <div className="col-span-12 md:col-span-9">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12 min-h-[700px]">
                {/* Header */}
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
                    <Zap size={16} />
                    Available Services
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
                    {selectedSub1?.name || "Services"}
                  </h2>
                  <p className="text-gray-600 text-lg font-medium">Select specific services and view our premium packages</p>
                </div>

                {filteredSub2.length === 0 && (
                  <div className="text-center py-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Tag size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No services available</h3>
                    <p className="text-gray-500 text-lg">Please select a different category or check back later.</p>
                  </div>
                )}

                <div className="space-y-8">
                  {filteredSub2.map((item) => (
                    <div key={item._id} className="group p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                              <Star size={20} className="text-teal-600 fill-teal-600" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-gray-900 group-hover:text-teal-600 transition-colors">{item.name}</h3>
                          </div>
                          <p className="text-gray-600 max-w-2xl leading-relaxed font-medium">
                            {item.description || "Professional service delivered by expert technicians at your doorstep."}
                          </p>
                        </div>

                        <button
                          onClick={() => setSelectedSub2(item)}
                          className="px-8 py-3 rounded-2xl font-bold transition-all shadow-md hover:shadow-xl flex-shrink-0 bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 hover:scale-105"
                        >
                          View Packages
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL WITH PACKAGES ================= */}
      {selectedSub2 && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center px-4 animate-in fade-in duration-300"
          onClick={() => setSelectedSub2(null)}
        >
          <div
            className="bg-white max-w-6xl w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-gray-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-8 md:p-10 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 text-white sticky top-0 z-10">
              <button
                onClick={() => setSelectedSub2(null)}
                className="absolute top-5 right-5 p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all shadow-lg hover:shadow-xl hover:rotate-90 hover:scale-110 duration-300"
              >
                <X size={22} />
              </button>

              <div className="pr-16">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold mb-4 shadow-lg">
                  <Sparkles size={14} />
                  Premium Packages
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-3">
                  {selectedSub2.name}
                </h2>
                <p className="text-teal-50 text-lg font-medium">
                  {selectedSub2.description || "Choose from our specialized packages designed for your needs"}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 md:p-10 bg-gradient-to-b from-gray-50 to-white">
              {filteredSub3.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Tag size={32} className="text-gray-400" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">No packages available yet</h4>
                  <p className="text-gray-600 mb-8">Check back soon for specialized packages under this service.</p>
                  <button
                    onClick={() => setSelectedSub2(null)}
                    className="text-teal-600 font-bold hover:text-teal-700 hover:underline text-lg"
                  >
                    Browse Other Services
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-10 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></div>
                    <div>
                      <h4 className="font-black text-2xl text-gray-900">Available Packages</h4>
                      <p className="text-gray-600 text-sm font-medium mt-1">Choose the perfect plan for your needs</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSub3.map((opt, index) => (
                      <div
                        key={opt._id}
                        className="group bg-white p-6 rounded-2xl border-2 border-gray-200 hover:border-teal-400 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-2"
                      >
                        <div>
                          {/* Package Header */}
                          <div className="flex justify-between items-start mb-5">
                            <div className="flex-1">
                              <h5 className="font-black text-xl text-gray-900 group-hover:text-teal-600 transition-colors">
                                {opt.subService3Name}
                              </h5>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="mb-6">
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                                ₹{opt.price}
                              </span>
                              <span className="text-gray-500 text-sm font-semibold">per service</span>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="p-1 bg-teal-100 rounded-full">
                                <Check size={14} className="text-teal-600" />
                              </div>
                              <span className="font-semibold">Professional Service</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="p-1 bg-purple-100 rounded-full">
                                <Shield size={14} className="text-purple-600" />
                              </div>
                              <span className="font-semibold">Verified Experts</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="p-1 bg-amber-100 rounded-full">
                                <Clock size={14} className="text-amber-600" />
                              </div>
                              <span className="font-semibold">Same Day Service</span>
                            </div>
                          </div>
                        </div>

                        {/* Book Button */}
                        <button
                          onClick={() => handleBook(opt._id)}
                          className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold py-4 rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group-hover:scale-105"
                        >
                          Book Now
                          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            {filteredSub3.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-gray-50 to-teal-50 border-t border-gray-200 sticky bottom-0">
                <p className="text-center text-sm text-gray-700 font-medium">
                  💡 Select a package to proceed with booking your service
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BrowseSubService1;
