import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Wrench, CalendarCheck, Star, LogOut,
  Menu, X, IndianRupee, LayoutGrid, ShieldCheck, Settings, SquareStack, Sparkles,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard",       icon: LayoutDashboard, path: "/admin" },
  { name: "Users",           icon: Users,           path: "/admin/users" },
  { name: "Providers",       icon: Wrench,          path: "/admin/provider" },
  { name: "Commissions",     icon: IndianRupee,     path: "/admin/commissions" },
  { name: "Services",        icon: LayoutGrid,      path: "/admin/services" },
  { name: "Sub Services",    icon: SquareStack,     path: "/admin/sub-services" },
  { name: "Sub Services 1",  icon: SquareStack,     path: "/admin/sub-services1" },
  { name: "Sub Services 2",  icon: SquareStack,     path: "/admin/sub-services2" },
  { name: "Sub Services 3",  icon: SquareStack,     path: "/admin/sub-services3" },
  { name: "Bookings",        icon: CalendarCheck,   path: "/admin/bookings" },
  { name: "Reviews",         icon: Star,            path: "/admin/reviews" },
  { name: "Admins",          icon: ShieldCheck,     path: "/admin/adminadd" },
  { name: "Settings",        icon: Settings,        path: "/admin/settings" },
];

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.clear();
    navigate("/admin-login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-extrabold text-white tracking-tight">EzFix</span>
          <span className="block text-[10px] text-white/40 font-medium uppercase tracking-widest">Admin Panel</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map(({ name, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={name}
              to={path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
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
      <div className="px-3 py-4 border-t border-white/10">
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
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 w-9 h-9 bg-[#1a1f36] border border-white/10 rounded-xl flex items-center justify-center text-white shadow-lg md:hidden"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#1a1f36] border-r border-white/8 flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-[#1a1f36] z-50 flex flex-col md:hidden">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
};

export default AdminSidebar;
