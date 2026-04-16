import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Wrench, CalendarCheck, Star, LogOut,
  Menu, X, IndianRupee, LayoutGrid, ShieldCheck, SquareStack, Sparkles,
} from "lucide-react";
import { logout } from "../../store/authSlice";
import { useDispatch } from "react-redux";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Providers", icon: Wrench, path: "/admin/provider" },
  { name: "Commissions", icon: IndianRupee, path: "/admin/commissions" },
  { name: "Services", icon: LayoutGrid, path: "/admin/services" },
  { name: "Sub Services", icon: SquareStack, path: "/admin/sub-services" },
  { name: "Sub Services 1", icon: SquareStack, path: "/admin/sub-services1" },
  { name: "Sub Services 2", icon: SquareStack, path: "/admin/sub-services2" },
  { name: "Sub Services 3", icon: SquareStack, path: "/admin/sub-services3" },
  { name: "Bookings", icon: CalendarCheck, path: "/admin/bookings" },
  { name: "Reviews", icon: Star, path: "/admin/reviews" },
  { name: "Admins", icon: ShieldCheck, path: "/admin/adminadd" },
];

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleLogout = async () => {
    try { await API.post("/auth/logout"); } catch { }
    localStorage.clear();
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
            <span className="block text-[10px] text-white/40 font-medium uppercase tracking-widest">Admin Panel</span>
          </div>
        </div>
        {/* Close button inside drawer — mobile only */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map(({ name, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={name}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
            >
              <Icon size={17} className={active ? "text-white" : "text-white/50"} />
              {name}
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
      {/* ── Hamburger button (mobile only) ── */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="fixed top-3.5 left-4 z-50 w-9 h-9 bg-[#1a1f36] border border-white/10 rounded-xl flex items-center justify-center text-white shadow-lg md:hidden"
      >
        <Menu size={18} />
      </button>

      {/* ── Desktop sidebar (always visible ≥ md) ── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#1a1f36] border-r border-white/8 flex-col z-40">
        {navContent}
      </aside>

      {/* ── Mobile backdrop ── */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* ── Mobile drawer (slides in/out) ── */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#1a1f36] z-50 flex flex-col md:hidden transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {navContent}
      </aside>
    </>
  );
};

export default AdminSidebar;
