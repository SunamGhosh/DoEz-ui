import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUnreadCount } from "../../apiservice/notification";
import {
  LayoutDashboard, Book, User, DollarSign, Settings,
  Bell, LogOut, ThumbsUp, Sparkles, Menu, X,
} from "lucide-react";
import { logout } from "../../store/authSlice";
import { useDispatch } from "react-redux";
import API from "../../api";

const menuItems = [
  { path: "/provider/dashboard",      name: "Dashboard",       icon: LayoutDashboard },
  { path: "/provider/bookings",       name: "My Bookings",     icon: Book },
  { path: "/provider/profile",        name: "Profile",         icon: User },
  { path: "/provider/earnings",       name: "Earnings",        icon: DollarSign },
  { path: "/provider/notifications",  name: "Notifications",   icon: Bell, badge: true },
  { path: "/provider/settings",       name: "Settings",        icon: Settings },
  { path: "/provider/reviews$ratings",name: "Rating & Reviews",icon: ThumbsUp },
];

const ProviderSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Close on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Fetch unread count
  useEffect(() => {
    const fetch = async () => {
      try { const res = await getUnreadCount(); setUnreadCount(res.data.data); }
      catch {}
    };
    fetch();
    const t = setInterval(fetch, 30000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    try { await API.post("/auth/logout"); } catch {}
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const navContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-linear-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-white tracking-tight">EzFix</span>
            <span className="block text-[10px] text-white/40 font-medium uppercase tracking-widest">Provider</span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map(({ path, name, icon: Icon, badge }) => {
          const active = location.pathname === path;
          const count = badge ? unreadCount : 0;
          return (
            <Link
              key={name}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              }`}
            >
              <Icon size={17} className={active ? "text-white" : "text-white/50"} />
              <span className="flex-1">{name}</span>
              {count > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Hamburger (mobile only) */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="fixed top-3.5 left-4 z-50 w-9 h-9 bg-[#1a1f36] border border-white/10 rounded-xl flex items-center justify-center text-white shadow-lg md:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#1a1f36] border-r border-white/8 flex-col z-40">
        {navContent}
      </aside>

      {/* Mobile backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#1a1f36] z-50 flex flex-col md:hidden transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>
    </>
  );
};

export default ProviderSidebar;
