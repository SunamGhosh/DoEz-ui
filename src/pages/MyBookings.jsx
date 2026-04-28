import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCustomerBookings, cancelBooking, deleteBooking, getProviderLocation } from "../apiservice/booking";
import { submitReview } from "../apiservice/review";
import {
  Calendar, Clock, MapPin, Package, CheckCircle, XCircle,
  Star, Trash2, X, ChevronRight, ArrowRight, BadgeCheck, Phone, MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { useSocket } from "../context/SocketContext";
// import { getMessagesByBookingId } from "../apiservice/chat";
import { getImageUrl } from "../utils/imageUtils";
import LiveTrackingMap from "../components/LiveTrackingMap";
import Reveal from "../components/Reveal";

const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const toLatLng = (lat, lng) => {
  const parsedLat = toFiniteNumber(lat);
  const parsedLng = toFiniteNumber(lng);
  return parsedLat === null || parsedLng === null ? null : [parsedLat, parsedLng];
};

const LOCATION_FRESH_MS = 2 * 60 * 1000;

const isFreshLocation = (lastSeen) => {
  if (!lastSeen) return false;
  const seenAt = new Date(lastSeen).getTime();
  return Number.isFinite(seenAt) && Date.now() - seenAt <= LOCATION_FRESH_MS;
};

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
  const [providerLoc, setProviderLoc] = useState(null);
  const [destinationLoc, setDestinationLoc] = useState(null);
  const [providerPhone, setProviderPhone] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatBooking, setChatBooking] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatScrollRef = useRef(null);

  useEffect(() => { fetchBookings(); }, []);

  // Open tracking modal — fetch last known provider position from DB
  const openTracking = useCallback(async (booking) => {
    setTrackingBooking(booking);
    setProviderLoc(null);
    setProviderPhone(booking.provider_id?.phone || null);

    setDestinationLoc(toLatLng(booking.lat, booking.long));

    // Fetch last known provider position from DB
    try {
      const res = await getProviderLocation(booking._id);
      const loc = res.data.data;
      const nextProviderLoc = toLatLng(loc.providerLat, loc.providerLng);
      if (nextProviderLoc && isFreshLocation(loc.providerLastSeen)) setProviderLoc(nextProviderLoc);
    } catch { /* location will arrive over socket or polling */ }
  }, []);

  const closeTracking = useCallback(() => {
    setTrackingBooking(null);
    setProviderLoc(null);
    setDestinationLoc(null);
    setProviderPhone(null);
  }, []);

  // Listen for real-time provider location via socket
  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      if (trackingBooking && data.bookingId === trackingBooking._id && data.role === "provider") {
        const nextProviderLoc = toLatLng(data.lat, data.lng);
        if (nextProviderLoc) setProviderLoc(nextProviderLoc);
      }
    };

    if (trackingBooking?._id) socket.emit("joinBooking", trackingBooking._id);
    socket.on("locationUpdated", handler);
    return () => {
      socket.off("locationUpdated", handler);
      if (trackingBooking?._id) socket.emit("leaveBooking", trackingBooking._id);
    };
  }, [socket, trackingBooking]);

  // Poll DB every 5 seconds as fallback (in case socket doesn't deliver)
  useEffect(() => {
    if (!trackingBooking) return;

    const poll = async () => {
      try {
        const res = await getProviderLocation(trackingBooking._id);
        const loc = res.data.data;
        const newLoc = toLatLng(loc.providerLat, loc.providerLng);
        if (newLoc && isFreshLocation(loc.providerLastSeen)) {
          setProviderLoc((prev) => {
            // Only update if position actually changed
            if (!prev || prev[0] !== newLoc[0] || prev[1] !== newLoc[1]) {
              return newLoc;
            }
            return prev;
          });
        }
      } catch { /* silent */ }
    };

    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [trackingBooking]);

  // Chat setup: fetch messages and join room
  useEffect(() => {
    if (showChatModal && chatBooking) {
      const fetchMessages = async () => {
        try {
          console.log("Fetching messages for booking:", chatBooking._id);
          const res = await getMessagesByBookingId(chatBooking._id);
          console.log("Messages response:", res.data);
          if (res.data && res.data.data) {
            setChatMessages(res.data.data);
          }
        } catch (err) { console.error("Failed to fetch messages", err); }
      };
      fetchMessages();

      if (socket) socket.emit("joinBooking", chatBooking._id);

      return () => {
        if (socket) socket.emit("leaveBooking", chatBooking._id);
      };
    }
  }, [showChatModal, chatBooking, socket]);

  // Listen for real-time messages
  // useEffect(() => {
  //   if (!socket) return;
  //   const handleReceiveMessage = (message) => {
  //       console.log("Received socket message:", message);
  //       console.log("Current chatBooking._id:", chatBooking?._id);

  //       // Handle potential ObjectId to string mismatch by converting both to strings
  //       const msgBookingId = typeof message.bookingId === 'object' ? message.bookingId._id?.toString() || message.bookingId.toString() : message.bookingId?.toString();
  //       const currentBookingId = chatBooking?._id?.toString();

  //       if (showChatModal && chatBooking && msgBookingId === currentBookingId) {
  //           setChatMessages(prev => {
  //               // Avoid duplicates by checking if the message already exists
  //               if (message._id && prev.some(m => m._id === message._id)) return prev;
  //               return [...prev, message];
  //           });
  //       }
  //   };
  //   socket.on("receiveMessage", handleReceiveMessage);
  //   return () => socket.off("receiveMessage", handleReceiveMessage);
  // }, [socket, showChatModal, chatBooking]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      const msgBookingId =
        typeof message.bookingId === "object"
          ? message.bookingId._id?.toString() ||
          message.bookingId.toString()
          : message.bookingId?.toString();

      const currentBookingId = chatBooking?._id?.toString();

      if (showChatModal && chatBooking && msgBookingId === currentBookingId) {
        setChatMessages((prev) => {
          // Prevent exact duplicate from DB
          if (prev.some((m) => m._id === message._id)) {
            return prev;
          }

          // Replace temporary optimistic message
          const tempIndex = prev.findIndex(
            (m) =>
              m._id?.startsWith("temp-") &&
              m.message === message.message &&
              m.senderModel === message.senderModel &&
              (
                typeof m.senderId === "object"
                  ? m.senderId._id?.toString()
                  : m.senderId?.toString()
              ) ===
              (
                typeof message.senderId === "object"
                  ? message.senderId._id?.toString()
                  : message.senderId?.toString()
              )
          );

          if (tempIndex !== -1) {
            const updatedMessages = [...prev];
            updatedMessages[tempIndex] = message;
            return updatedMessages;
          }

          // Add provider/customer new message
          return [...prev, message];
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, showChatModal, chatBooking]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !chatBooking || !socket) return;
    const msgData = {
      bookingId: chatBooking._id,
      senderId: user?._id || user?.id,
      senderModel: "Customer",
      message: newMessage.trim(),
      _id: "temp-" + Date.now(), // Temporary ID for optimistic update
      createdAt: new Date().toISOString()
    };

    // Optimistically add the message to the chat
    setChatMessages(prev => [...prev, msgData]);

    socket.emit("sendMessage", msgData);
    setNewMessage("");
  };


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
    Pending: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
    Confirmed: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    "In Progress": { bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-500" },
    Completed: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    Cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-400" },
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
      <div className="min-h-screen bg-white antialiased overflow-x-hidden">

        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[#1a1f36] via-[#1e2a4a] to-[#2563eb]" />
          <div className="absolute top-1/2 right-0 w-[55%] h-[140%] -translate-y-1/2 bg-linear-to-l from-blue-500/20 via-blue-400/10 to-transparent rounded-full blur-3xl" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-18 lg:pt-20 pb-6 sm:pb-8 lg:pb-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 border border-white/15 rounded-full text-[11px] font-medium text-white/70 mb-2">
                  <Calendar className="w-3 h-3 text-blue-400" /> Booking History
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-[1.1] tracking-tight mb-1.5 max-w-[11ch] sm:max-w-none">
                  My Bookings
                </h1>
                <p className="text-white/50 text-sm">Welcome back, {user?.name || "User"}</p>
              </div>
              <button
                onClick={() => navigate("/services")}
                className="w-full sm:w-auto justify-center shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-full hover:bg-white/20 transition-all"
              >
                Browse Services <ArrowRight size={15} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 mb-1 sm:mb-2">
              {[
                { label: "Total", value: totalBookings, icon: <Calendar className="w-4 h-4" />, color: "bg-white/10" },
                { label: "Active", value: activeBookings, icon: <Clock className="w-4 h-4" />, color: "bg-amber-500/20" },
                { label: "Completed", value: completedBookings, icon: <CheckCircle className="w-4 h-4" />, color: "bg-emerald-500/20" },
              ].map((s, i) => (
                <div key={i} className="bg-white/6 border border-white/12 rounded-xl p-2.5 sm:p-3 min-w-0">
                  <div className={`w-6 h-6 ${s.color} rounded-md flex items-center justify-center text-white mb-1.5`}>{s.icon}</div>
                  <div className="text-lg sm:text-xl font-extrabold text-white leading-none">{s.value}</div>
                  <div className="text-[11px] sm:text-xs text-white/50 font-semibold mt-1 truncate">{s.label}</div>
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

        {/* BOOKINGS LIST */}
        <section className="py-6 lg:py-8 bg-white">
          <Reveal>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6 w-full sm:w-fit overflow-x-auto sm:overflow-visible">
                {[
                  { label: "Active", count: activeBookings },
                  { label: "Completed", count: completedBookings },
                  { label: "Cancelled", count: cancelledCount },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(tab.label)}
                    className={`flex-1 sm:flex-none min-w-26 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === tab.label
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.label ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"
                      }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Booking cards */}
              {filteredBookings.length === 0 ? (
                <div className="py-20 sm:py-24 px-4 text-center border border-dashed border-gray-200 rounded-2xl">
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
                        className="bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 p-4 sm:p-6"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-5">
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

                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 mb-4">
                              <span className="flex items-center gap-1.5 min-w-0">
                                <MapPin size={13} className="text-gray-400" /> {booking.address}
                              </span>
                              <span className="flex items-center gap-1.5 min-w-0">
                                <Calendar size={13} className="text-gray-400" />
                                {new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                                ₹{booking.amount}
                              </span>
                            </div>

                            {/* Provider */}
                            {booking.provider_id && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-gray-100">
                                <div className="w-9 h-9 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                  {booking.provider_id.name?.[0] || "P"}
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Professional</p>
                                  <p className="text-sm font-bold text-gray-900">{booking.provider_id.name}</p>
                                </div>
                                <div className="sm:ml-auto flex items-center gap-1 text-xs text-gray-400">
                                  <BadgeCheck size={13} className="text-emerald-500" /> Verified
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-col lg:items-end lg:shrink-0">
                            {booking.status === "Completed" && (
                              <button
                                onClick={() => handleOpenReview(booking)}
                                className="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold rounded-full hover:bg-amber-100 transition-all"
                              >
                                <Star size={13} className="fill-amber-400 text-amber-400" /> Review
                              </button>
                            )}
                            {booking.status === "Completed" && booking.provider_id?.paymentQrCode && (
                              <button
                                onClick={() => setQrModalBooking(booking)}
                                className="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold rounded-full hover:bg-emerald-100 transition-all"
                              >
                                <CheckCircle size={13} /> Pay
                              </button>
                            )}
                            {["Confirmed", "In Progress"].includes(booking.status) && (
                              <button
                                onClick={() => openTracking(booking)}
                                className="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold rounded-full hover:bg-blue-100 transition-all"
                              >
                                <MapPin size={13} className="animate-bounce" /> Track
                              </button>
                            )}
                            {booking.provider_id && (
                              <button
                                onClick={() => {
                                  setChatBooking(booking);
                                  setShowChatModal(true);
                                }}
                                className="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-2 bg-violet-50 text-violet-700 border border-violet-200 text-sm font-semibold rounded-full hover:bg-violet-100 transition-all"
                              >
                                <MessageSquare size={13} /> Chat
                              </button>
                            )}
                            {["Pending", "Confirmed"].includes(booking.status) && (
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-full hover:bg-red-100 transition-all"
                              >
                                <XCircle size={13} /> Cancel
                              </button>
                            )}
                            {["Completed", "Cancelled"].includes(booking.status) && (
                              <button
                                onClick={() => handleDeleteBooking(booking._id)}
                                className="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-500 border border-gray-200 text-sm font-semibold rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
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
          <div className="absolute inset-0 bg-[#1a1f36]/70 backdrop-blur-md" onClick={closeTracking} />
          <div className="bg-white w-full h-full sm:w-full sm:h-full overflow-hidden flex flex-col relative z-10">
            {/* Header / Top Bar */}
            <div className="absolute top-0 left-0 w-full z-[2000] bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between shadow-sm">
              <div className="min-w-0 pr-4">
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center gap-2 truncate">
                  <MapPin className="text-blue-600 w-4 h-4 shrink-0" /> Live Tracking
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate font-medium">
                  {trackingBooking.provider_id?.name} · {trackingBooking.service_id?.subService3Name}
                </p>
              </div>
              <button onClick={closeTracking} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100/80 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all shrink-0 shadow-sm border border-gray-200/50">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="flex-1 w-full h-full relative">
              {!providerLoc && (
                <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[2000] bg-[#1a1f36]/95 backdrop-blur-md text-white px-4 sm:px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-pulse pointer-events-none whitespace-nowrap border border-white/10">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-400 rounded-full animate-ping" />
                  Waiting for provider location…
                </div>
              )}
              {/* Map Container - Pushed down visually by the absolute header */}
              <div className="w-full h-full pt-[60px] sm:pt-[72px]">
                <LiveTrackingMap
                  customerLoc={destinationLoc}
                  providerLoc={providerLoc}
                  customerAddress={trackingBooking.address}
                  providerPhone={providerPhone}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ QR PAYMENT MODAL ═══ */}
      {qrModalBooking && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-[#1a1f36]/70 backdrop-blur-md" onClick={() => setQrModalBooking(null)} />
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm max-h-[92vh] overflow-y-auto shadow-2xl relative z-10 p-5 sm:p-7 text-center">
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
        <div className="fixed inset-0 bg-[#1a1f36]/70 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl">
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

      {/* ═══ CHAT MODAL ═══ */}
      {showChatModal && chatBooking && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#1a1f36]/70 backdrop-blur-md" onClick={() => setShowChatModal(false)} />
          <div className="bg-white w-full h-[80vh] sm:w-[400px] sm:h-[550px] sm:rounded-2xl overflow-hidden flex flex-col relative z-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-blue-500/20">
                  {chatBooking.provider_id?.name?.[0] || "P"}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">
                    {chatBooking.provider_id?.name}
                  </h2>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all">
                  <Phone size={14} />
                </button>
                <button onClick={() => setShowChatModal(false)} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
           <div
  ref={chatScrollRef}
  className="flex-1 bg-gradient-to-b from-slate-100 via-gray-50 to-slate-100 p-5 overflow-y-auto flex flex-col gap-5"
>
  {/* Service Tag */}
  <div className="mx-auto my-3 px-5 py-2 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full text-xs text-gray-600 font-semibold uppercase tracking-wider shadow-sm">
    Service: {chatBooking.service_id?.subService3Name}
  </div>

  {/* Messages */}
  <div className="flex flex-col gap-5">
    {chatMessages.map((msg, i) => {
      const isMe = msg.senderModel === "Customer";

      return (
        <div
          key={msg._id || i}
          className={`max-w-[82%] sm:max-w-[75%] px-5 py-4 text-[15px] leading-relaxed shadow-md break-words ${
            isMe
              ? "bg-gradient-to-r from-[#1a1f36] to-[#2d3d68] rounded-3xl rounded-tr-none text-white self-end"
              : "bg-white rounded-3xl rounded-tl-none text-gray-800 border border-gray-200 self-start"
          }`}
        >
          {msg.message}
        </div>
      );
    })}
  </div>
</div>

            {/* Footer / Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-gray-400"
                  />
                </div>
                <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="w-10 h-10 bg-[#1a1f36] rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-all shadow-lg shadow-black/10 disabled:opacity-50">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MyBookings;
