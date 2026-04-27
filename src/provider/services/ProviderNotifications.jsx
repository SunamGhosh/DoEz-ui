import React, { useState, useEffect } from "react";
import { getNotifications, markAsRead, deleteNotification } from "../../apiservice/notification";
import { Bell, Trash2, CheckCircle2, Zap, Calendar, PackageOpen, Send, User, MoreVertical, X, Eye, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ProviderNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    getNotifications()
      .then((res) => setNotifications(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch { toast.error("Failed to mark as read"); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleSendReply = async (id) => {
    if (!replyMessage.trim()) return;
    toast.promise(new Promise(r => setTimeout(r, 800)), { loading: "Sending...", success: "Sent!", error: "Failed" });
    setReplyingTo(null);
    setReplyMessage("");
  };

  const unread = notifications.filter(n => !n.isRead).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" /><p className="text-gray-500 text-sm">Loading notifications...</p></div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#1a1f36] rounded-2xl p-5 sm:p-7 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Provider</p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Notifications</h1>
            <p className="text-white/40 text-sm mt-1">Stay synced with your booking activities.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-xl font-extrabold text-white">{unread}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Unread</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-xl font-extrabold text-white">{notifications.length}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <PackageOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notifications.map((n, idx) => (
            <div
              key={n._id}
              className={`relative bg-white rounded-2xl border transition-all ${
                n.isRead ? "border-gray-100" : "border-blue-200 shadow-sm shadow-blue-500/5"
              }`}
              style={{ zIndex: activeMenu === n._id ? 50 : 10 }}
            >
              {!n.isRead && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl" />}

              <div className="p-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      {!n.isRead && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm leading-tight">{n.bookingId?.customer_id?.name || "System"}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">
                        {new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="relative">
                    <button onClick={() => setActiveMenu(activeMenu === n._id ? null : n._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeMenu === n._id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-50">

                          <button onClick={() => setActiveMenu(null)}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View details
                          </button>
                          <div className="h-px bg-gray-50 mx-2 my-1" />
                          <button onClick={() => { handleDelete(n._id); setActiveMenu(null); }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm text-gray-700 leading-relaxed mb-3 pl-11">{n.message}</p>

                {/* Booking info */}
                {n.bookingId && (
                  <div className="flex flex-wrap gap-3 bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center"><Zap className="w-3 h-3 text-blue-600" /></div>
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">Service</p>
                        <p className="text-xs font-bold text-gray-800">{n.bookingId.service_id?.serviceId?.name || "General"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center"><Calendar className="w-3 h-3 text-emerald-600" /></div>
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">Amount</p>
                        <p className="text-xs font-bold text-emerald-600">₹{n.bookingId.amount}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reply */}
                {!n.isRead && (
                  <button onClick={() => setReplyingTo(replyingTo === n._id ? null : n._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                    <Send className="w-3 h-3" /> Reply
                  </button>
                )}

                {replyingTo === n._id && (
                  <div className="mt-3 relative">
                    <input type="text" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type message..." autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleSendReply(n._id)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    <button onClick={() => handleSendReply(n._id)} disabled={!replyMessage.trim()}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 disabled:opacity-30 transition-colors">
                      <Send className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderNotifications;
