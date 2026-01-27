import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  X,
  Search,
  ChevronRight,
  Sparkles,
  Star,
  TrendingUp,
  Shield,
  Clock,
  Award
} from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../../components/Layout";
import { getServices } from "../../apiservice/service";
import { getSubServices } from "../../apiservice/subservice";
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
        <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-purple-50">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin h-16 w-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
              <div className="absolute inset-0 animate-ping h-16 w-16 border-4 border-teal-300 border-t-transparent rounded-full mx-auto opacity-20"></div>
            </div>
            <p className="mt-8 text-gray-700 font-bold text-lg">Discovering amazing services...</p>
            <p className="mt-2 text-gray-500 text-sm">Please wait a moment</p>
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

          {/* ================= HEADER SECTION ================= */}
          <div className="pb-8">
            {/* <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-10 transition-all font-semibold group hover:gap-3"
            >
              <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </div>
              Back to Home
            </button> */}

            <div className="text-center max-w-4xl mx-auto mb-16">
              <h4 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 animate-gradient">
                  Services
                </span>
              </h4>

              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium" style={{ marginTop: "-20px", marginBottom: "-20px" }}>
                Professional home services
              </p>

              {/* Trust Indicators */}

            </div>

            {/* ================= SEARCH BAR ================= */}
            <div className="max-w-3xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-3xl shadow-xl group-focus-within:shadow-2xl transition-all border-2 border-gray-100 group-focus-within:border-teal-500">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={24} />
                  <input
                    type="text"
                    placeholder="Search for plumbing, cleaning, painting, and more..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-6 py-6 text-lg border-0 rounded-3xl focus:outline-none bg-transparent font-medium placeholder:text-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Results Count */}
              {searchQuery && (
                <div className="mt-6 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-base text-gray-700 font-medium">
                    Found <span className="font-black text-teal-600 text-lg">{filteredServices.length}</span> service{filteredServices.length !== 1 ? 's' : ''} matching your search
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ================= SERVICES GRID ================= */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl shadow-lg border border-gray-100">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Search size={40} className="text-gray-400" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-3">No services found</h3>
              <p className="text-gray-500 mb-8 text-lg">Try searching with different keywords or browse all services</p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold rounded-2xl hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Clear Search & Browse All
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    {searchQuery ? 'Search Results' : 'All Services'}
                  </h2>
                  <p className="text-gray-600 font-medium">
                    <span className="font-black text-teal-600">{filteredServices.length}</span> service{filteredServices.length !== 1 ? 's' : ''} available
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-2.5 rounded-full shadow-sm border border-purple-200">
                    <TrendingUp size={16} />
                    Most Popular
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-2.5 rounded-full shadow-sm border border-amber-200">
                    <Star size={16} className="fill-amber-500" />
                    Top Rated
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredServices.map((service) => (
                  <div
                    key={service._id}
                    onClick={() => setSelectedService(service)}
                    className="group bg-white rounded-3xl shadow-md hover:shadow-2xl cursor-pointer transition-all duration-500 overflow-hidden border border-gray-100 hover:border-teal-300 hover:-translate-y-2 hover:scale-105"
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={serviceImg}
                        alt={service?.name || "Service"}
                        className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Floating badge */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-lg">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        <span className="text-sm font-black text-gray-900">4.8</span>
                      </div>

                      {/* Premium Badge */}
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        Premium
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-black text-xl text-gray-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
                        {service.description || "Professional service with verified experts at your doorstep"}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm font-bold text-teal-600 group-hover:text-teal-700">Explore Service</span>
                        <div className="p-2 bg-teal-50 rounded-full group-hover:bg-teal-600 transition-all">
                          <ChevronRight
                            size={18}
                            className="text-teal-600 group-hover:text-white group-hover:translate-x-1 transition-all"
                          />
                        </div>
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
          className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center px-4 animate-in fade-in duration-300"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-8 md:p-10 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 text-white">
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-5 right-5 p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all shadow-lg hover:shadow-xl hover:rotate-90 hover:scale-110 duration-300"
              >
                <X size={22} />
              </button>

              <div className="pr-16">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold mb-4 shadow-lg">
                  <Sparkles size={14} />
                  Service Categories
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-3">
                  {selectedService.name}
                </h2>
                <p className="text-teal-50 text-lg font-medium">
                  Choose from our specialized sub-services to get started
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 md:p-10 max-h-[60vh] overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
              {relatedSubServices.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">No sub-services available yet</h4>
                  <p className="text-gray-600 mb-8">Check back soon for specialized categories under this service.</p>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-teal-600 font-bold hover:text-teal-700 hover:underline text-lg"
                  >
                    Browse Other Services
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {relatedSubServices.map((sub) => (
                    <div
                      key={sub._id}
                      onClick={() => handleSubServiceClick(sub._id)}
                      className="group p-6 bg-white rounded-2xl hover:bg-gradient-to-br hover:from-teal-50 hover:to-emerald-50 cursor-pointer transition-all duration-300 border-2 border-gray-100 hover:border-teal-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <span className="text-2xl font-black text-white">
                            {sub.name.charAt(0)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-lg text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
                            {sub.name}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {sub.description || "Professional service available with expert technicians"}
                          </p>
                        </div>

                        <div className="p-2 bg-gray-100 rounded-full group-hover:bg-teal-600 transition-all flex-shrink-0 mt-1">
                          <ChevronRight
                            size={20}
                            className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


          </div>
        </div>
      )}
    </Layout>
  );
};

export default BrowseServices;
