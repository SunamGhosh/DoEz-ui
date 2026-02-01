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
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

const MyBookings = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Active");

  useEffect(() => {
    fetchBookings();
  }, []);

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
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Confirmed": return "bg-blue-100 text-blue-800";
      case "In Progress": return "bg-purple-100 text-purple-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
              <h1 className="text-3xl font-black text-gray-900">
                My Dashboard
              </h1>
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
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === tab
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
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-bold text-gray-900">
                              {booking.service_id?.name || "Service"}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                booking.status,
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(booking.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">Amount:</span>
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
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Professional</p>
                                  <p className="text-sm font-bold text-gray-900">{booking.provider_id.name}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {booking.provider_id.providerServices?.[0] && (
                                      <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-md">
                                        {booking.provider_id.providerServices[0].subServiceId?.name} Expert
                                      </span>
                                    )}
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                      • {booking.provider_id.workArea || "All areas"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
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
    </Layout>
  );
};

export default MyBookings;
