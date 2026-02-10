import React, { useState, useEffect } from "react";
import { getNotifications, markAsRead } from "../../apiservice/notification";
import { Bell, Check, Clock, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const ProviderNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.data.data);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            toast.error("Failed to mark as read");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600">Stay updated with your latest booking activities</p>
                </div>
                <Bell className="h-8 w-8 text-teal-500" />
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="h-8 w-8 text-teal-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">All caught up!</h3>
                        <p className="text-gray-500">You don't have any new notifications at the moment.</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-sm flex items-start gap-4 ${notification.isRead ? "border-gray-100 opacity-75" : "border-teal-100 bg-teal-50/30"
                                }`}
                        >
                            <div className={`mt-1 p-2 rounded-xl ${notification.isRead ? "bg-gray-100" : "bg-teal-100"
                                }`}>
                                <Bell size={18} className={notification.isRead ? "text-gray-500" : "text-teal-600"} />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-bold ${notification.isRead ? "text-gray-700" : "text-gray-900"}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{notification.message}</p>

                                {notification.bookingId && (
                                    <div className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-100 space-y-2">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">Customer</span>
                                                <span className="text-gray-900 font-medium">{notification.bookingId.customer_id?.name || "N/A"}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">Price</span>
                                                <span className="text-teal-600 font-bold">₹{notification.bookingId.amount}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">Service Details</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <span className="bg-white px-2 py-1 rounded border border-gray-200 text-gray-700 text-xs">
                                                        {notification.bookingId.service_id?.serviceId?.name || "Service"}
                                                    </span>
                                                    <span className="bg-white px-2 py-1 rounded border border-gray-200 text-gray-700 text-xs">
                                                        {notification.bookingId.service_id?.subServiceId?.name || "Subservice"}
                                                    </span>
                                                    <span className="bg-white px-2 py-1 rounded border border-teal-200 text-teal-700 text-xs font-medium">
                                                        {notification.bookingId.service_id?.subService3Name || "Subservice 3"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!notification.isRead && (
                                    <button
                                        onClick={() => handleMarkRead(notification._id)}
                                        className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg transition-colors border border-teal-100"
                                    >
                                        <Check size={14} />
                                        Mark as Read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProviderNotifications;
