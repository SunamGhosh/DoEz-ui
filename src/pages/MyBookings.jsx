import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCustomerBookings, cancelBooking } from "../apiservice/booking";
import {
  Calendar,
  Clock,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Search,
  ChevronRight,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { useSocket } from "../context/SocketContext";
import { getImageUrl } from "../utils/imageUtils";
import LiveTrackingMap from "../components/LiveTrackingMap";

const MyBookings = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Active");
  const socket = useSocket();

  // Tracking states
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [qrModalBooking, setQrModalBooking] = useState(null);
  const [otherPartyLocation, setOtherPartyLocation] = useState(null);
  const [myLocation, setMyLocation] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  // Broadcast location if there's an active booking
  useEffect(() => {
    let watchId;
    const activeBooking = bookings.find((b) =>
      ["Confirmed", "In Progress"].includes(b.status),
    );

    if (activeBooking && socket && user) {
      const handleLocationUpdate = (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("📍 Customer Location Updated:", latitude, longitude);
        setMyLocation([latitude, longitude]);

        const targetId =
          activeBooking.provider_id?._id || activeBooking.provider_id;
        if (targetId) {
          socket.emit("updateLocation", {
            userId: user._id,
            role: "customer",
            lat: latitude,
            lng: longitude,
            bookingId: activeBooking._id,
            targetId: targetId,
          });
        }
      };

      const handleError = (err) => {
        console.error("❌ Geolocation Error:", err.message, err.code);
      };

      // Get initial position immediately
      navigator.geolocation.getCurrentPosition(
        handleLocationUpdate,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 5000,
        },
      );

      // Start watching
      watchId = navigator.geolocation.watchPosition(
        handleLocationUpdate,
        handleError,
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
        },
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [bookings, socket, user]);

  // Listen for provider location
  useEffect(() => {
    if (socket) {
      socket.on("locationUpdated", (data) => {
        if (trackingBooking && data.bookingId === trackingBooking._id) {
          setOtherPartyLocation([data.lat, data.lng]);
        }
      });
    }
    return () => {
      if (socket) socket.off("locationUpdated");
    };
  }, [socket, trackingBooking]);

  const fetchBookings = async () => {
    try {
      const response = await getCustomerBookings();
      setBookings(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch bookings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      await cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error(error);
    }
  };

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) =>
    ["Pending", "Confirmed", "In Progress"].includes(b.status),
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "Completed",
  ).length;
  const cancelledCount = bookings.filter(
    (b) => b.status === "Cancelled",
  ).length;

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "Active") {
      return ["Pending", "Confirmed", "In Progress"].includes(booking.status);
    } else if (activeTab === "Completed") {
      return booking.status === "Completed";
    } else if (activeTab === "Cancelled") {
      return booking.status === "Cancelled";
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-teal-600 font-semibold mb-3 sm:mb-0 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <h1 className="text-3xl font-black text-gray-900">My Booking</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name || "User"}!
              </p>
            </div>

            <button
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Search className="w-5 h-5" />
              Browse Services
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Bookings
                  </p>
                  <p className="text-3xl font-black text-gray-900 mt-2">
                    {totalBookings}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Active Bookings
                  </p>
                  <p className="text-3xl font-black text-gray-900 mt-2">
                    {activeBookings}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Completed</p>
                  <p className="text-3xl font-black text-gray-900 mt-2">
                    {completedBookings}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex border-b border-gray-200">
              {["Active", "Completed", "Cancelled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab} (
                  {tab === "Active"
                    ? activeBookings
                    : tab === "Completed"
                      ? completedBookings
                      : cancelledCount}
                  )
                </button>
              ))}
            </div>

            <div className="p-6">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    No {activeTab.toLowerCase()} bookings
                  </p>
                  <button
                    onClick={() => navigate("/services")}
                    className="mt-6 px-8 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-md"
                  >
                    Browse Services
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col mb-3">
                            <div className="flex flex-wrap items-center gap-1 text-[9px] md:text-xs font-bold text-teal-600 uppercase tracking-wider mb-2 bg-teal-50/50 w-fit px-2 py-1 rounded-md border border-teal-100/50">
                              <span>{booking.service_id?.serviceId?.name}</span>
                              <ChevronRight size={10} />
                              <span>
                                {booking.service_id?.subServiceId?.name}
                              </span>
                              <ChevronRight size={10} />
                              <span>
                                {booking.service_id?.subService1Id?.name}
                              </span>
                              <ChevronRight size={10} />
                              <span>
                                {booking.service_id?.subService2Id?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-gray-900">
                                {booking.service_id?.subService3Name ||
                                  "Service"}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  booking.status,
                                )}`}
                              >
                                {booking.status}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(
                                  booking.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                Amount:
                              </span>
                              <span className="text-teal-600 font-bold">
                                ₹{booking.amount}
                              </span>
                            </div>

                            {booking.provider_id && (
                              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
                                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-black text-xs">
                                  {booking.provider_id.name?.[0] || "P"}
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                    Professional
                                  </p>
                                  <p className="text-sm font-bold text-gray-900">
                                    {booking.provider_id.name}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {booking.provider_id
                                      .providerServices?.[0] && (
                                      <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-md">
                                        {
                                          booking.provider_id
                                            .providerServices[0].subServiceId
                                            ?.name
                                        }{" "}
                                        Expert
                                      </span>
                                    )}
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                      •{" "}
                                      {booking.provider_id.workArea ||
                                        "All areas"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {booking.status === "Completed" &&
                            booking.provider_id?.paymentQrCode && (
                              <button
                                onClick={() => {
                                  setQrModalBooking(booking);
                                }}
                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all transform hover:scale-[1.02] flex items-center gap-2 shadow-lg"
                              >
                                <CheckCircle className="w-5 h-5" />
                                Pay to Professional
                              </button>
                            )}
                          {["Confirmed", "In Progress"].includes(
                            booking.status,
                          ) && (
                            <button
                              onClick={() => {
                                setTrackingBooking(booking);
                                // Initialize with customer's own address location if available
                                if (booking.lat && booking.long) {
                                  setMyLocation([booking.lat, booking.long]);
                                }
                                setOtherPartyLocation(null);
                              }}
                              className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all transform hover:scale-[1.02] flex items-center gap-2 shadow-lg"
                            >
                              <MapPin className="w-5 h-5 animate-bounce" />
                              Track Live Status
                            </button>
                          )}
                          {["Pending", "Confirmed"].includes(
                            booking.status,
                          ) && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="px-4 py-2 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Modal */}
      {trackingBooking && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setTrackingBooking(null)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-teal-50/30">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="text-teal-600" />
                  Live Status Tracking
                </h2>
                <p className="text-sm text-gray-600">
                  Professional: {trackingBooking.provider_id?.name} • Service:{" "}
                  {trackingBooking.service_id?.subService3Name}
                </p>
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
                customerLoc={myLocation}
                providerLoc={otherPartyLocation}
              />
            </div>
            <div className="p-6 bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-gray-700">
                    Your Location
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs font-bold text-gray-700">
                    Provider Location
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-400 italic">
                Real-time updates enabled
              </div>
            </div>
          </div>
        </div>
      )}
      {/* QR Payment Modal */}
      {qrModalBooking && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setQrModalBooking(null)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl relative z-10 p-8 text-center">
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Pay & Complete
            </h2>
            <p className="text-gray-600 mb-6 font-medium">
              Scan the QR code below to pay{" "}
              <span className="text-teal-600 font-bold">
                {qrModalBooking.provider_id?.name}
              </span>{" "}
              directly.
            </p>

            <div className="bg-teal-50 p-6 rounded-2xl mb-6 flex justify-center border-2 border-dashed border-teal-200">
              <img
                src={getImageUrl(qrModalBooking.provider_id?.paymentQrCode)}
                alt="Payment QR"
                className="max-w-full h-auto rounded-xl shadow-lg"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-2">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Due Amount
                </p>
                <p className="text-3xl font-black text-teal-600">
                  ₹{qrModalBooking.amount}
                </p>
              </div>

              <button
                onClick={() => setQrModalBooking(null)}
                className="w-full py-4 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/30"
              >
                Done
              </button>
              <button
                onClick={() => setQrModalBooking(null)}
                className="w-full py-2 text-gray-400 font-bold hover:text-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MyBookings;
