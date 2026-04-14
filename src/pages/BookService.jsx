import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Star,
  Clock,
  MapPin,
  Award,
  X,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../components/Layout";
import { getSubService3ById } from "../apiservice/subservice_3";
import {
  getProviderReviews,
  getProvidersByService,
} from "../apiservice/provider";
import { createBooking } from "../apiservice/booking";
import { verifyPayment } from "../apiservice/payment";
import AddressSearch from "../components/AddressSearch";
import BookingMap from "../components/BookingMap";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const BookService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: "",
    time: "",
    address: "",
    notes: "",
    lat: null,
    long: null,
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch service details
        const serviceRes = await getSubService3ById(id);
        const serviceData = serviceRes.data.data || serviceRes.data;
        setService(serviceData);

        // Fetch providers for this service
        try {
          const providerRes = await getProvidersByService(id);
          const providerList = providerRes.data.data || [];
          setProfessionals(providerList);
          if (providerList.length > 0) {
            setSelectedProfessional(providerList[0]);
          }
        } catch (err) {
          console.error("Failed to fetch providers:", err);
          toast.error("Failed to load available professionals");
        }

        // Fetch reviews for the first provider if available
        // ... (skipping mock reviews part unless needed)
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
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    // Auto-select first professional if none selected
    if (!selectedProfessional && professionals.length > 0) {
      setSelectedProfessional(professionals[0]);
    }

    // Show booking modal
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!bookingForm.date || !bookingForm.time || !bookingForm.address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Defensive fallback: If state didn't update but we have professionals, use the first one
    const providerToBook = selectedProfessional || (professionals.length > 0 ? professionals[0] : null);

    if (!providerToBook) {
      toast.error("Please select a professional to proceed");
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        provider_id: providerToBook._id,
        service_id: id, // SubService3 ID
        address: bookingForm.address.trim(),
        amount: service.price,
        lat: bookingForm.lat,
        long: bookingForm.long,
        date: bookingForm.date,
        time: bookingForm.time,
        notes: bookingForm.notes,
      };

      const response = await createBooking(bookingData);

      if (response.data.success) {
        toast.success("Booking Request Sent to Professional!");
        setShowBookingModal(false);
        navigate("/my-bookings");
      } else {
        toast.error("Failed to create booking. Please try again.");
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create booking. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-gray-900 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">
              Loading service details...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600 font-medium">Service not found</p>
            <button
              onClick={() => navigate("/services")}
              className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Back to Services
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                {/* Service Hierarchy Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-1 text-[10px] md:text-xs font-bold text-teal-600 uppercase tracking-wider mb-3 bg-teal-50/50 w-fit px-3 py-1.5 rounded-full border border-teal-100/50">
                  <span>{service.serviceId?.name}</span>
                  <ChevronRight size={12} className="text-teal-300" />
                  <span>{service.subServiceId?.name}</span>
                  <ChevronRight size={12} className="text-teal-300" />
                  <span>{service.subService1Id?.name}</span>
                  <ChevronRight size={12} className="text-teal-300" />
                  <span>{service.subService2Id?.name}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                  {service.subService3Name || "Service Name"}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600 mb-6">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    <span className="font-bold text-gray-900">5</span>
                    <span>(1 reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>180 mins</span>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {service.description ||
                    "Professional service with quality guarantee."}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  Available Professionals
                </h2>

                <div className="space-y-4">
                  {professionals.length > 0 ? (
                    professionals.map((professional) => (
                      <div
                        key={professional._id}
                        onClick={() => setSelectedProfessional(professional)}
                        className={`p-6 border rounded-2xl cursor-pointer transition-all ${selectedProfessional?._id === professional._id
                            ? "border-gray-900 bg-gray-50 shadow-md"
                            : "border-gray-200 hover:border-gray-400"
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-16 h-16 bg-linear-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-black text-xl shrink-0">
                            {professional.name?.charAt(0).toUpperCase() || "P"}
                          </div>

                          {/* Details */}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {professional.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {professional.experienceYears || "0"}+ years exp |{" "}
                              {professional.workArea || "Multiple Areas"}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                              <div className="flex items-center gap-1">
                                <Star
                                  size={14}
                                  className="text-amber-400 fill-amber-400"
                                />
                                <span className="font-bold text-gray-900">
                                  4.5
                                </span>
                                <span>
                                  {professional.totalJobs || "0"} jobs
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>{professional.workArea || "Remote"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Award size={14} />
                                <span>
                                  {professional.experienceYears || "0"} years
                                  exp
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Selection Check */}
                          {selectedProfessional?._id === professional._id && (
                            <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                              <CheckCircle2 size={16} className="text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <p className="text-gray-500 font-medium">
                        No professionals available for this service yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Reviews */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  Customer Reviews
                </h2>

                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div
                        key={review._id}
                        className="p-6 bg-gray-50 rounded-2xl border border-gray-100"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm shrink-0">
                            {review.customerName?.charAt(0)?.toUpperCase() ||
                              "FA"}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-gray-900 text-sm">
                                {review.customerName || "Customer"}
                              </span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={
                                      i < review.rating
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-gray-300"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {review.comment ||
                                "Excellent service! Very professional and on time."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      No reviews yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Summary - Right Sidebar (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 mb-6">
                    Book This Service
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">
                        Service Price
                      </span>
                      <span className="font-bold text-gray-900">
                        ₹{service.price}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">
                        Duration
                      </span>
                      <span className="font-bold text-gray-900">180 mins</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">
                        Provider
                      </span>
                      <span className="font-bold text-gray-900">
                        {selectedProfessional
                          ? selectedProfessional.name
                          : "Select a Provider"}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-bold">Total</span>
                        <span className="text-2xl font-black text-gray-900">
                          ₹{service.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToBook}
                    disabled={professionals.length === 0}
                    className={`w-full py-4 font-bold rounded-xl active:scale-95 transition-all shadow-lg text-sm
                      ${professionals.length === 0 
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none" 
                        : "bg-gray-900 text-white hover:bg-gray-800"}`}
                  >
                    {professionals.length === 0 ? "No Professionals Available" : "Proceed to Book"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════ BOOKING MODAL ═══════════════════ */}
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
              className="bg-white w-full sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col"
              style={{ maxWidth: "900px", maxHeight: "95vh" }}
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900">Complete Your Booking</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Fill details and pin your service location</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* ── Scrollable body ── */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="flex flex-col lg:flex-row">

                  {/* ═══ Form Column ═══ */}
                  <form
                    onSubmit={handleBookingSubmit}
                    className="shrink-0 p-5 sm:p-6 space-y-4 lg:w-[360px] lg:border-r lg:border-gray-100"
                  >
                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Date</label>
                        <input
                          type="date"
                          value={bookingForm.date}
                          onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all text-sm font-medium text-gray-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Time</label>
                        <input
                          type="time"
                          value={bookingForm.time}
                          onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all text-sm font-medium text-gray-800"
                          required
                        />
                      </div>
                    </div>

                    {/* ── Address (always a raw text input) ── */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                        Service Address
                      </label>
                      <input
                        type="text"
                        value={bookingForm.address}
                        onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                        placeholder="Type your full address or pin on map →"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
                        required
                      />
                      {bookingForm.lat && bookingForm.long && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                          <span className="text-[10px] font-semibold text-teal-600">
                            GPS: {Number(bookingForm.lat).toFixed(4)}, {Number(bookingForm.long).toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ── Notes ── */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                        Notes <span className="text-gray-400 font-normal normal-case">(optional)</span>
                      </label>
                      <textarea
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                        placeholder="Any special instructions?"
                        rows={2}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none resize-none transition-all text-sm"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold rounded-xl hover:from-teal-700 hover:to-teal-600 active:scale-[0.98] transition-all shadow-lg shadow-teal-600/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Processing…" : "Confirm Booking"}
                    </button>
                  </form>

                  {/* ═══ Map Column (always visible) ═══ */}
                  <div className="flex-1 min-w-0 relative bg-gray-100" style={{ minHeight: "320px" }}>
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
      </div>
    </Layout>
  );
};

export default BookService;
