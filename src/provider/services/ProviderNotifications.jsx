import React, { useState, useEffect } from "react";
import { getNotifications, markAsRead, deleteNotification } from "../../apiservice/notification";
import { Bell, Check, Clock, Trash2, CheckCircle2, Zap, Calendar, PackageOpen, Send, MessageSquare, User, MoreVertical, X, Eye } from "lucide-react";
import toast from "react-hot-toast";

const ProviderNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [activeMenu, setActiveMenu] = useState(null);

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

    const handleSendReply = async (id) => {
        if (!replyMessage.trim()) return;

        try {
            // Mocking send reply as there is no backend endpoint
            toast.promise(
                new Promise((resolve) => setTimeout(resolve, 800)),
                {
                    loading: 'Sending reply...',
                    success: 'Reply sent successfully!',
                    error: 'Failed to send reply',
                }
            );
            setReplyingTo(null);
            setReplyMessage("");
        } catch (err) {
            toast.error("Failed to send reply");
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
        <div className="w-full max-w-[1400px] mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-700">
            {/* Premium Header Banner */}
            <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-400 shadow-[0_20px_60px_rgba(20,184,166,0.35)]">
                {/* Background decorations */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-4 right-40 w-24 h-24 bg-teal-300/20 rounded-full blur-2xl"></div>
                </div>

                <div className="relative px-7 py-6 sm:px-10 sm:py-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                    {/* Left: Title + subtitle */}
                    <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <Bell className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">Alert Center</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                            Notifications
                        </h1>
                        <p className="mt-1.5 text-teal-50/80 font-medium text-sm sm:text-base">
                            Stay synced with your booking activities
                        </p>
                    </div>

                    {/* Right: Stats chips + animated bell */}
                    <div className="flex items-center gap-4">
                        {/* Unread stat */}
                        <div className="flex flex-col items-center bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 min-w-[80px] shadow-inner">
                            <span className="text-2xl font-extrabold text-white leading-none">
                                {notifications.filter(n => !n.isRead).length}
                            </span>
                            <span className="text-[10px] font-bold text-teal-100/80 uppercase tracking-widest mt-0.5">Unread</span>
                        </div>
                        {/* Total stat */}
                        <div className="flex flex-col items-center bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 min-w-[80px]">
                            <span className="text-2xl font-extrabold text-white/90 leading-none">
                                {notifications.length}
                            </span>
                            <span className="text-[10px] font-bold text-teal-100/70 uppercase tracking-widest mt-0.5">Total</span>
                        </div>
                        {/* Animated Bell Icon */}
                        <div className="relative hidden sm:flex">
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                            <div className="relative w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                                <Bell className="w-7 h-7 text-white drop-shadow-md" />
                                {notifications.some(n => !n.isRead) && (
                                    <span className="absolute top-2 right-2 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400 border border-white/40"></span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom subtle divider wave */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>

            {/* Notifications List (2 Column Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-20">
                {notifications.length === 0 ? (
                    <div className="col-span-full bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
                        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <PackageOpen className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No notifications yet</h3>
                        <p className="text-slate-500 font-medium">We'll notify you when something important happens.</p>
                    </div>
                ) : (
                    notifications.map((notification, index) => (
                        <div
                            key={notification._id}
                            className={`group relative bg-white rounded-2xl overflow-visible transition-all duration-300 border 
                                ${notification.isRead
                                    ? "border-slate-100 opacity-90 hover:opacity-100"
                                    : "border-teal-100 shadow-[0_4px_20px_rgba(20,184,166,0.06)] hover:shadow-[0_8px_30px_rgba(20,184,166,0.1)]"
                                }`}
                            style={{ animationDelay: `${index * 50}ms`, zIndex: activeMenu === notification._id ? 50 : 10 }}
                        >
                            {!notification.isRead && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 rounded-l-2xl"></div>
                            )}

                            <div className="p-3.5 sm:p-4">
                                {/* Top Row: Avatar, Info, Menu */}
                                <div className="flex items-start justify-between gap-3 mb-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="relative">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                                                {notification.bookingId?.customer_id?.profilePic ? (
                                                    <img
                                                        src={notification.bookingId.customer_id.profilePic}
                                                        alt="User"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-4.5 h-4.5 text-slate-400" />
                                                )}
                                            </div>
                                            {!notification.isRead && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-500 border-2 border-white shadow-sm"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 leading-tight text-[13px] line-clamp-1">
                                                {notification.bookingId?.customer_id?.name || "System Alert"}
                                            </h4>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Menu Toggle */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveMenu(activeMenu === notification._id ? null : notification._id)}
                                            className={`p-1.5 rounded-lg transition-all ${activeMenu === notification._id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMenu === notification._id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setActiveMenu(null)}
                                                ></div>
                                                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={() => { handleMarkRead(notification._id); setActiveMenu(null); }}
                                                            className="w-full text-left px-3 py-2 text-[12px] font-bold text-teal-600 hover:bg-teal-50 flex items-center gap-2.5 transition-colors"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Mark as read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { setActiveMenu(null); /* Add view detail logic if needed */ }}
                                                        className="w-full text-left px-3 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        View details
                                                    </button>
                                                    <div className="h-px bg-slate-50 mx-2 my-1"></div>
                                                    <button
                                                        onClick={() => { handleDelete(notification._id); setActiveMenu(null); }}
                                                        className="w-full text-left px-3 py-2 text-[12px] font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete alert
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="pl-11.5">
                                    <p className="text-slate-700 font-medium leading-relaxed mb-3 text-[12.5px]">
                                        {/* <span className="font-extrabold text-slate-900 block mb-0.5 text-[13.5px]">{notification.title}</span> */}
                                        {notification.message}
                                    </p>

                                    {/* Booking Details (Simplified) */}
                                    {notification.bookingId && (
                                        <div className="bg-slate-50/70 rounded-xl p-3 mb-4 border border-slate-100/50 flex flex-wrap items-center gap-x-6 gap-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                                                    <Zap className="w-3.5 h-3.5 text-teal-600" />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">Service</span>
                                                    <span className="text-[12px] font-bold text-slate-800">
                                                        {notification.bookingId.service_id?.serviceId?.name || "General"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">Amount</span>
                                                    <span className="text-[12px] font-bold text-emerald-600">₹{notification.bookingId.amount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions Row (Condensed) */}
                                    {!notification.isRead && (
                                        <div className="flex items-center gap-4 pt-0.5">
                                            <button
                                                onClick={() => setReplyingTo(replyingTo === notification._id ? null : notification._id)}
                                                className="text-[12px] font-extrabold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 transition-colors bg-teal-50 px-3 py-1.5 rounded-lg"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                Send Message
                                            </button>
                                        </div>
                                    )}

                                    {/* Reply Input (Animated Slide) */}
                                    {replyingTo === notification._id && (
                                        <div className="mt-4 animate-in slide-in-from-top-4 duration-300">
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    value={replyMessage}
                                                    onChange={(e) => setReplyMessage(e.target.value)}
                                                    placeholder="Type message..."
                                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 pr-12 text-[12px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-teal-500/30 transition-all placeholder:text-slate-400 shadow-inner"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply(notification._id)}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleSendReply(notification._id)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 text-teal-500 hover:text-teal-600 flex items-center justify-center transition-all bg-transparent hover:bg-white rounded-lg"
                                                    disabled={!replyMessage.trim()}
                                                >
                                                    <Send className="w-4 h-4 rotate-45" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
