import React, { useState, useEffect, useCallback, useRef } from "react";
import { getProviderBookings, updateBookingStatus } from "../../apiservice/provider";
import { Eye, MapPin, X, Phone, Calendar, CreditCard, User, ChevronRight, Loader2, Wrench, MessageSquare, ArrowRight } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";
import LiveTrackingMap from "../../components/LiveTrackingMap";
import toast from "react-hot-toast";
import { getMessagesByBookingId } from "../../apiservice/chat";

const statusConfig = {
  Confirmed:     { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400" },
  "In Progress": { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500" },
  Completed:     { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  Pending:       { bg: "bg-gray-100",    text: "text-gray-600",    dot: "bg-gray-400" },
  Cancelled:     { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-400" },
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value._id?.toString() || value.toString();
  return value.toString();
};

const canUseChat = (status) => ["Confirmed", "In Progress", "Completed"].includes(status);

const statusOptionsByStatus = {
  Pending: ["Pending", "Confirmed", "Cancelled"],
  Confirmed: ["Confirmed", "In Progress", "Completed", "Cancelled"],
  "In Progress": ["In Progress", "Completed", "Cancelled"],
  Completed: ["Completed"],
  Cancelled: ["Cancelled"],
};

const ProviderBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useSelector((s) => s.auth);

  const [trackingBooking, setTrackingBooking] = useState(null);
  const [myLoc, setMyLoc] = useState(null);
  const [destinationLoc, setDestinationLoc] = useState(null);
  const [customerPhone, setCustomerPhone] = useState(null);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [gpsAcquiring, setGpsAcquiring] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatBooking, setChatBooking] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const watchIdRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Fetch bookings
  useEffect(() => {
    getProviderBookings()
      .then((r) => setBookings(r.data.data || []))
      .catch(() => toast.error("Could not fetch bookings"))
      .finally(() => setLoading(false));
  }, []);

  // ── Start GPS when tracking modal opens, stop when it closes ──
  useEffect(() => {
    if (!trackingBooking) {
      // Modal closed → stop watching
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    console.log("[GPS] Starting geolocation for booking:", trackingBooking._id);

    const targetId = trackingBooking.customer_id?._id || trackingBooking.customer_id;

    const onPosition = (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      console.log("[GPS] Position:", lat, lng);
      setMyLoc([lat, lng]);
      setGpsAcquiring(false);

      // Broadcast to customer via socket
      if (socket && user && targetId) {
        socket.emit("updateLocation", {
          userId: user._id,
          role: "provider",
          lat,
          lng,
          bookingId: trackingBooking._id,
          targetId,
        });
      }
    };

    const onError = (err) => {
      console.error("[GPS] Error:", err.code, err.message);
      setGpsAcquiring(false);
      if (err.code === 1) {
        toast.error("Location access denied. Please allow location in your browser settings.", { id: "gps" });
      } else if (err.code === 2) {
        toast.error("Location unavailable. Please check GPS settings.", { id: "gps" });
      } else {
        toast.error("Location request timed out. Retrying...", { id: "gps" });
      }
    };

    // Initial position
    navigator.geolocation.getCurrentPosition(onPosition, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });

    // Continuous watch
    watchIdRef.current = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 5000,
    });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [trackingBooking, socket, user]);

  useEffect(() => {
    if (!showChatModal || !chatBooking) return;

    const fetchMessages = async () => {
      try {
        const res = await getMessagesByBookingId(chatBooking._id);
        setChatMessages(res.data?.data || []);
      } catch {
        toast.error("Could not load chat");
      }
    };

    fetchMessages();
    if (socket) socket.emit("joinBooking", chatBooking._id);

    return () => {
      if (socket) socket.emit("leaveBooking", chatBooking._id);
    };
  }, [showChatModal, chatBooking, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      const msgBookingId = getId(message.bookingId);
      const currentBookingId = getId(chatBooking?._id);
      const isCurrentChat = showChatModal && currentBookingId === msgBookingId;

      if (isCurrentChat) {
        setChatMessages((prev) => {
          if (message._id && prev.some((m) => m._id === message._id)) return prev;

          const tempIndex = prev.findIndex(
            (m) =>
              m._id?.startsWith("temp-") &&
              m.message === message.message &&
              m.senderModel === message.senderModel &&
              getId(m.senderId) === getId(message.senderId)
          );

          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = message;
            return updated;
          }

          return [...prev, message];
        });
      }

      if (message.senderModel === "Customer" && !isCurrentChat) return;
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [socket, showChatModal, chatBooking, bookings]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Open tracking modal
  const openTracking = useCallback((booking) => {
    setMyLoc(null); // reset so we get fresh GPS
    setGpsAcquiring(true);
    setTrackingBooking(booking);
    setCustomerPhone(booking.customer_id?.phone || null);
    if (booking.lat && booking.long) {
      setDestinationLoc([Number(booking.lat), Number(booking.long)]);
    } else {
      setDestinationLoc(null);
    }
  }, []);

  // Close tracking modal
  const closeTracking = () => {
    setTrackingBooking(null);
    setMyLoc(null);
  };

  const openChat = (booking) => {
    setChatBooking(booking);
    setShowChatModal(true);
  };

  const closeChat = () => {
    setShowChatModal(false);
    setChatBooking(null);
    setNewMessage("");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !chatBooking || !socket) return;

    const msgData = {
      bookingId: chatBooking._id,
      senderId: user?._id || user?.id,
      senderModel: "Provider",
      message: newMessage.trim(),
      _id: "temp-" + Date.now(),
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, msgData]);
    socket.emit("sendMessage", msgData);
    setNewMessage("");
  };

  // Status update
  const handleStatusUpdate = async (id, status) => {
    try {
      const r = await updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => (b._id === id ? r.data.data : b)));
      if (status === "Completed") toast.success("Job completed!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not update status");
    }
  };

  const sc = (status) => statusConfig[status] || statusConfig.Pending;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#1a1f36] rounded-2xl p-5 sm:p-7 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Provider</p>
          <h1 className="text-xl sm:text-2xl font-extrabold">My Bookings</h1>
          <p className="text-white/40 text-sm mt-1">{bookings.length} total bookings</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <Wrench className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium text-sm">No bookings yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const s = sc(b.status);
            return (
              <div key={b._id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">
                      <span>{b.service_id?.serviceId?.name}</span>
                      <ChevronRight size={9} className="text-gray-300" />
                      <span>{b.service_id?.subServiceId?.name}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-sm font-bold text-gray-900">{b.service_id?.subService3Name || "Service"}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{b.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User size={12} className="text-gray-400" />{b.customer_id?.name}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} className="text-gray-400" />{new Date(b.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-gray-900">₹{b.amount}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <select
                      value={b.status}
                      onChange={(e) => {
                        if (e.target.value !== b.status) handleStatusUpdate(b._id, e.target.value);
                      }}
                      disabled={["Completed", "Cancelled"].includes(b.status)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed">
                      {(statusOptionsByStatus[b.status] || [b.status]).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    {["Confirmed", "In Progress"].includes(b.status) && (
                      <button onClick={() => openTracking(b)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all">
                        <MapPin size={13} className="animate-bounce" /> Track
                      </button>
                    )}
                    {b.customer_id && canUseChat(b.status) && (
                      <button onClick={() => openChat(b)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl text-xs font-bold hover:bg-violet-100 transition-all">
                        <MessageSquare size={13} /> Chat
                      </button>
                    )}
                    <button onClick={() => setViewingBooking(b)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tracking Modal ── */}
      {trackingBooking && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#1a1f36]/70 backdrop-blur-md" onClick={closeTracking} />
          <div className="bg-white w-full h-full sm:w-full sm:h-full overflow-hidden flex flex-col relative z-10">
            {/* Header / Top Bar */}
            <div className="absolute top-0 left-0 w-full z-[2000] bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between shadow-sm">
              <div className="min-w-0 pr-4">
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center gap-2 truncate">
                  <MapPin className="text-blue-600 w-4 h-4 shrink-0" /> Navigate to Customer
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate font-medium">
                  {trackingBooking.customer_id?.name} · {trackingBooking.address?.slice(0, 35)}
                </p>
              </div>
              <button onClick={closeTracking} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100/80 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all shrink-0 shadow-sm border border-gray-200/50">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="flex-1 w-full h-full relative">
              {gpsAcquiring && !myLoc && (
                <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[2000] bg-[#1a1f36]/95 backdrop-blur-md text-white px-4 sm:px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-pulse whitespace-nowrap border border-white/10">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-400 rounded-full animate-ping" />
                  Getting your location…
                </div>
              )}
              {/* Map Container - Pushed down visually by the absolute header */}
              <div className="w-full h-full pt-[60px] sm:pt-[72px]">
                <LiveTrackingMap
                  providerLoc={myLoc}
                  customerLoc={destinationLoc}
                  customerAddress={trackingBooking?.address}
                  customerPhone={customerPhone}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Modal ── */}
      {showChatModal && chatBooking && (
        <div className="fixed inset-0 z-[1000] flex items-stretch sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#1a1f36]/70 backdrop-blur-md" onClick={closeChat} />
          <div className="bg-white w-full h-full sm:w-[420px] sm:h-[560px] sm:rounded-2xl overflow-hidden flex flex-col relative z-10 shadow-2xl">
            <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-linear-to-br from-violet-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-violet-500/20">
                  {chatBooking.customer_id?.name?.[0] || "C"}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">
                    {chatBooking.customer_id?.name || "Customer"}
                  </h2>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Chat
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {chatBooking.customer_id?.phone && (
                  <a
                    href={`tel:${chatBooking.customer_id.phone}`}
                    className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all"
                    aria-label="Call customer"
                  >
                    <Phone size={14} />
                  </a>
                )}
                <button onClick={closeChat} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div ref={chatScrollRef} className="flex-1 bg-gradient-to-b from-slate-100 via-gray-50 to-slate-100 p-4 sm:p-5 overflow-y-auto flex flex-col gap-4">
              <div className="mx-auto px-4 py-2 bg-white/90 border border-gray-200 rounded-full text-[11px] text-gray-600 font-semibold uppercase tracking-wider shadow-sm max-w-full truncate">
                {chatBooking.service_id?.subService3Name || "Booking chat"}
              </div>

              {chatMessages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center px-6">
                  <p className="text-sm text-gray-400 font-medium">No messages yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {chatMessages.map((msg, i) => {
                    const isMe = msg.senderModel === "Provider";
                    return (
                      <div
                        key={msg._id || i}
                        className={`max-w-[84%] sm:max-w-[76%] px-4 py-3 text-sm leading-relaxed shadow-sm break-words ${
                          isMe
                            ? "bg-[#1a1f36] rounded-2xl rounded-tr-sm text-white self-end"
                            : "bg-white rounded-2xl rounded-tl-sm text-gray-800 border border-gray-200 self-start"
                        }`}
                      >
                        {msg.message}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 bg-white border-t border-gray-100 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-gray-400 min-w-0"
                  />
                </div>
                <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="w-10 h-10 bg-[#1a1f36] rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-all shadow-lg shadow-black/10 disabled:opacity-50 shrink-0">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {viewingBooking && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1a1f36]/70 backdrop-blur-md" onClick={() => setViewingBooking(null)} />
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking Details</p>
                <h3 className="font-extrabold text-gray-900">{viewingBooking.service_id?.subService3Name || "Service"}</h3>
              </div>
              <button onClick={() => setViewingBooking(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${sc(viewingBooking.status).bg} ${sc(viewingBooking.status).text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc(viewingBooking.status).dot}`} />{viewingBooking.status}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Customer", value: viewingBooking.customer_id?.name,                       icon: <User size={13} /> },
                  { label: "Amount",   value: `₹${viewingBooking.amount}`,                            icon: <CreditCard size={13} /> },
                  { label: "Date",     value: new Date(viewingBooking.createdAt).toLocaleDateString(), icon: <Calendar size={13} /> },
                  { label: "Phone",    value: viewingBooking.customer_id?.phone || "—",               icon: <Phone size={13} /> },
                ].map((d, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">{d.icon}{d.label}</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{d.value}</p>
                  </div>
                ))}
              </div>
              {viewingBooking.address && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={13} />Address</p>
                  <p className="text-sm text-gray-700">{viewingBooking.address}</p>
                </div>
              )}
              <button onClick={() => setViewingBooking(null)}
                className="w-full py-3 bg-[#1a1f36] hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBooking;
