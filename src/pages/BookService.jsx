import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Star, Clock, MapPin, Award, User, X, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../components/Layout";
import { getSubService3ById } from "../apiservice/subservice_3";
import { getProviderReviews, getProvidersByService } from "../apiservice/provider";
import { createBooking } from "../apiservice/booking";

const BookService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

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

    if (!selectedProfessional) {
      toast.error("Please select a professional to proceed");
      return;
    }

    try {
      // Create booking with all required fields
      const bookingData = {
        provider_id: selectedProfessional._id,
        service_id: id, // SubService3 ID
        address: bookingForm.address.trim(),
        amount: service.price,
        lat: null,
        long: null,
      };

      await createBooking(bookingData);

      toast.success("Booking successful!");

      // Close modal and redirect to My Bookings page
      setShowBookingModal(false);
      navigate("/my-bookings");
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create booking. Please try again.",
      );
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
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Services
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-8">
              {/* Service Header */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                  {service.subServiceId?.name ||
                    service.subService3Name ||
                    "Service Name"}
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

              {/* Available Professionals */}
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
                              {professional.experienceYears || "0"}+ years exp | {professional.workArea || "Multiple Areas"}
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
                                <span>{professional.totalJobs || "0"} jobs</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>{professional.workArea || "Remote"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Award size={14} />
                                <span>{professional.experienceYears || "0"} years exp</span>
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
                      <p className="text-gray-500 font-medium">No professionals available for this service yet.</p>
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
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm shrink-0">
                            {review.customerName?.charAt(0)?.toUpperCase() ||
                              "FA"}
                          </div>

                          {/* Review Content */}
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
                        {selectedProfessional ? selectedProfessional.name : "Select a Provider"}
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
                    className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg"
                  >
                    Proceed to Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
              {/* Close Button */}
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>

              {/* Modal Title */}
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                Complete Your Booking
              </h2>

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                {/* Date Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, date: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Time Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, time: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Address Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={bookingForm.address}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter your complete address"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                    required
                  />
                </div>

                {/* Additional Notes Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, notes: e.target.value })
                    }
                    placeholder="Any special instructions?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-linear-to-r from-blue-500 to-teal-400 text-white font-bold rounded-xl hover:from-blue-600 hover:to-teal-500 active:scale-95 transition-all shadow-lg"
                >
                  Confirm Booking
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookService;
