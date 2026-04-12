import React, { useState, useEffect } from "react";
import { getNotifications, markAsRead, deleteNotification } from "../../apiservice/notification";
import { Bell, Check, Clock, Trash2, CheckCircle2, Zap, Calendar, PackageOpen } from "lucide-react";
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

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            setNotifications(notifications.filter(n => n._id !== id));
            toast.success("Notification deleted");
        } catch (err) {
            toast.error("Failed to delete notification");
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
        <div className="w-full max-w-[1400px] mx-auto px-4 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Section */}
            <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-teal-400/30 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.25),transparent)] pointer-events-none"></div>
                <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-sm flex items-center justify-center sm:justify-start gap-4">
                            Alert Center
                        </h1>
                        <p className="mt-2 text-teal-50 font-medium text-lg text-center sm:text-left">
                            Stay synced with your latest booking pulses
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-full shadow-inner flex items-center justify-center border border-white/20 relative z-10">
                            <Bell className="h-10 w-10 text-white drop-shadow-md" />
                            {notifications.some(n => !n.isRead) && (
                                <span className="absolute top-4 right-5 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white/10"></span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification List Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10 items-start">
                {notifications.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in zoom-in-95 duration-500">
                        <div className="bg-gradient-to-br from-teal-50/50 to-emerald-50/50 w-28 h-28 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-12 hover:rotate-0 transition-transform duration-500 shadow-inner">
                            <PackageOpen className="h-14 w-14 text-teal-300 drop-shadow-sm" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">You're all caught up!</h3>
                        <p className="text-slate-500 font-medium text-lg">Your dashboard looks spectacularly clean right now.</p>
                    </div>
                ) : (
                    notifications.map((notification, index) => (
                        <div
                            key={notification._id}
                            className={`group relative overflow-hidden bg-white rounded-[2rem] p-6 sm:p-8 transition-all duration-300
                                ${notification.isRead 
                                    ? "border border-slate-100 shadow-sm opacity-80 hover:opacity-100 hover:shadow-md" 
                                    : "border-2 border-teal-100 shadow-[0_8px_30px_rgb(20,184,166,0.12)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgb(20,184,166,0.15)] bg-gradient-to-br from-white to-teal-50/20"
                                }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {!notification.isRead && (
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-teal-400 to-emerald-500 rounded-l-full"></div>
                            )}
                            
                            <div className="flex flex-col gap-5 relative z-10">
                                {/* Header / Icon / Date */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className={`shrink-0 p-3 rounded-2xl ring-4 ${
                                        notification.isRead 
                                            ? "bg-slate-50 ring-slate-100 text-slate-400 group-hover:bg-slate-100" 
                                            : "bg-teal-50 ring-teal-100 text-teal-500 shadow-inner"
                                        } transition-colors flex items-center justify-center`}
                                    >
                                        <Zap className={`w-5 h-5 ${!notification.isRead && "animate-pulse"}`} />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 tracking-wider uppercase mt-1 bg-slate-50 px-2.5 py-1 rounded-lg">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>

                                {/* Main Content block */}
                                <div className="flex-1 w-full">
                                    <h3 className={`text-[1.15rem] font-extrabold tracking-tight mb-1.5 ${
                                        notification.isRead ? "text-slate-700" : "text-slate-900"
                                    }`}>
                                        {notification.title}
                                    </h3>
                                    <p className="text-slate-500 font-medium text-[0.95rem] leading-relaxed mb-5">
                                        {notification.message}
                                    </p>

                                    {/* Booking ID details if any */}
                                    {notification.bookingId && (
                                        <div className="bg-slate-50/80 rounded-2xl p-5 mb-5 border border-slate-100/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] backdrop-blur-sm">
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                                <div>
                                                    <span className="text-slate-400 block text-[10px] uppercase tracking-[0.15em] font-extrabold mb-1">Customer Client</span>
                                                    <span className="text-slate-800 font-bold block truncate">{notification.bookingId.customer_id?.name || "N/A"}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-[10px] uppercase tracking-[0.15em] font-extrabold mb-1">Total Valuation</span>
                                                    <span className="text-emerald-600 font-extrabold text-lg">₹{notification.bookingId.amount}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-slate-400 block text-[10px] uppercase tracking-[0.15em] font-extrabold mb-2">Service Breakdown</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-bold shadow-sm line-clamp-1">
                                                            {notification.bookingId.service_id?.serviceId?.name || "General Service"}
                                                        </span>
                                                        <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-semibold shadow-sm line-clamp-1">
                                                            {notification.bookingId.service_id?.subServiceId?.name || "Standard Request"}
                                                        </span>
                                                        <span className="bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 text-teal-700 text-[11px] font-extrabold shadow-sm tracking-wide line-clamp-1">
                                                            {notification.bookingId.service_id?.subService3Name || "Base Unit"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action items underneath */}
                                    <div className="flex justify-end pt-1">
                                        {!notification.isRead ? (
                                            <button
                                                onClick={() => handleMarkRead(notification._id)}
                                                className="group/btn relative overflow-hidden flex items-center gap-2 text-sm font-bold text-white bg-slate-900 hover:bg-teal-600 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-0 group-hover/btn:w-full transition-all duration-300 ease-out"></div>
                                                <CheckCircle2 className="w-4 h-4 relative z-10" />
                                                <span className="relative z-10">Sign off as Read</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDelete(notification._id)}
                                                className="flex items-center gap-2 text-sm font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-all border border-rose-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProviderNotifications;
