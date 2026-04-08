import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Search,
  ChevronRight,
  Sparkles,
  Star,
  TrendingUp,
  ArrowRight,
  Shield,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../../components/Layout";
import { getServices } from "../../apiservice/service";
import { getSubServices } from "../../apiservice/subservice";
import { getImageUrl } from "../../utils/imageUtils";

// You might want to replace this with a better placeholder logic or keep it if it works
// import serviceImg from "../../assets/images/images.jpg";

const BrowseServices = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesRes = await getServices();
        const subServicesRes = await getSubServices();

        const servicesData = servicesRes?.data?.data || [];
        setServices(servicesData);
        setSubServices(subServicesRes?.data?.data || []);

        // HANDLE AUTO-SELECT FROM HOMEPAGE
        if (location.state?.autoSelectId) {
          const serviceToSelect = servicesData.find(
            (s) => s._id === location.state.autoSelectId,
          );
          if (serviceToSelect) {
            setSelectedService(serviceToSelect);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state]);

  /* =========================
     SEARCH FILTER
  ========================= */
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;

    return services.filter(
      (service) =>
        service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service?.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, services]);

  /* =========================
     SUB SERVICES FILTER
  ========================= */
  const relatedSubServices = useMemo(() => {
    if (!selectedService) return [];
    return subServices.filter(
      (sub) => sub?.serviceId?._id === selectedService._id,
    );
  }, [selectedService, subServices]);

  /* =========================
     AUTH CHECK
  ========================= */
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleSubServiceClick = (subId) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    setSelectedService(null);
    navigate(`/sub-ser1/${subId}`);
  };

  /* =========================
     LOADING STATE
  ========================= */
  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-2 border-gray-900 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm font-medium">
              Loading services...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* ================= HEADER SECTION ================= */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              Find the perfect service
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              Discover trusted professionals for all your home needs.
            </p>
          </div>

          {/* ================= SEARCH BAR ================= */}
          <div className="max-w-2xl mx-auto mb-20 relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gray-200 rounded-full blur-xl opacity-0 group-focus-within:opacity-50 transition-opacity duration-500"></div>
              <div className="relative flex items-center bg-white rounded-full shadow-sm border border-gray-200 group-focus-within:border-gray-300 group-focus-within:shadow-md transition-all">
                <Search className="ml-6 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-4 md:py-5 text-lg bg-transparent border-none focus:ring-0 placeholder:text-gray-400 text-gray-900"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mr-2 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
                <button className="hidden sm:block mr-2 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
                  Search
                </button>
              </div>
            </div>

            {searchQuery && (
              <p className="mt-4 text-center text-gray-500 text-sm">
                Found {filteredServices.length} result
                {filteredServices.length !== 1 && "s"}
              </p>
            )}
          </div>

          {/* ================= SERVICES GRID ================= */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No services found
              </h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            <>
              {!searchQuery && (
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Popular Categories
                  </h2>
                  <div className="flex gap-2">
                    {/* Optional filters could go here */}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service) => (
                  <div
                    key={service._id}
                    onClick={() => setSelectedService(service)}
                    className="group bg-white rounded-2xl p-4 cursor-pointer border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4 relative">
                      {/* You can replace this img with a dynamic one if available or use icons */}
                      {service.image ? (
                        <img
                          src={getImageUrl(service.image)}
                          alt={service.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <Sparkles size={48} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                      <div className="absolute bottom-3 left-3 text-white"></div>
                    </div>

                    <div className="px-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-teal-600 transition-colors">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-full">
                          <Star
                            size={12}
                            className="fill-amber-400 text-amber-400"
                          />
                          4.8
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10 leading-relaxed">
                        {service.description ||
                          "Professional service at your doorstep."}
                      </p>
                      <div className="flex items-center text-sm font-bold text-teal-600 group-hover:underline decoration-2 underline-offset-4">
                        Explore
                        <ArrowRight
                          size={16}
                          className="ml-1 group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= PREMIUM MODAL WITH SUB-SERVICES ================= */}
      {selectedService && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedService(null)}
        >
          {/* Backdrop with advanced blur */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" />

          {/* Modal Container */}
          <div
            className="relative bg-white w-full max-w-4xl rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col md:flex-row animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT PANEL: Service Context */}
            <div className="md:w-[42%] bg-slate-900 p-8 md:p-12 text-white flex flex-col relative overflow-hidden">
              {/* Decorative Glow */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

              <div className="relative z-10 flex-1">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                  <Sparkles className="text-teal-400 w-7 h-7" />
                </div>

                <h2 className="text-4xl font-black mb-6 tracking-tight leading-tight">
                  {selectedService.name}
                  <span className="block h-1.5 w-12 bg-teal-500 rounded-full mt-4" />
                </h2>

                <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                  {selectedService.description || "Discover professional categories tailored to your maintenance and home care needs."}
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Shield, text: "Verified Experts", color: "text-emerald-400" },
                    { icon: TrendingUp, text: "Transparent Pricing", color: "text-blue-400" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/20 transition-all">
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
                onClick={() => setSelectedService(null)}
                className="relative z-10 mt-auto pt-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all flex items-center gap-3 group w-fit px-6 py-3 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/5"
              >
                <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Dismiss Explorer</span>
              </button>
            </div>

            {/* RIGHT PANEL: Sub-services List */}
            <div className="md:w-[58%] bg-white p-6 md:p-10 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Navigation</span>
                  <h3 className="text-xl font-bold text-slate-900">Select Category</h3>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 md:hidden"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {relatedSubServices.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Package className="text-slate-300 w-8 h-8" />
                    </div>
                    <p className="text-slate-400 font-bold">No categories found in this section.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {relatedSubServices.map((sub, idx) => (
                      <div
                        key={sub._id}
                        onClick={() => handleSubServiceClick(sub._id)}
                        className="group relative flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-teal-500/30 hover:bg-teal-50/20 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/[0.02]"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xl group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                              {sub.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors leading-tight">
                              {sub.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-bold text-slate-400 group-hover:text-teal-600 transition-colors">
                                View Available Options
                              </span>
                              <ChevronRight size={10} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </div>

                        <div className="p-2 rounded-full opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 bg-teal-100/50">
                          <ChevronRight size={18} className="text-teal-600" />
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

export default BrowseServices;
