import React, { useEffect, useState } from "react";
import { getAllReviews } from "../../apiservice/admin";
import {
  Loader2,
  Star,
  User,
  MessageSquare,
  Calendar,
  Mail,
  BadgeCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllReviews()
      .then((res) => {
        const responseData = res?.data || res;

        if (responseData.success) {
          setReviews(responseData.data || []);
        } else {
          setReviews([]);
        }
      })
      .catch(() => {
        toast.error("Failed to fetch reviews");
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Reviews & Ratings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor customer feedback and performance
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2 rounded-2xl shadow-lg shadow-blue-100">
          <p className="text-[10px] uppercase tracking-widest font-black opacity-70">
            Total Reviews
          </p>
          <p className="text-xl font-black">{reviews.length}</p>
        </div>
      </div>

      {/* Empty State */}
      {reviews.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-lg font-semibold text-gray-500">No reviews yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="group bg-white rounded-[1.5rem] border border-gray-100 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col relative overflow-hidden"
            >
              {/* Subtle accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

              {/* User Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform duration-500">
                      <User className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate flex items-center gap-1">
                      {review.customer_id?.name || "Anonymous"}
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                    </h3>
                    <div className="flex gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2.5 h-2.5 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                    <span className="text-lg font-black italic leading-none">
                      {review.rating}.0
                    </span>
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                  </div>
                  
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {review.rating === 5 ? "Elite" : review.rating >= 4 ? "Great" : "Good"}
                  </span>
                </div>
              </div>

              {/* Highlighted Review Comment */}
              <div className="relative mb-3 flex-grow">
                <div className="bg-gray-50/80 group-hover:bg-blue-50/50 rounded-xl p-3 border border-gray-100 group-hover:border-blue-100 transition-colors duration-500">
                  <p className="text-xs text-gray-700 leading-relaxed font-medium italic line-clamp-3">
                    {review.comment || "No comment provided"}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-gray-50 mt-auto flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Provider</p>
                  <p className="text-[11px] font-bold text-gray-700 truncate">
                    {review.provider_id?.name || "N/A"}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold mb-0.5">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "N/A"}
                  </div>
                  <span className="text-[9px] font-black text-gray-300">
                    #{review._id?.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;