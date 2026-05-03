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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review) => (
            <div 
              key={review._id || review.id} 
              className="group bg-white rounded-[1.5rem] border border-gray-100 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col relative overflow-hidden"
            >
              {/* Violet accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-purple-600"></div>

              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center text-violet-600 group-hover:scale-105 transition-transform duration-500">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{review.customer_id?.name || review.customerName || "Customer"}</h3>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={10} className={i <= (review.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                    <span className="text-lg font-black italic leading-none">{review.rating}.0</span>
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                  </div>
                  <span className="text-[8px] font-black text-violet-600 uppercase tracking-widest bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
                    {review.rating === 5 ? "Elite" : review.rating >= 4 ? "Great" : "Good"}
                  </span>
                </div>
              </div>

              {/* Highlighted Comment */}
              <div className="relative mb-3 flex-grow">
                {review.comment ? (
                  <div className="bg-gray-50/80 group-hover:bg-violet-50/50 rounded-xl p-3 border border-gray-100 group-hover:border-violet-100 transition-colors duration-500">
                    <p className="text-xs text-gray-700 leading-relaxed italic font-medium line-clamp-3">
                      {review.comment}
                    </p>
                  </div>
                ) : (
                  <div className="py-3 text-center border-2 border-dashed border-gray-50 rounded-xl">
                    <p className="text-[10px] text-gray-300 italic">No feedback provided</p>
                  </div>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-tight font-bold text-gray-300">Service</span>
                  <p className="text-[11px] font-bold text-gray-700 truncate max-w-[120px]">
                    {review.booking_id?.service_id?.subService3Name || review.booking_id?.service_id?.serviceId?.name || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold mb-0.5">
                    <Calendar className="w-3 h-3 text-violet-500" />
                    {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                  </div>
                  <span className="block text-[9px] font-black text-gray-300 uppercase tracking-tighter">
                    #{(review._id || review.id || "").slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProviderReviews;
