import React, { useEffect, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProviderBookings } from "../apiservice/provider";
import { getCustomerBookings } from "../apiservice/booking";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value._id?.toString() || value.toString();
  return value.toString();
};

const getPopupMeta = (role, message, booking) => {
  if (role === "provider") {
    return {
      allowed: message.senderModel === "Customer",
      senderName: booking?.customer_id?.name || "Customer",
      route: "/provider/bookings",
    };
  }

  return {
    allowed: message.senderModel === "Provider",
    senderName: booking?.provider_id?.name || "Provider",
    route: "/my-bookings",
  };
};

const ChatMessagePopup = ({ role }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    if (!role) return;
    const loadBookings = role === "provider" ? getProviderBookings : getCustomerBookings;
    loadBookings()
      .then((res) => setBookings(res.data?.data || []))
      .catch(() => {});
  }, [role]);

  useEffect(() => {
    if (!role) return;

    const handleReceiveMessage = (event) => {
      const message = event.detail;
      const bookingId = getId(message.bookingId);
      const booking = bookings.find((b) => getId(b._id) === bookingId);
      const meta = getPopupMeta(role, message, booking);

      if (!meta.allowed) return;

      if (!booking) {
        const loadBookings = role === "provider" ? getProviderBookings : getCustomerBookings;
        loadBookings()
          .then((res) => setBookings(res.data?.data || []))
          .catch(() => {});
      }

      setPopup({
        bookingId,
        route: meta.route,
        senderName: meta.senderName,
        serviceName: booking?.service_id?.subService3Name || "Booking chat",
        text: message.message,
      });
    };

    window.addEventListener("doez:receive-message", handleReceiveMessage);
    return () => window.removeEventListener("doez:receive-message", handleReceiveMessage);
  }, [role, bookings]);

  useEffect(() => {
    if (!popup) return;
    const timeout = setTimeout(() => setPopup(null), 8000);
    return () => clearTimeout(timeout);
  }, [popup]);

  if (!role || !popup) return null;

  return (
    <div className="fixed left-3 right-3 top-4 sm:left-auto sm:right-6 sm:top-6 sm:w-[430px] z-[3000]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          setPopup(null);
          navigate(popup.route);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setPopup(null);
            navigate(popup.route);
          }
        }}
        className="w-full text-left bg-white border border-violet-100 shadow-2xl rounded-2xl p-4 flex items-start gap-3 hover:shadow-violet-500/10 transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
          <MessageSquare size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-gray-900 break-words leading-snug">
            New message from {popup.senderName}
          </p>
          <p className="text-[11px] font-bold text-violet-600 uppercase mt-0.5 break-words leading-snug">
            {popup.serviceName}
          </p>
          <p className="text-sm text-gray-600 mt-1 break-words leading-relaxed line-clamp-2">
            {popup.text}
          </p>
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            setPopup(null);
          }}
          className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"
          aria-label="Close message popup"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default ChatMessagePopup;
