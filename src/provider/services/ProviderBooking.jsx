import React, { useState, useEffect } from "react";
import {
  getProviderBookings,
  updateBookingStatus,
} from "../../apiservice/provider";
import { Eye, Pencil, ChevronRight, MapPin, X } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";
import LiveTrackingMap from "../../components/LiveTrackingMap";
import toast from "react-hot-toast";

const ProviderBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const socket = useSocket();
  const { user } = useSelector((state) => state.auth);

  // Tracking states
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [otherPartyLocation, setOtherPartyLocation] = useState(null);
  const [myLocation, setMyLocation] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getProviderBookings();
        setBookings(res.data.data);
      } catch (err) {
        setError("Could not fetch bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Broadcast location if there's an active booking
  useEffect(() => {
    let watchId;
    const activeBooking = bookings.find(b => ["Confirmed", "In Progress"].includes(b.status));

    if (activeBooking && socket && user) {
      const handleLocationUpdate = (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("📍 Provider Location Updated:", latitude, longitude);
        setMyLocation([latitude, longitude]);

        const targetId = activeBooking.customer_id?._id || activeBooking.customer_id;
        if (targetId) {
          socket.emit('updateLocation', {
            userId: user._id,
            role: 'provider',
            lat: latitude,
            lng: longitude,
            bookingId: activeBooking._id,
            targetId: targetId
          });
        }
      };

      const handleError = (err) => {
        console.error("❌ Geolocation Error:", err.message, err.code);
        toast.error(`Location error: ${err.message}`);
      };

      // Get initial position immediately
      navigator.geolocation.getCurrentPosition(handleLocationUpdate, handleError, {
        enableHighAccuracy: true,
        timeout: 5000
      });

      // Start watching
      watchId = navigator.geolocation.watchPosition(handleLocationUpdate, handleError, {
        enableHighAccuracy: true,
        distanceFilter: 10 // Only update if moved 10m
      });
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [bookings, socket, user]);

  // Listen for customer location
  useEffect(() => {
    if (socket) {
      socket.on('locationUpdated', (data) => {
        if (trackingBooking && data.bookingId === trackingBooking._id) {
          setOtherPartyLocation([data.lat, data.lng]);
        }
      });
    }
    return () => {
      if (socket) socket.off('locationUpdated');
    };
  }, [socket, trackingBooking]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await updateBookingStatus(id, status);
      setBookings(bookings.map((b) => (b._id === id ? res.data.data : b)));
      if (status === "Completed") {
        toast.success("Job marked as completed! Don't forget to show your payment QR to the customer.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Could not update booking status. Please try again."
      );
      setTimeout(() => setError(""), 3000);
    }
  };

  const openTracking = (booking) => {
    setTrackingBooking(booking);
    setOtherPartyLocation([booking.lat, booking.long]); // Start with the fixed booking address location
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Manage Your Bookings
      </h1>
      <p className="text-gray-600 mb-8">
        Here are all the bookings assigned to you.
      </p>

      {/* Cards for mobile, table for larger screens */}
      <div className="md:hidden">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white shadow-lg rounded-lg p-4 mb-4"
          >
            <div className="flex flex-col mb-2">
              <div className="flex items-center gap-1 text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
                <span>{booking?.service_id?.serviceId?.name}</span>
                <ChevronRight size={8} />
                <span>{booking?.service_id?.subServiceId?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">{booking?.service_id?.subService3Name}</span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
            <p className="text-gray-600">Customer: {booking?.customer_id?.name}</p>
            <p className="text-gray-600">
              Date: {new Date(booking.createdAt).toLocaleDateString()}
            </p>
            <div className="flex justify-end mt-4 space-x-2">
              {["Confirmed", "In Progress"].includes(booking.status) && (
                <button
                  onClick={() => openTracking(booking)}
                  className="flex items-center gap-1 bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-teal-700 transition"
                >
                  <MapPin size={14} />
                  Track Live
                </button>
              )}
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Eye className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-teal-600 uppercase tracking-wider mb-1">
                    <span>{booking?.service_id?.serviceId?.name}</span>
                    <ChevronRight size={10} />
                    <span>{booking?.service_id?.subServiceId?.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{booking?.service_id?.subService3Name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking?.customer_id?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                    className={`px-3 py-1 text-xs font-bold rounded-full border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-teal-500 outline-none ${getStatusClass(booking.status)}`}
                  >
                    {booking.status === "Pending" && <option value="Pending">Pending</option>}
                    {["Pending", "Confirmed"].includes(booking.status) && <option value="Confirmed">Confirmed</option>}
                    {["Confirmed", "In Progress"].includes(booking.status) && <option value="In Progress">In Progress</option>}
                    {booking.status === "In Progress" && <option value="Completed">Completed</option>}
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    {["Confirmed", "In Progress"].includes(booking.status) && (
                      <button
                        onClick={() => openTracking(booking)}
                        className="flex items-center gap-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-teal-200 shadow-sm"
                      >
                        <MapPin size={14} />
                        Track Live
                      </button>
                    )}
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"><Eye className="h-5 w-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tracking Modal */}
      {trackingBooking && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setTrackingBooking(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-teal-50/30">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="text-teal-600" />
                  Live Tracking
                </h2>
                <p className="text-sm text-gray-600">Customer: {trackingBooking.customer_id?.name} • Room: {trackingBooking.address}</p>
              </div>
              <button
                onClick={() => setTrackingBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 min-h-[400px] bg-gray-50">
              <LiveTrackingMap
                customerLoc={otherPartyLocation}
                providerLoc={myLocation}
              />
            </div>
            <div className="p-6 bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-gray-700">Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-bold text-gray-700">Customer Location</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 italic">
                Updates every few seconds...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBooking;
