import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Search,
  ChevronRight,
  Sparkles,
  Star,
  Shield,
  Package,
  Droplets,
  Zap,
  Wrench,
  Paintbrush,
  Hammer,
  Flower2,
  Tv,
  BadgeCheck,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../../components/Layout";
import { getServices } from "../../apiservice/service";
import { getSubServices } from "../../apiservice/subservice";
import { getImageUrl } from "../../utils/imageUtils";
import Reveal from "../../components/Reveal";

const serviceIcons = {
  CLEANING: <Sparkles className="w-6 h-6" />,
  PLUMBING: <Droplets className="w-6 h-6" />,
  ELECTRICAL: <Zap className="w-6 h-6" />,
  MECHANICAL: <Wrench className="w-6 h-6" />,
  PAINTING: <Paintbrush className="w-6 h-6" />,
  CARPENTRY: <Hammer className="w-6 h-6" />,
  GARDENARING: <Flower2 className="w-6 h-6" />,
  APPLIANCE: <Tv className="w-6 h-6" />,
};

const BrowseServices = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesRes = await getServices();
        const subServicesRes = await getSubServices();
        const servicesData = servicesRes?.data?.data || [];
        setServices(servicesData);
        setSubServices(subServicesRes?.data?.data || []);
        if (location.state?.autoSelectId) {
          const match = servicesData.find((s) => s._id === location.state.autoSelectId);
          if (match) setSelectedService(match);
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

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    return services.filter(
      (s) =>
        s?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, services]);

  const relatedSubServices = useMemo(() => {
    if (!selectedService) return [];
    return subServices.filter((sub) => sub?.serviceId?._id === selectedService._id);
  }, [selectedService, subServices]);

  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleSubServiceClick = (subId) => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }
    setSelectedService(null);
    navigate(`/sub-ser1/${subId}`);
  };

  if (loading) {
    return (
      <Layout noPadding>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm font-medium">Loading services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout noPadding>
      <div className="min-h-screen bg-white antialiased">

        {/* ═══════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f36] via-[#1e2a4a] to-[#2563eb]" />
          <div className="absolute top-1/2 right-0 w-[60%] h-[130%] -translate-y-1/2 bg-gradient-to-l from-blue-500/20 via-blue-400/10 to-transparent rounded-full blur-3xl" />

          {/* Floating decorative icons */}
          <div className="absolute inset-0 z-0 hidden lg:block">
            {[
              { Icon: Wrench, top: "20%", left: "6%", size: "w-12 h-12" },
              { Icon: Zap, top: "55%", left: "12%", size: "w-10 h-10" },
              { Icon: Sparkles, top: "15%", right: "18%", size: "w-11 h-11" },
              { Icon: Shield, top: "60%", right: "8%", size: "w-10 h-10" },
            ].map(({ Icon, size, ...pos }, i) => (
              <div
                key={i}
                className={`absolute ${size} bg-white/8 backdrop-blur-sm rounded-full flex items-center justify-center`}
                style={{ ...pos, animation: `float ${3.5 + i * 0.5}s ease-in-out infinite ${i * 0.4}s` }}
              >
                <Icon className="w-1/2 h-1/2 text-white/40" />
              </div>
            ))}
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-44 pb-16 sm:pb-24 lg:pb-32 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-sm font-medium text-white/80 mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              All Services
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto">
              Find the perfect{" "}
              <span className="relative inline-block">
                service
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M4 8 C50 3, 150 3, 196 8" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </span>{" "}
              for your home
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto mb-10">
              Verified professionals for every corner of your home — from electrical and plumbing to deep cleaning and beyond.
            </p>

            {/* Search bar inside hero */}
            <div className="max-w-xl mx-auto">
              <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-3 focus-within:bg-white/15 focus-within:border-white/30 transition-all duration-300">
                <Search className="text-white/50 shrink-0" size={20} />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 bg-transparent border-none outline-none text-white placeholder:text-white/40 text-[15px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-3 text-white/50 text-sm text-center">
                  {filteredServices.length} result{filteredServices.length !== 1 && "s"} found
                </p>
              )}
            </div>
          </div>

          {/* Curved bottom edge */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 60V30C360 0 1080 0 1440 30V60H0Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            TRUST BADGES
        ═══════════════════════════════════════════ */}
        <section className="py-10 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-16">
              {[
                { icon: <BadgeCheck className="w-5 h-5 text-blue-600" />, label: "Verified Professionals" },
                { icon: <Shield className="w-5 h-5 text-emerald-600" />, label: "100% Service Guarantee" },
                { icon: <Clock className="w-5 h-5 text-violet-600" />, label: "Same-Day Availability" },
                { icon: <Star className="w-5 h-5 text-amber-500" />, label: "4.9 Avg Rating" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-gray-600 text-sm font-medium">
                  {item.icon}
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SERVICES GRID
        ═══════════════════════════════════════════ */}
        <section className="py-20 lg:py-28 bg-white">
          <Reveal>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              {filteredServices.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No services found</h3>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                      {searchQuery ? "Search Results" : "Popular Categories"}
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                      Click any category to explore available sub-services and book instantly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {filteredServices.map((service) => (
                      <div
                        key={service._id}
                        onClick={() => setSelectedService(service)}
                        className="group bg-white rounded-2xl cursor-pointer border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                      >
                        {/* Image / Icon area */}
                        <div className="aspect-[4/3] relative bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                          {service.image ? (
                            <img
                              src={getImageUrl(service.image)}
                              alt={service.name}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-200 rounded-2xl flex items-center justify-center transition-colors duration-300">
                                <div className="text-blue-600">
                                  {serviceIcons[service.name] || <Sparkles className="w-6 h-6" />}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                              {service.name}
                            </h3>
                            <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-full shrink-0 ml-2">
                              <Star size={11} className="fill-amber-400 text-amber-400" />
                              4.8
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                            {service.description || "Professional service at your doorstep."}
                          </p>
                          <div className="flex items-center text-sm font-semibold text-blue-600">
                            Explore
                            <ArrowRight size={15} className="ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </section>

        {/* ═══════════════════════════════════════════
            DARK SECTION — why choose us
        ═══════════════════════════════════════════ */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f36] via-[#1e2a4a] to-[#0f172a]" />
          <div className="absolute top-0 right-[-10%] w-[50%] h-full bg-blue-600/10 rounded-full blur-[120px]" />
          <Reveal>
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white/60 uppercase tracking-wider mb-6">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Why EzFix
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 max-w-3xl mx-auto">
                Every booking backed by our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  service guarantee
                </span>
              </h2>
              <p className="text-white/50 text-[15px] leading-relaxed mb-14 max-w-2xl mx-auto">
                We don't just connect you with professionals — we stand behind every job with verified quality and transparent pricing.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: <BadgeCheck className="w-6 h-6 text-blue-400" />,
                    bg: "bg-blue-500/10",
                    title: "Verified Experts",
                    desc: "Every professional is background-checked, ID-verified, and skill-assessed before joining.",
                  },
                  {
                    icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
                    bg: "bg-emerald-500/10",
                    title: "Transparent Pricing",
                    desc: "See the full price before you book. No hidden charges, no surprises at the door.",
                  },
                  {
                    icon: <Clock className="w-6 h-6 text-violet-400" />,
                    bg: "bg-violet-500/10",
                    title: "On-Time Arrival",
                    desc: "Real-time tracking and punctual professionals — your time is respected, always.",
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 hover:border-white/20 transition-all duration-300">
                    <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-5`}>
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

      </div>

      {/* ═══════════════════════════════════════════
          SUB-SERVICES MODAL
      ═══════════════════════════════════════════ */}
      {selectedService && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedService(null)}
        >
          <div className="absolute inset-0 bg-[#1a1f36]/70 backdrop-blur-md animate-fadeIn" />

          <div
            className="relative bg-white w-full max-w-4xl rounded-[28px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row animate-scaleIn max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT — dark panel (hidden on mobile) */}
            <div className="hidden md:flex md:w-[40%] bg-gradient-to-br from-[#1a1f36] to-[#1e2a4a] p-8 md:p-10 text-white flex-col relative overflow-hidden">
              <div className="absolute -top-20 -left-20 w-56 h-56 bg-blue-500/15 rounded-full blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-cyan-500/10 rounded-full blur-[80px]" />

              <div className="relative z-10 flex-1">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-7 border border-white/10">
                  <div className="text-blue-400">
                    {serviceIcons[selectedService.name] || <Sparkles className="w-6 h-6" />}
                  </div>
                </div>

                <h2 className="text-3xl font-extrabold mb-2 tracking-tight leading-tight">
                  {selectedService.name}
                </h2>
                <span className="block h-1 w-10 bg-blue-500 rounded-full mb-6" />

                <p className="text-white/50 text-[15px] leading-relaxed mb-10">
                  {selectedService.description || "Discover professional categories tailored to your home care needs."}
                </p>

                <div className="space-y-4">
                  {[
                    { icon: Shield, text: "Verified Experts", color: "text-emerald-400" },
                    { icon: TrendingUp, text: "Transparent Pricing", color: "text-blue-400" },
                    { icon: Clock, text: "On-Time Arrival", color: "text-violet-400" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                        <item.icon size={16} className={item.color} />
                      </div>
                      <span className="text-sm font-medium text-white/70">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedService(null)}
                className="relative z-10 mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors"
              >
                <X size={14} />
                Close
              </button>
            </div>

            {/* RIGHT — sub-services */}
            <div className="w-full md:w-[60%] bg-white p-5 sm:p-6 md:p-10 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between mb-5 sm:mb-7">
                <div>
                  {/* Mobile-only service name */}
                  <div className="flex items-center gap-2 mb-1 md:hidden">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {serviceIcons[selectedService.name] || <Sparkles className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-bold text-gray-700">{selectedService.name}</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Select a category</p>
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">What do you need?</h3>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {relatedSubServices.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Package className="text-gray-300 w-7 h-7" />
                    </div>
                    <p className="text-gray-400 font-medium text-sm">No categories available yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {relatedSubServices.map((sub, idx) => (
                      <div
                        key={sub._id}
                        onClick={() => handleSubServiceClick(sub._id)}
                        className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-blue-500/5"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 font-extrabold text-lg group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-105 shrink-0">
                            {sub.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-[15px] group-hover:text-blue-700 transition-colors">
                              {sub.name}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5 group-hover:text-blue-500 transition-colors">
                              View available options
                            </p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors shrink-0">
                          <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
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
