import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Search,
  ChevronRight,
  Sparkles,
  Star,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../../components/Layout";
import { getServices } from "../../apiservice/service";
import { getSubServices } from "../../apiservice/subservice";

// You might want to replace this with a better placeholder logic or keep it if it works
import serviceImg from "../../assets/images/images.jpg";

const BrowseServices = () => {
  const navigate = useNavigate();

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

        setServices(servicesRes?.data?.data || []);
        setSubServices(subServicesRes?.data?.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================
     SEARCH FILTER
  ========================= */
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;

    return services.filter(
      (service) =>
        service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, services]);

  /* =========================
     SUB SERVICES FILTER
  ========================= */
  const relatedSubServices = useMemo(() => {
    if (!selectedService) return [];
    return subServices.filter(
      (sub) => sub?.serviceId?._id === selectedService._id
    );
  }, [selectedService, subServices]);

  const handleSubServiceClick = (subId) => {
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
            <p className="text-gray-500 text-sm font-medium">Loading services...</p>
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
                Found {filteredServices.length} result{filteredServices.length !== 1 && 's'}
              </p>
            )}
          </div>

          {/* ================= SERVICES GRID ================= */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            <>
              {!searchQuery && (
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Popular Categories</h2>
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
                      <img
                        src={serviceImg}
                        alt={service?.name}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <p className="text-xs font-medium bg-white/20 backdrop-blur-md px-2 py-1 rounded-md inline-block mb-1">
                          Service
                        </p>
                      </div>
                    </div>

                    <div className="px-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-teal-600 transition-colors">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-full">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          4.8
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10 leading-relaxed">
                        {service.description || "Professional service at your doorstep."}
                      </p>
                      <div className="flex items-center text-sm font-bold text-teal-600 group-hover:underline decoration-2 underline-offset-4">
                        Explore
                        <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= MODAL WITH SUB-SERVICES ================= */}
      {selectedService && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-12 min-h-[500px]">
              {/* Sidebar/Header */}
              <div className="md:col-span-5 bg-gray-50 p-8 md:p-10 flex flex-col justify-between border-r border-gray-100">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                    {selectedService.name}
                  </h2>
                  <p className="text-gray-500 text-lg leading-relaxed mb-8">
                    Select a category below to view specific services and pricing.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        <Sparkles size={18} className="text-teal-500" />
                      </div>
                      <span className="font-medium">Verified Professionals</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        <TrendingUp size={18} className="text-teal-500" />
                      </div>
                      <span className="font-medium">Transparent Pricing</span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block mt-8">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    Cancel & Close
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="md:col-span-7 p-6 md:p-10 bg-white overflow-y-auto max-h-[60vh] md:max-h-full">
                <div className="flex justify-between items-center mb-6 md:hidden">
                  <span className="text-sm font-bold text-gray-400">Categories</span>
                  <button onClick={() => setSelectedService(null)}>
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>

                {relatedSubServices.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10">
                    <p className="text-gray-400 font-medium mb-4">No categories available currently.</p>
                    <button
                      onClick={() => setSelectedService(null)}
                      className="px-6 py-2 bg-gray-100 rounded-full font-bold text-gray-600 hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {relatedSubServices.map((sub) => (
                      <div
                        key={sub._id}
                        onClick={() => handleSubServiceClick(sub._id)}
                        className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-teal-500 hover:bg-teal-50/30 cursor-pointer transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg group-hover:bg-teal-500 group-hover:text-white transition-colors">
                            {sub.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                              {sub.name}
                            </h4>
                            <p className="text-xs text-gray-500">View services</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-teal-500 transition-colors" />
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
