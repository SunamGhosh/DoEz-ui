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

  const { user } = useSelector((state) => state.auth);
  const socket = useSocket();

  // ────────────────────────────────────────────────
  // 1. Load initial reviews
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!user?._id) return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await getProviderReviews(user._id);
        const fetchedReviews = response.data?.reviews || response.data || [];
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching provider reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user?._id]);

  // ────────────────────────────────────────────────
  // 2. Real-time updates + join provider room
  // ────────────────────────────────────────────────
 // ──────────────────────────────────────────────────────────────
//  Real improved version with better debugging + loading safety
// ──────────────────────────────────────────────────────────────

useEffect(() => {
  let isMounted = true;

  const fetchReviews = async () => {
    if (!user?._id) {
      console.warn("[ProviderReviews] No user._id available yet → skipping fetch");
      if (isMounted) setLoading(false); // ← important: don't hang forever
      return;
    }

    console.log("[ProviderReviews] Starting fetch for provider:", user._id);

    try {
      setLoading(true);
      const response = await getProviderReviews(user._id);

      console.log("[ProviderReviews] API raw response:", response);

      const reviewsData = response?.data?.reviews || response?.data || [];
      console.log("[ProviderReviews] Parsed reviews count:", reviewsData.length);

      if (isMounted) {
        setReviews(reviewsData);
      }
    } catch (err) {
      console.error("[ProviderReviews] Fetch reviews failed:", err);

      // Very important: show more details
      if (err.response) {
        console.error("→ Server responded with:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        });
      } else if (err.request) {
        console.error("→ No response received (network/cors/timeout?):", err.request);
      } else {
        console.error("→ Error setting up request:", err.message);
      }

      // Optional: show error to user
      // setError("Failed to load reviews. Please try again.");
    } finally {
      console.log("[ProviderReviews] Fetch finished (success or error)");
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchReviews();

  return () => {
    isMounted = false;
  };
}, [user?._id]);   // ← only re-run when user._id actually changes

  // ────────────────────────────────────────────────
  // 3. Client-side sorting / filtering
  // ────────────────────────────────────────────────
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

    // Simple sorting for now (you can expand with real date filtering later)
    if (period === "Highest Rated") {
      updatedReviews.sort((a, b) => b.rating - a.rating);
    } else if (period === "Lowest Rated") {
      updatedReviews.sort((a, b) => a.rating - b.rating);
    } else if (period === "All Time") {
      updatedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    // TODO: add real date-based filtering for Today / This Month etc.

    setReviews(updatedReviews);
  };

  const toggleMenu = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleAction = (action, reviewId) => {
    console.log(`Action "${action}" on review ${reviewId}`);

    if (action === "Remove Review") {
      if (window.confirm("Are you sure you want to permanently remove this review?")) {
        // TODO: call delete API here
        alert("Review removal – API call placeholder");
        // Example:
        // await deleteReview(reviewId);
        // setReviews(prev => prev.filter(r => r._id !== reviewId));
      }
    }

    // Close menu after action
    setOpenMenuId(null);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading reviews...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Feedback</h1>
          <p className="text-gray-600 mt-1">
            All reviews received for your services — most recent first
          </p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-4xl font-bold text-teal-600">{reviews.length}</div>
          <div className="text-sm text-gray-500 mt-1">Total Reviews</div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
          <div className="col-span-3 relative">
            <button
              onClick={() => toggleMenu("period-filter")}
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
            >
              {selectedPeriod}
              <span className="text-xs opacity-70">Sort</span>
              {openMenuId === "period-filter" ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {openMenuId === "period-filter" && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 max-h-80 overflow-y-auto">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    className={`w-full text-left px-5 py-2.5 hover:bg-gray-50 transition ${
                      selectedPeriod === period
                        ? "bg-teal-50 text-teal-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-3">Provider</div>
          <div className="col-span-2 text-center">Rating</div>
          <div className="col-span-3">Comment</div>
          <div className="col-span-1">Actions</div>
        </div>

        <div>
          {reviews.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No reviews yet. When customers leave feedback, it will appear here in real-time.
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 hover:bg-gray-50/60 transition-colors last:border-b-0"
              >
                <div className="col-span-3 text-sm text-gray-600">
                  <div className="font-medium">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {new Date(review.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="col-span-3 flex items-center gap-3">
                  <img
                    src={review.customerAvatar || "https://via.placeholder.com/48"}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {review.customerName || "Customer"}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex justify-center items-center gap-1.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={`${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">({review.rating})</span>
                </div>

                <div className="col-span-3 min-w-0">
                  <div className="text-gray-800 line-clamp-2" title={review.comment}>
                    {review.comment || "No comment provided"}
                  </div>
                </div>

                <div className="col-span-1 flex items-center justify-end">
                  <div className="relative">
                    <button
                      onClick={() => toggleMenu(review._id)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                    >
                      More
                      {openMenuId === review._id ? (
                        <ChevronUp size={14} className="inline ml-1" />
                      ) : (
                        <ChevronDown size={14} className="inline ml-1" />
                      )}
                    </button>

                    <MoreActionsDropdown
                      reviewId={review._id}
                      isOpen={openMenuId === review._id}
                      onClose={() => setOpenMenuId(null)}
                      onAction={handleAction}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-5">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-200">
            No reviews received yet.
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="font-medium text-lg">
                    {review.customerName || "Customer"}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({review.rating})</span>
                  </div>

                  <p className="mt-3 text-gray-700 line-clamp-4">{review.comment}</p>

                  <div className="mt-4 text-xs text-gray-500 pt-3 border-t">
                    {new Date(review.createdAt).toLocaleDateString()} •{" "}
                    {new Date(review.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => toggleMenu(review._id)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                    aria-label="More actions"
                  >
                    <MoreVertical size={20} className="text-gray-500" />
                  </button>

                  <MoreActionsDropdown
                    reviewId={review._id}
                    isOpen={openMenuId === review._id}
                    onClose={() => setOpenMenuId(null)}
                    onAction={handleAction}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProviderReviews;