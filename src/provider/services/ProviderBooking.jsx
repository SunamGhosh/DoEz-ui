import React, { useState, useEffect, useCallback, useRef } from "react";
import { getProviderBookings, updateBookingStatus } from "../../apiservice/provider";
import { Eye, MapPin, X, Phone, Calendar, CreditCard, User, ChevronRight, Loader2, Wrench } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";
import LiveTrackingMap from "../../components/LiveTrackingMap";
import toast from "react-hot-toast";

const statusConfig = {
  Confirmed:     { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400" },
  "In Progress": { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500" },
  Completed:     { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  Pending:       { bg: "bg-gray-100",    text: "text-gray-600",    dot: "bg-gray-400" },
  Cancelled:     { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-400" },
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

  const watchIdRef = useRef(null);

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

    // Modal opened → start GPS immediately
    setGpsAcquiring(true);
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

  // Open tracking modal
  const openTracking = useCallback((booking) => {
    setMyLoc(null); // reset so we get fresh GPS
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
                    <select value={b.status} onChange={(e) => handleStatusUpdate(b._id, e.target.value)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      {b.status === "Pending"                          && <option value="Pending">Pending</option>}
                      {["Pending","Confirmed"].includes(b.status)      && <option value="Confirmed">Confirmed</option>}
                      {["Confirmed","In Progress"].includes(b.status)  && <option value="In Progress">In Progress</option>}
                      {b.status === "In Progress"                      && <option value="Completed">Completed</option>}
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {["Confirmed", "In Progress"].includes(b.status) && (
                      <button onClick={() => openTracking(b)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all">
                        <MapPin size={13} className="animate-bounce" /> Track
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
