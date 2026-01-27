import React, { useState, useEffect } from "react";
import {
  getProviderBookings,
  updateBookingStatus,
} from "../../apiservice/provider";
import { Eye, Pencil } from "lucide-react";

const ProviderBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
console.log(bookings)
  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await updateBookingStatus(id, status);
      setBookings(bookings.map((b) => (b._id === id ? res.data.data : b)));
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Could not update booking status. Please try again."
      );
      // Revert the UI change if needed
      setTimeout(() => setError(""), 3000);
    }
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
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
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">{booking?.service_id?.name}</span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>
            </div>
            <p className="text-gray-600">Customer: {booking?.customer_id?.name}</p>
            <p className="text-gray-600">
              Date: {new Date(booking.createdAt).toLocaleDateString()}
            </p>
            <div className="flex justify-end mt-4 space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Eye className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Pencil className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr
                key={booking._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking?.service_id?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking?.customer_id?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={booking.status}
                    onChange={(e) =>
                      handleStatusUpdate(booking._id, e.target.value)
                    }
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border-none ${getStatusClass(
                      booking.status
                    )}`}
                  >
                    {booking.status === "Pending" && (
                      <option value="Pending">Pending</option>
                    )}
                    {(booking.status === "Pending" ||
                      booking.status === "Confirmed") && (
                      <option value="Confirmed">Confirmed</option>
                    )}
                    {(booking.status === "Confirmed" ||
                      booking.status === "In Progress") && (
                      <option value="In Progress">In Progress</option>
                    )}
                    {booking.status === "In Progress" && (
                      <option value="Completed">Completed</option>
                    )}
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors duration-200">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-green-600 transition-colors duration-200">
                    <Pencil className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProviderBooking;
