import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Check, Star, Zap, Clock, Shield, X, Sparkles, ArrowRight } from "lucide-react";
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

      {/* ================= MODAL WITH PACKAGES ================= */}
      {selectedSub2 && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setSelectedSub2(null)}
        >
          <div
            className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in align-middle zoom-in-95 duration-300 transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-start bg-white sticky top-0 z-10">
                <div>
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Packages</p>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                    {selectedSub2.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedSub2(null)}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 md:p-8 overflow-y-auto bg-gray-50/50 flex-1">
                {filteredSub3.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-400 font-bold">No packages available for this service yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSub3.map((opt) => (
                      <div
                        key={opt._id}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-teal-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative group"
                      >
                        {/* Highlight Badge if needed (mock logic) */}
                        {/* <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                           Best Value
                         </div> */}

                        <h3 className="text-lg font-black text-gray-900 mb-2">{opt.subService3Name}</h3>

                        <div className="mb-6">
                          <span className="text-3xl font-black text-gray-900">₹{opt.price}</span>
                          <span className="text-gray-400 text-sm font-medium"> / service</span>
                        </div>

                        <div className="space-y-3 mb-8 flex-1">
                          <div className="flex items-start gap-3 text-sm text-gray-600">
                            <Check size={16} className="text-teal-500 mt-0.5 shrink-0" />
                            <span>Premium equipment usage</span>
                          </div>
                          <div className="flex items-start gap-3 text-sm text-gray-600">
                            <Check size={16} className="text-teal-500 mt-0.5 shrink-0" />
                            <span>Verified & Trained Professional</span>
                          </div>
                          {/* Add more mocked features if not available in data */}
                        </div>

                        <button
                          onClick={() => handleBook(opt._id)}
                          className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-teal-600 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          Select Package
                        </button>
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
