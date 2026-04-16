import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Star, Clock, MapPin, Award, X, CheckCircle2,
  ChevronRight, ArrowLeft, Shield, BadgeCheck, Zap,
} from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../components/Layout";
import { getSubService3ById } from "../apiservice/subservice_3";
import { getProvidersByService } from "../apiservice/provider";
import { createBooking } from "../apiservice/booking";
import BookingMap from "../components/BookingMap";
import Reveal from "../components/Reveal";

const BookService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [service, setService] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: "", time: "", address: "", notes: "", lat: null, long: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const serviceRes = await getSubService3ById(id);
        setService(serviceRes.data.data || serviceRes.data);
        try {
          const providerRes = await getProvidersByService(id);
          const list = providerRes.data.data || [];
          setProfessionals(list);
          if (list.length > 0) setSelectedProfessional(list[0]);
        } catch (err) {
          console.error("Failed to fetch providers:", err);
        }
      } catch (error) {
        console.error("Failed to fetch service:", error);
        toast.error("Failed to load service details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleProceedToBook = () => {
    if (!isAuthenticated) { toast.error("Please login to continue"); navigate("/login"); return; }
    if (!selectedProfessional && professionals.length > 0) setSelectedProfessional(professionals[0]);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.date || !bookingForm.time || !bookingForm.address.trim()) {
      toast.error("Please fill in all required fields"); return;
    }
    const provider = selectedProfessional || professionals[0];
    if (!provider) { toast.error("Please select a professional"); return; }
    try {
      setSubmitting(true);
      const res = await createBooking({
        provider_id: provider._id,
        service_id: id,
        address: bookingForm.address.trim(),
        amount: service.price,
        lat: bookingForm.lat,
        long: bookingForm.long,
        date: bookingForm.date,
        time: bookingForm.time,
        notes: bookingForm.notes,
      });
      if (res.data.success) {
        toast.success("Booking request sent!");
        setShowBookingModal(false);
        navigate("/my-bookings");
      } else {
        toast.error("Failed to create booking. Please try again.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout noPadding>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm font-medium">Loading service details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout noPadding>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <p className="text-gray-500 font-medium mb-4">Service not found</p>
            <button onClick={() => navigate("/services")} className="px-6 py-2.5 bg-[#1a1f36] text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">
              Back to Services
            </button>
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
          <div className="absolute top-1/2 right-0 w-[55%] h-[140%] -translate-y-1/2 bg-gradient-to-l from-blue-500/20 via-blue-400/10 to-transparent rounded-full blur-3xl" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 lg:pb-20">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors mb-6"
            >
              <ArrowLeft size={16} /> Back
            </button>

            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">
              <span>{service.serviceId?.name}</span>
              <ChevronRight size={11} className="text-white/30" />
              <span>{service.subServiceId?.name}</span>
              <ChevronRight size={11} className="text-white/30" />
              <span>{service.subService1Id?.name}</span>
              <ChevronRight size={11} className="text-white/30" />
              <span>{service.subService2Id?.name}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-4">
              {service.subService3Name || "Service"}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">5.0</span> (1 review)
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> 180 mins
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck size={14} className="text-emerald-400" /> Verified Professionals
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 50V25C360 0 1080 0 1440 25V50H0Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            MAIN CONTENT
        ═══════════════════════════════════════════ */}
        <section className="py-12 lg:py-16 bg-white">
          <Reveal>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT — details */}
                <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">

                  {/* Service description */}
                  <div className="bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 p-7">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">About this service</h2>
                    <p className="text-gray-500 leading-relaxed text-[15px]">
                      {service.description || "Professional service delivered by verified experts with a quality guarantee."}
                    </p>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-gray-100">
                      {[
                        { icon: <Shield className="w-4 h-4 text-blue-600" />, bg: "bg-blue-50", label: "Guaranteed" },
                        { icon: <Clock className="w-4 h-4 text-violet-600" />, bg: "bg-violet-50", label: "On-Time" },
                        { icon: <BadgeCheck className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-50", label: "Verified" },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 text-center">
                          <div className={`w-9 h-9 ${item.bg} rounded-xl flex items-center justify-center`}>{item.icon}</div>
                          <span className="text-xs font-semibold text-gray-600">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Professionals */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-7">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">Available Professionals</h2>
                    {professionals.length > 0 ? (
                      <div className="space-y-3">
                        {professionals.map((pro) => (
                          <div
                            key={pro._id}
                            onClick={() => setSelectedProfessional(pro)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                              selectedProfessional?._id === pro._id
                                ? "border-blue-200 bg-blue-50/40 shadow-md shadow-blue-500/5"
                                : "border-gray-100 hover:border-blue-100 hover:bg-gray-50"
                            }`}
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                              {pro.name?.charAt(0).toUpperCase() || "P"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-sm">{pro.name}</h3>
                              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400 font-medium">
                                <span className="flex items-center gap-1">
                                  <Star size={11} className="fill-amber-400 text-amber-400" /> 4.5
                                  <span className="text-gray-300">·</span> {pro.totalJobs || 0} jobs
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={11} /> {pro.workArea || "Remote"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Award size={11} /> {pro.experienceYears || 0}y exp
                                </span>
                              </div>
                            </div>
                            {selectedProfessional?._id === pro._id && (
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <CheckCircle2 size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl">
                        <p className="text-gray-400 text-sm font-medium">No professionals available for this service yet.</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* RIGHT — booking card */}
                <div className="lg:col-span-1 order-1 lg:order-2">
                  <div className="sticky top-28">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100 p-6">
                      <h3 className="text-lg font-extrabold text-gray-900 mb-6">Book This Service</h3>

                      <div className="space-y-3 mb-6">
                        {[
                          { label: "Service Price", value: `₹${service.price}` },
                          { label: "Duration", value: "180 mins" },
                          { label: "Provider", value: selectedProfessional?.name || "Select a Provider" },
                        ].map((row, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">{row.label}</span>
                            <span className="font-semibold text-gray-900">{row.value}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="text-2xl font-extrabold text-gray-900">₹{service.price}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleProceedToBook}
                        disabled={professionals.length === 0}
                        className={`w-full py-3.5 font-semibold rounded-full text-sm transition-all duration-300 ${
                          professionals.length === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#1a1f36] text-white hover:bg-blue-600 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
                        }`}
                      >
                        {professionals.length === 0 ? "No Professionals Available" : "Proceed to Book"}
                      </button>

                      {professionals.length > 0 && (
                        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                          <Shield size={12} className="text-emerald-500" />
                          100% service guarantee
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </Reveal>
        </section>

      </div>

      {/* ═══════════════════════════════════════════
          BOOKING MODAL
      ═══════════════════════════════════════════ */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1a1f36]/70 backdrop-blur-md">
          <div
            className="bg-white w-full sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col"
            style={{ maxWidth: "900px", maxHeight: "95vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Complete Your Booking</h2>
                <p className="text-xs text-gray-400 mt-0.5">Fill in the details and pin your location on the map</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="flex flex-col lg:flex-row">

                {/* Form */}
                <form onSubmit={handleBookingSubmit} className="shrink-0 p-6 space-y-4 lg:w-[360px] lg:border-r lg:border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Date", type: "date", key: "date" },
                      { label: "Time", type: "time", key: "time" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">{f.label}</label>
                        <input
                          type={f.type}
                          value={bookingForm[f.key]}
                          onChange={(e) => setBookingForm({ ...bookingForm, [f.key]: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-gray-800"
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Service Address</label>
                    <input
                      type="text"
                      value={bookingForm.address}
                      onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                      placeholder="Type address or pin on map →"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-800 placeholder:text-gray-400"
                      required
                    />
                    {bookingForm.lat && bookingForm.long && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-semibold text-emerald-600">
                          GPS: {Number(bookingForm.lat).toFixed(4)}, {Number(bookingForm.long).toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">
                      Notes <span className="text-gray-300 font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      placeholder="Any special instructions?"
                      rows={2}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all text-sm text-gray-800"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Service</span>
                      <span className="font-semibold text-gray-900">{service.subService3Name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Provider</span>
                      <span className="font-semibold text-gray-900">{selectedProfessional?.name || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-extrabold text-gray-900">₹{service.price}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#1a1f36] text-white font-semibold rounded-full hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg hover:shadow-blue-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Processing…" : "Confirm Booking"}
                  </button>
                </form>

                {/* Map */}
                <div className="flex-1 min-w-0 relative bg-gray-100" style={{ minHeight: "240px" }}>
                  <BookingMap
                    initialLat={bookingForm.lat || undefined}
                    initialLng={bookingForm.long || undefined}
                    onLocationSelect={({ lat, lng }) =>
                      setBookingForm((prev) => ({ ...prev, lat, long: lng }))
                    }
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BookService;
