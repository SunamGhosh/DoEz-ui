import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCustomerBookings, cancelBooking, deleteBooking } from "../apiservice/booking";
import { submitReview } from "../apiservice/review";
import {
  Calendar, Clock, MapPin, Package, CheckCircle, XCircle,
  Star, Trash2, X, ChevronRight, ArrowRight, BadgeCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { useSocket } from "../context/SocketContext";
import { getImageUrl } from "../utils/imageUtils";
import LiveTrackingMap from "../components/LiveTrackingMap";
import Reveal from "../components/Reveal";

const MyBookings = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Active");
  const socket = useSocket();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [trackingBooking, setTrackingBooking] = useState(null);
  const [qrModalBooking, setQrModalBooking] = useState(null);
  const [otherPartyLocation, setOtherPartyLocation] = useState(null);
  const [myLocation, setMyLocation] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    let watchId;
    const activeBooking = bookings.find((b) => ["Confirmed", "In Progress"].includes(b.status));
    if (activeBooking && socket && user) {
      const handleLocationUpdate = (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLocation([latitude, longitude]);
        const targetId = activeBooking.provider_id?._id || activeBooking.provider_id;
        if (targetId) {
          socket.emit("updateLocation", { userId: user._id, role: "customer", lat: latitude, lng: longitude, bookingId: activeBooking._id, targetId });
        }
      };
      navigator.geolocation.getCurrentPosition(handleLocationUpdate, console.error, { enableHighAccuracy: true, timeout: 5000 });
      watchId = navigator.geolocation.watchPosition(handleLocationUpdate, console.error, { enableHighAccuracy: true, distanceFilter: 10 });
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [bookings, socket, user]);

  useEffect(() => {
    if (socket) {
      socket.on("locationUpdated", (data) => {
        if (trackingBooking && data.bookingId === trackingBooking._id) setOtherPartyLocation([data.lat, data.lng]);
      });
    }
    return () => { if (socket) socket.off("locationUpdated"); };
  }, [socket, trackingBooking]);

  const fetchBookings = async () => {
    try {
      const res = await getCustomerBookings();
      setBookings(res.data.data || []);
    } catch { toast.error("Failed to fetch bookings"); }
    finally { setLoading(false); }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try { await cancelBooking(id); toast.success("Booking cancelled"); fetchBookings(); }
    catch { toast.error("Failed to cancel booking"); }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try { await deleteBooking(id); toast.success("Record deleted"); fetchBookings(); }
    catch { toast.error("Failed to delete record"); }
  };

  const handleOpenReview = (booking) => {
    if (booking.status !== "Completed") { toast.error("Only completed bookings can be reviewed."); return; }
    setSelectedBookingForReview(booking);
    setRating(0); setComment("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    try {
      const res = await submitReview({ bookingId: selectedBookingForReview._id, rating, comment: comment.trim() });
      if (res.success) { toast.success("Review submitted!"); setShowReviewModal(false); }
    } catch (err) { toast.error(err?.response?.data?.error || "Failed to submit review."); }
  };

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => ["Pending", "Confirmed", "In Progress"].includes(b.status)).length;
  const completedBookings = bookings.filter((b) => b.status === "Completed").length;
  const cancelledCount = bookings.filter((b) => b.status === "Cancelled").length;

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "Active") return ["Pending", "Confirmed", "In Progress"].includes(b.status);
    if (activeTab === "Completed") return b.status === "Completed";
    if (activeTab === "Cancelled") return b.status === "Cancelled";
    return true;
  });

  const statusConfig = {
    Pending:     { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400" },
    Confirmed:   { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500" },
    "In Progress": { bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-500" },
    Completed:   { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    Cancelled:   { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-400" },
  };

  if (loading) {
    return (
      <Layout noPadding>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm font-medium">Loading bookings...</p>
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
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-medium text-white/70 mb-4">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Booking History
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-2">
                  My Bookings
                </h1>
                <p className="text-white/50 text-[15px]">Welcome back, {user?.name || "User"}</p>
              </div>
              <button
                onClick={() => navigate("/services")}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-full hover:bg-white/20 transition-all"
              >
                Browse Services <ArrowRight size={15} />
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8">
              {[
                { label: "Total", value: totalBookings, icon: <Calendar className="w-4 h-4" />, color: "bg-white/10" },
                { label: "Active", value: activeBookings, icon: <Clock className="w-4 h-4" />, color: "bg-amber-500/20" },
                { label: "Completed", value: completedBookings, icon: <CheckCircle className="w-4 h-4" />, color: "bg-emerald-500/20" },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                  <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                    {s.icon}
                  </div>
                  <div className="text-2xl font-extrabold text-white">{s.value}</div>
                  <div className="text-xs text-white/40 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 50V25C360 0 1080 0 1440 25V50H0Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            BOOKINGS LIST
        ═══════════════════════════════════════════ */}
        <section className="py-10 lg:py-14 bg-white">
          <Reveal>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-8 w-full sm:w-fit">
                {[
                  { label: "Active", count: activeBookings },
                  { label: "Completed", count: completedBookings },
                  { label: "Cancelled", count: cancelledCount },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(tab.label)}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeTab === tab.label
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.label ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Booking cards */}
              {filteredBookings.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-gray-200 rounded-2xl">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-gray-300 w-7 h-7" />
                  </div>
                  <p className="text-gray-400 font-medium text-sm mb-5">No {activeTab.toLowerCase()} bookings yet</p>
                  <button
                    onClick={() => navigate("/services")}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1a1f36] text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-all"
                  >
                    Browse Services <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => {
                    const sc = statusConfig[booking.status] || statusConfig.Pending;
                    return (
                      <div
                        key={booking._id}
                        className="bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 p-5 sm:p-6"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                          <div className="flex-1 min-w-0">
                            {/* Breadcrumb */}
                            <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">
                              <span>{booking.service_id?.serviceId?.name}</span>
                              <ChevronRight size={9} className="text-gray-300" />
                              <span>{booking.service_id?.subServiceId?.name}</span>
                              <ChevronRight size={9} className="text-gray-300" />
                              <span>{booking.service_id?.subService1Id?.name}</span>
                              <ChevronRight size={9} className="text-gray-300" />
                              <span>{booking.service_id?.subService2Id?.name}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <h3 className="text-base font-bold text-gray-900">
                                {booking.service_id?.subService3Name || "Service"}
                              </h3>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                {booking.status}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500 mb-4">
                              <span className="flex items-center gap-1.5">
                                <MapPin size={13} className="text-gray-400" /> {booking.address}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-gray-400" />
                                {new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                                ₹{booking.amount}
                              </span>
                            </div>

                            {/* Provider */}
                            {booking.provider_id && (
                              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                  {booking.provider_id.name?.[0] || "P"}
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Professional</p>
                                  <p className="text-sm font-bold text-gray-900">{booking.provider_id.name}</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                                  <BadgeCheck size={13} className="text-emerald-500" /> Verified
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:shrink-0">
                            {booking.status === "Completed" && (
                              <button
                                onClick={() => handleOpenReview(booking)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold rounded-full hover:bg-amber-100 transition-all"
                              >
                                <Star size={13} className="fill-amber-400 text-amber-400" /> Review
                              </button>
                            )}
                            {booking.status === "Completed" && booking.provider_id?.paymentQrCode && (
                              <button
                                onClick={() => setQrModalBooking(booking)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold rounded-full hover:bg-emerald-100 transition-all"
                              >
                                <CheckCircle size={13} /> Pay
                              </button>
                            )}
                            {["Confirmed", "In Progress"].includes(booking.status) && (
                              <button
                                onClick={() => { setTrackingBooking(booking); if (booking.lat && booking.long) setMyLocation([booking.lat, booking.long]); setOtherPartyLocation(null); }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold rounded-full hover:bg-blue-100 transition-all"
                              >
                                <MapPin size={13} className="animate-bounce" /> Track
                              </button>
                            )}
                            {["Pending", "Confirmed"].includes(booking.status) && (
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-full hover:bg-red-100 transition-all"
                              >
                                <XCircle size={13} /> Cancel
                              </button>
                            )}
                            {["Completed", "Cancelled"].includes(booking.status) && (
                              <button
                                onClick={() => handleDeleteBooking(booking._id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-500 border border-gray-200 text-sm font-semibold rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>
        </section>

      </div>

      {/* ═══ TRACKING MODAL ═══ */}
      {trackingBooking && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#1a1f36]/70 backdrop-blur-md" onClick={() => setTrackingBooking(null)} />
          <div className="bg-white w-full sm:rounded-2xl rounded-t-2xl sm:max-w-4xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col shadow-2xl relative z-10 sm:mx-4">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <MapPin className="text-blue-600 w-4 h-4" /> Live Tracking
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {trackingBooking.provider_id?.name} · {trackingBooking.service_id?.subService3Name}
                </p>
              </div>
              <button onClick={() => setTrackingBooking(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 relative" style={{ minHeight: "380px" }}>
              {(!myLocation || !otherPartyLocation) && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] bg-[#1a1f36]/90 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold animate-pulse">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  {!myLocation ? "Acquiring GPS signal..." : "Waiting for provider location..."}
                </div>
              )}
              <LiveTrackingMap customerLoc={myLocation} providerLoc={otherPartyLocation} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ QR PAYMENT MODAL ═══ */}
      {qrModalBooking && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1a1f36]/70 backdrop-blur-md" onClick={() => setQrModalBooking(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10 p-7 text-center">
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">Pay Professional</h2>
            <p className="text-gray-500 text-sm mb-6">
              Scan to pay <span className="font-bold text-gray-900">{qrModalBooking.provider_id?.name}</span>
            </p>
            <div className="bg-gray-50 p-5 rounded-2xl mb-5 flex justify-center border border-gray-100">
              <img src={getImageUrl(qrModalBooking.provider_id?.paymentQrCode)} alt="Payment QR" className="max-w-full h-auto rounded-xl" />
            </div>
            <div className="bg-blue-50 rounded-xl p-4 mb-5">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">Amount Due</p>
              <p className="text-3xl font-extrabold text-gray-900">₹{qrModalBooking.amount}</p>
            </div>
            <button onClick={() => setQrModalBooking(null)} className="w-full py-3 bg-[#1a1f36] text-white font-semibold rounded-full hover:bg-blue-600 transition-all">
              Done
            </button>
          </div>
        </div>
      )}

      {/* ═══ REVIEW MODAL ═══ */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-[#1a1f36]/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-extrabold text-gray-900">Rate Your Experience</h2>
              <button onClick={() => setShowReviewModal(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={36}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer transition-all ${star <= rating ? "text-amber-400 fill-amber-400 scale-110" : "text-gray-200 hover:text-amber-300"}`}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <textarea
              placeholder="Share your experience (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm text-gray-800 bg-gray-50"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowReviewModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-all text-sm">
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={rating === 0}
                className={`flex-1 py-2.5 font-semibold rounded-full transition-all text-sm ${rating === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#1a1f36] text-white hover:bg-blue-600 shadow-md"}`}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MyBookings;
