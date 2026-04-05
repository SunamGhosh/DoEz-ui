import React, { useState, useEffect } from "react";
import {
  Star,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageSquare,
  Flag,
  Trash2,
  EyeOff,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import { getProviderReviews } from "../../apiservice/review";
import { getImageUrl } from "../../utils/imageUtils";

function MoreActionsDropdown({ reviewId, isOpen, onClose, onAction }) {
  if (!isOpen) return null;

  const actions = [
    { label: "View Details", icon: Eye, color: "gray" },
    { label: "Reply to Review", icon: MessageSquare, color: "gray" },
    { label: "Report / Flag", icon: Flag, color: "gray" },
    { divider: true },
    { label: "Hide Review", icon: EyeOff, color: "orange" },
    { label: "Remove Review", icon: Trash2, color: "red" },
  ];

  return (
    <div
      className={`
        absolute top-full right-0 mt-1 w-56
        bg-white border border-gray-200/80 rounded-xl
        shadow-2xl backdrop-blur-sm z-[999]
        overflow-hidden
      `}
    >
      {actions.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="my-1 border-t border-gray-100" />;
        }

        const colorClasses = {
          gray: "text-gray-700 hover:bg-gray-50",
          orange: "text-orange-700 hover:bg-orange-50",
          red: "text-red-700 hover:bg-red-50",
        }[item.color];

        const Icon = item.icon;

        return (
          <button
            key={item.label}
            onClick={() => {
              onAction(item.label, reviewId);
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 ${colorClasses} transition-colors`}
          >
            <Icon size={16} className="opacity-80" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ProviderReviews() {
  const [reviews, setReviews] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("All Time");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useSelector((state) => state.auth);
  console.log("Redux user:", user);
  const socket = useSocket();

  useEffect(() => {
    if (!user?.id) {
      console.warn("[ProviderReviews] No user._id found → skipping fetch");
      setLoading(false);
      setError("Please log in to see your reviews");
      return;
    }

    const fetchReviews = async () => {
      console.log("[ProviderReviews] Starting fetch for provider ID:", user.id);

      try {
        setLoading(true);
        setError(null);

        const response = await getProviderReviews(user.id);

        console.log("╔════════════════════════════════════════════╗");
        console.log("║          FULL API RESPONSE                 ║");
        console.log("╚════════════════════════════════════════════╝");
        console.log("Response:", response);

        // Flexible parsing - trying most common patterns
        let fetchedReviews = [];

        if (response?.reviews) {
          fetchedReviews = response.reviews;
        } else if (response?.data?.reviews) {
          fetchedReviews = response.data.reviews;
        } else if (response?.data?.data) {
          fetchedReviews = response.data.data;
        } else if (Array.isArray(response?.data)) {
          fetchedReviews = response.data;
        } else if (Array.isArray(response)) {
          fetchedReviews = response;
        }

        console.log("Parsed number of reviews:", fetchedReviews.length);

        if (fetchedReviews.length > 0) {
          console.log("First review example:", fetchedReviews[0]);
        } else {
          console.log("No reviews found in the response");
        }

        setReviews(fetchedReviews);
      } catch (err) {
        console.error("──────────────────────────────────────────────");
        console.error("[ProviderReviews] Fetch failed");
        console.error("Error:", err);

        if (err.response) {
          console.error("Status code:", err.response.status);
          console.error("Server message:", err.response.data);
        } else if (err.request) {
          console.error("No response from server (network issue?)", err.request);
        } else {
          console.error("Error message:", err.message);
        }

        setError("Failed to load reviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user?.id]);


  const periods = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "This Month",
    "This Year",
    "All Time",
    "Highest Rated",
    "Lowest Rated",
  ];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setOpenMenuId(null);

    let updatedReviews = [...reviews];

    if (period === "Highest Rated") {
      updatedReviews.sort((a, b) => b.rating - a.rating);
    } else if (period === "Lowest Rated") {
      updatedReviews.sort((a, b) => a.rating - b.rating);
    } else if (period === "All Time") {
      updatedReviews.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    }

    setReviews(updatedReviews);
  };

  const toggleMenu = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleAction = (action, reviewId) => {
    console.log(`Action "${action}" on review ${reviewId}`);

    if (action === "Remove Review") {
      if (window.confirm("Are you sure you want to permanently remove this review?")) {
        // TODO: Implement actual delete API call here
        alert("Review removal – API call placeholder");
      }
    }

    setOpenMenuId(null);
  };

  // ────────────────────────────────────────────────
  // Render logic
  // ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
        <p className="text-lg font-medium">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <Flag size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load reviews</h3>
        <p className="text-gray-600 max-w-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="bg-gray-100 text-gray-500 p-4 rounded-full mb-4">
          <EyeOff size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Please log in to view your reviews.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Feedback</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Manage and respond to customer reviews
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("period-filter")}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700 w-48 justify-between"
            >
              <span className="truncate">{selectedPeriod}</span>
              {openMenuId === "period-filter" ? (
                <ChevronUp size={16} className="text-gray-400" />
              ) : (
                <ChevronDown size={16} className="text-gray-400" />
              )}
            </button>

            {openMenuId === "period-filter" && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 max-h-80 overflow-y-auto ring-1 ring-black ring-opacity-5">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${selectedPeriod === period
                        ? "bg-teal-50 text-teal-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {period}
                    {selectedPeriod === period && (
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="flex flex-col items-end px-4 py-1 bg-teal-50 rounded-lg border border-teal-100">
            <span className="text-xl font-bold text-teal-700">{reviews.length}</span>
            <span className="text-xs font-medium text-teal-600/80 uppercase tracking-wide">Reviews</span>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-6 px-6 py-4 bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Service</div>
          <div className="col-span-2 text-center">Rating</div>
          <div className="col-span-2">Review</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-100">
          {reviews.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 text-gray-400">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
              <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                When customers leave feedback on your completed services, they will appear here.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="grid grid-cols-12 gap-6 px-6 py-5 hover:bg-gray-50/50 transition-colors items-center group"
              >
                {/* Date */}
                <div className="col-span-2">
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(review.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Customer */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={review.customerAvatar || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate" title={review.customer_id?.name || review.customerName}>
                      {review.customer_id?.name || review.customerName || "Anonymous Check"}
                    </div>
                    {review.customer_id?.email && (
                      <div className="text-xs text-gray-500 truncate" title={review.customer_id.email}>
                        {review.customer_id.email}
                      </div>
                    )}
                    <div className="text-[10px] uppercase tracking-wide text-teal-600 font-medium mt-0.5">Verified Booking</div>
                  </div>
                </div>

                {/* Service */}
                <div className="col-span-2">
                  <div className="text-sm font-medium text-gray-900 truncate" title={review.booking_id?.service_id?.subService3Name}>
                    {review.booking_id?.service_id?.subService3Name || "Service"}
                  </div>
                  <div className="text-xs text-gray-500 truncate" title={review.booking_id?.service_id?.serviceId?.name}>
                    {review.booking_id?.service_id?.serviceId?.name || "Category"}
                  </div>
                </div>

                {/* Rating */}
                <div className="col-span-2 flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${i < (review.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-100 text-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full mt-1">
                    {review.rating ? Number(review.rating).toFixed(1) : "0.0"} / 5.0
                  </span>
                </div>

                {/* Comment */}
                <div className="col-span-2 min-w-0">
                  {review.comment ? (
                    <div className="relative group/tooltip">
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        "{review.comment}"
                      </p>
                      {review.comment.length > 50 && (
                        <div className="opacity-0 group-hover/tooltip:opacity-100 transition-opacity absolute bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg w-64 shadow-xl pointer-events-none z-50">
                          {review.comment}
                          <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">No written review provided.</span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end relative">
                  <button
                    onClick={() => toggleMenu(review.id)}
                    className={`p-2 rounded-full transition-colors ${openMenuId === review.id
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <MoreVertical size={20} />
                  </button>

                  <MoreActionsDropdown
                    reviewId={review.id}
                    isOpen={openMenuId === review.id}
                    onClose={() => setOpenMenuId(null)}
                    onAction={handleAction}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-200 shadow-sm">
            No reviews received yet.
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id || review.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-teal-200 transition-colors"
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={review.customerAvatar || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{review.customer_id?.name || review.customerName || "Customer"}</div>
                    {review.customer_id?.email && (
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">
                        {review.customer_id.email}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>

                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => toggleMenu(review.id)}
                    className="p-1.5 -mr-2 text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical size={20} />
                  </button>
                  <MoreActionsDropdown
                    reviewId={review.id}
                    isOpen={openMenuId === review.id}
                    onClose={() => setOpenMenuId(null)}
                    onAction={handleAction}
                  />
                </div>
              </div>

              {/* Service Info Mobile */}
              <div className="mb-3 pb-3 border-b border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-500">Service:</div>
                  <div className="font-medium text-gray-900 text-right">
                    {review.booking_id?.service_id?.subService3Name || "Unknown Service"}
                    <span className="text-xs text-gray-400 block font-normal">
                      {review.booking_id?.service_id?.serviceId?.name || "Unknown Category"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${i < (review.rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-100 text-gray-200"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded ml-2">
                  {review.rating ? Number(review.rating).toFixed(1) : "0.0"}
                </span>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-1">
                {review.comment ? `"${review.comment}"` : <span className="italic text-gray-400">No comment provided</span>}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProviderReviews;
