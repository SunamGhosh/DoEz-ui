import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Loader2, User, Calendar } from "lucide-react";
import { useSelector } from "react-redux";
import { getProviderReviews } from "../../apiservice/review";

function ProviderReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    getProviderReviews(user.id)
      .then((res) => {
        const data = res?.reviews || res?.data?.reviews || res?.data?.data || res?.data || [];
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" /><p className="text-gray-500 text-sm">Loading reviews...</p></div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden bg-[#1a1f36] rounded-2xl p-5 sm:p-7 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Provider</p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Ratings & Reviews</h1>
            <p className="text-white/40 text-sm mt-1">Customer feedback on your services.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-xl font-extrabold text-white">{avgRating}</p>
              <div className="flex justify-center gap-0.5 mt-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "text-white/20"} />)}
              </div>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Avg Rating</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-xl font-extrabold text-white">{reviews.length}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Total</p>
            </div>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium text-sm">No reviews yet</p>
          <p className="text-gray-300 text-xs mt-1">Reviews from completed bookings will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <div key={review._id || review.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{review.customer_id?.name || review.customerName || "Customer"}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />{new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={13} className={i <= (review.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                  ))}
                </div>
              </div>

              {review.comment && (
                <p className="text-sm text-gray-600 leading-relaxed italic mb-3">"{review.comment}"</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <p className="text-[10px] font-semibold text-gray-400">
                  Service: <span className="text-gray-700">{review.booking_id?.service_id?.subService3Name || review.booking_id?.service_id?.serviceId?.name || "—"}</span>
                </p>
                <span className="text-[10px] font-mono text-gray-300">#{(review._id || review.id || "").slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProviderReviews;
