import React, { useState } from "react";
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

const reviews = [
  {
    id: 6,
    date: "04/10/2022",
    time: "04:15 PM",
    provider: "Maria Garcia",
    providerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    isReviewedAccount: false,
    rating: 4,
    comment:
      "Good work overall. Small adjustments needed but delivered on time as promised.",
    customer: "Daniel Brown",
    customerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
];

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
  const [selectedPeriod, setSelectedPeriod] = useState("All Time");
  const [openMenuId, setOpenMenuId] = useState(null);

  const periods = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "This Month",
    "This Year",
    "All Time",
  ];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setOpenMenuId(null);
    console.log("Filter changed to:", period);
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleAction = (action, reviewId) => {
    console.log(`Action "${action}" on review ${reviewId}`);

    if (action === "Remove Review") {
      if (
        window.confirm(
          "Are you sure you want to permanently remove this review?",
        )
      ) {
        alert("Review removed");
      }
    }

    setOpenMenuId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Feedback
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              All reviews, starting with the most recent, listed here
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-3xl sm:text-4xl font-bold text-teal-600">
              {reviews.length}
            </div>
            <div className="text-sm text-gray-500">Total Reviews</div>
          </div>
        </div>

        <div className="hidden md:block bg-white shadow-sm rounded-xl border border-gray-200">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
            <div className="col-span-3 relative">
              <button
                onClick={() => toggleMenu("date-filter")}
                className="flex items-center gap-1 hover:text-gray-900 transition-colors"
              >
                {selectedPeriod}
                <span className="text-xs opacity-70">Date</span>
                {openMenuId === "date-filter" ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {openMenuId === "date-filter" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-2xl z-[100] py-1 text-sm min-w-[180px]">
                  {periods.map((period) => (
                    <button
                      key={period}
                      onClick={() => handlePeriodChange(period)}
                      className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${
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

          <div className="overflow-hidden">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
              >
                <div className="col-span-3 text-gray-600 text-sm">
                  <div className="font-medium">{review.date}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {review.time}
                  </div>
                </div>

                <div className="col-span-3 flex items-center gap-3">
                  <img
                    src={review.providerAvatar}
                    alt={review.provider}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">
                      {review.provider}
                    </div>
                    {review.isReviewedAccount && (
                      <div className="text-xs text-teal-600 font-medium mt-0.5">
                        [Reviewed Account]
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2 flex justify-center items-center">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={`${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        } transition-colors`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    ({review.rating}/5)
                  </span>
                </div>

                <div className="col-span-3 min-w-0">
                  <div
                    className="font-medium text-gray-800 line-clamp-2"
                    title={review.comment}
                  >
                    {review.comment}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <img
                      src={review.customerAvatar}
                      alt={review.customer}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="truncate">{review.customer}</span>
                  </div>
                </div>

                <div className="col-span-1 flex items-center justify-end">
                  <div className="relative inline-block">
                    <button
                      onClick={() => toggleMenu(review.id)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      More
                      {openMenuId === review.id ? (
                        <ChevronUp size={14} className="inline ml-1" />
                      ) : (
                        <ChevronDown size={14} className="inline ml-1" />
                      )}
                    </button>

                    {openMenuId === review.id && (
                      <div className="fixed right-4 mt-1 z-[9999]">
                        <MoreActionsDropdown
                          reviewId={review.id}
                          isOpen={true}
                          onClose={() => toggleMenu(null)}
                          onAction={handleAction}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="font-medium text-lg">{review.provider}</div>
                  {review.isReviewedAccount && (
                    <div className="text-xs text-teal-600 mt-0.5">
                      [Reviewed Account]
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
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
                    <span>({review.rating}/5)</span>
                  </div>

                  <p className="mt-3 text-gray-700 line-clamp-4">
                    {review.comment}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <img
                      src={review.customerAvatar}
                      alt={review.customer}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="truncate">{review.customer}</span>
                  </div>
                </div>

                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => toggleMenu(review.id)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                    aria-label="More actions"
                  >
                    <MoreVertical size={22} className="text-gray-500" />
                  </button>

                  <MoreActionsDropdown
                    reviewId={review.id}
                    isOpen={openMenuId === review.id}
                    onClose={() => toggleMenu(null)}
                    onAction={handleAction}
                  />
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4 pt-3 border-t">
                {review.date} • {review.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProviderReviews;
