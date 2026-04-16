import React, { useState, useEffect } from "react";
import { getProviderBookings, updateBookingStatus } from "../../apiservice/provider";
import { Eye, MapPin, X, Phone, Calendar, CreditCard, User, ChevronRight, Loader2, Wrench } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";
import LiveTrackingMap from "../../components/LiveTrackingMap";
import toast from "react-hot-toast";

const statusConfig = {
  Confirmed:    { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400" },
  "In Progress":{ bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500" },
  Completed:    { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  Pending:      { bg: "bg-gray-100",    text: "text-gray-600",    dot: "bg-gray-400" },
  Cancelled:    { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-400" },
};

const ProviderBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useSelector((state) => state.auth);
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [otherPartyLocation, setOtherPartyLocation] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [viewingBooking, setViewingBooking] = useState(null);

  useEffect(() => {
    getProviderBookings()
      .then((res) => setBookings(res.data.data || []))
      .catch(() => toast.error("Could not fetch bookings"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let watchId;
    const active = bookings.find(b => ["Confirmed", "In Progress"].includes(b.status));
    if (active && socket && user) {
      const onPos = (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setMyLocation([lat, lng]);
        const targetId = active.customer_id?._id || active.customer_id;
        if (targetId) socket.emit("updateLocation", { userId: user._id, role: "provider", lat, lng, bookingId: active._id, targetId });
      };
      const onErr = (err) => {
        if (active.lat && active.long) onPos({ coords: { latitude: Number(active.lat) - 0.015, longitude: Number(active.long) - 0.015 } });
      };
      navigator.geolocation.getCurrentPosition(onPos, onErr, { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 });
      watchId = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy: true, distanceFilter: 10 });
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [bookings, socket, user]);

  useEffect(() => {
    if (!socket) return;
    socket.on("locationUpdated", (data) => {
      if (trackingBooking && data.bookingId === trackingBooking._id) setOtherPartyLocation([data.lat, data.lng]);
    });
    return () => socket.off("locationUpdated");
  }, [socket, trackingBooking]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await updateBookingStatus(id, status);
      setBookings(bookings.map(b => b._id === id ? res.data.data : b));
      if (status === "Completed") toast.success("Job completed! Show payment QR to customer.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not update status");
    }
  };

  const openTracking = (booking) => {
    setTrackingBooking(booking);
    if (booking.lat && booking.long && !isNaN(booking.lat)) setOtherPartyLocation([Number(booking.lat), Number(booking.long)]);
    else setOtherPartyLocation(null);
  };

  const sc = (status) => statusConfig[status] || statusConfig.Pending;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" /><p className="text-gray-500 text-sm">Loading bookings...</p></div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#1a1f36] rounded-2xl p-5 sm:p-7 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Provider</p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">My Bookings</h1>
          <p className="text-white/40 text-sm mt-1">{bookings.length} total bookings assigned to you.</p>
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
                    {/* Breadcrumb */}
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
                    {/* Status selector */}
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusUpdate(b._id, e.target.value)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      {b.status === "Pending" && <option value="Pending">Pending</option>}
                      {["Pending", "Confirmed"].includes(b.status) && <option value="Confirmed">Confirmed</option>}
                      {["Confirmed", "In Progress"].includes(b.status) && <option value="In Progress">In Progress</option>}
                      {b.status === "In Progress" && <option value="Completed">Completed</option>}
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {["Confirmed", "In Progress"].includes(b.status) && (
                      <button onClick={() => openTracking(b)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all">
                        <MapPin size={13} className="animate-bounce" /> Track
                      </button>
                    )}
                    <button onClick={() => setViewingBooking(b)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tracking Modal */}
      {trackingBooking && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#1a1f36]/70 backdrop-blur-md" onClick={() => setTrackingBooking(null)} />
          <div className="bg-white w-full sm:rounded-2xl rounded-t-2xl sm:max-w-4xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col shadow-2xl relative z-10 sm:mx-4">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2"><MapPin className="text-blue-600 w-4 h-4" />Live Tracking</h2>
                <p className="text-xs text-gray-400 mt-0.5">{trackingBooking.customer_id?.name} · {trackingBooking.address?.slice(0, 40)}…</p>
              </div>
              <button onClick={() => setTrackingBooking(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 relative" style={{ minHeight: "380px" }}>
              {(!myLocation || !otherPartyLocation) && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] bg-[#1a1f36]/90 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold animate-pulse">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  {!myLocation ? "Acquiring GPS..." : "Waiting for customer location..."}
                </div>
              )}
              <LiveTrackingMap customerLoc={otherPartyLocation} providerLoc={myLocation} customerAddress={trackingBooking?.address} />
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1a1f36]/70 backdrop-blur-md" onClick={() => setViewingBooking(null)} />
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking Details</p>
                <h3 className="font-extrabold text-gray-900">{viewingBooking.service_id?.subService3Name || "Service"}</h3>
              </div>
              <button onClick={() => setViewingBooking(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${sc(viewingBooking.status).bg} ${sc(viewingBooking.status).text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc(viewingBooking.status).dot}`} />{viewingBooking.status}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Customer", value: viewingBooking.customer_id?.name, icon: <User size={13} /> },
                  { label: "Amount", value: `₹${viewingBooking.amount}`, icon: <CreditCard size={13} /> },
                  { label: "Date", value: new Date(viewingBooking.createdAt).toLocaleDateString(), icon: <Calendar size={13} /> },
                  { label: "Phone", value: viewingBooking.customerPhone || "—", icon: <Phone size={13} /> },
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
              <button onClick={() => setViewingBooking(null)} className="w-full py-3 bg-[#1a1f36] hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBooking;
