import React, { useEffect, useState } from "react";
import { getAllReviews } from "../../apiservice/admin";
import { Loader2, Star, User, MessageSquare, Quote, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const response = await getAllReviews();
            if (response.data.success) {
                setReviews(response.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
            />
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reviews & Ratings</h1>
                <p className="text-sm text-gray-500">Monitor all customer feedback and provider ratings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                <Quote className="w-24 h-24 rotate-180" />
                            </div>

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{review.customer_id?.name || 'Anonymous'}</div>
                                        <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-0.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                    {renderStars(review.rating)}
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <MessageSquare className="w-3 h-3" />
                                    Feedback
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed italic">
                                    "{review.comment}"
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <User className="w-3 h-3" />
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                        Reviewed: <span className="text-gray-900">{review.provider_id?.name || 'N/A'}</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono text-gray-300">#{review._id.slice(-6).toUpperCase()}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="md:col-span-2 py-20 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No reviews yet</h3>
                        <p className="text-gray-500">When customers leave feedback, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
