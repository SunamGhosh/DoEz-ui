import React, { useEffect, useState } from "react";
import { getAllReviews } from "../../apiservice/admin";
import { Loader2, Star, User, MessageSquare, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllReviews()
      .then((res) => { if (res.data.success) setReviews(res.data.data); })
      .catch(() => toast.error("Failed to fetch reviews"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">Reviews & Ratings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor all customer feedback</p>
      </div>

      {reviews.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-2xl border border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No reviews yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{review.customer_id?.name || "Anonymous"}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed italic mb-4">"{review.comment}"</p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <p className="text-[10px] font-semibold text-gray-400">
                  Provider: <span className="text-gray-700">{review.provider_id?.name || "N/A"}</span>
                </p>
                <span className="text-[10px] font-mono text-gray-300">#{review._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
