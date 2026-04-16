import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wrench,
  CalendarCheck,
  Star,
  LogOut,
  Menu,
  X,
  IndianRupee,
  LayoutGrid,
  ShieldCheck,
  Languages,
  Settings,
  SquareStack
} from "lucide-react";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "User Management", icon: Users, path: "/admin/users" },
    { name: "Service Providers", icon: Wrench, path: "/admin/provider" },
    { name: "Commissions", icon: IndianRupee, path: "/admin/commissions" },
    { name: "Services", icon: LayoutGrid, path: "/admin/services" },
    { name: "Sub Services", icon: SquareStack, path: "/admin/sub-services" },
    { name: "Sub Services 1", icon: SquareStack, path: "/admin/sub-services1" },
    { name: "Sub Services 2", icon: SquareStack, path: "/admin/sub-services2" },
    { name: "Sub Services 3", icon: SquareStack, path: "/admin/sub-services3" },
    { name: "Bookings", icon: CalendarCheck, path: "/admin/bookings" },
    { name: "Reviews", icon: Star, path: "/admin/reviews" },
    { name: "Admins", icon: ShieldCheck, path: "/admin/adminadd" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const handleLogout = () => {
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.clear();
    navigate("/admin-login");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg 
                   bg-linear-to-r from-teal-500 to-emerald-500 
                   text-white shadow-lg md:hidden"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 
        bg-linear-to-b from-slate-900 to-slate-800
        text-slate-200 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static`}
      >
        <div
          className="h-16 flex items-center justify-center 
                        bg-linear-to-r from-teal-500 to-emerald-500"
        >
          <h1 className="text-xl font-extrabold text-white tracking-wide">
            EzFix Admin
          </h1>
        </div>

        <nav className="px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl 
                  transition-all duration-200
                  ${isActive
                    ? "bg-linear-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                    : "hover:bg-teal-500/10 hover:text-white"
                  }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}

          <div className="border-t border-slate-700 my-6" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 
                       rounded-xl text-slate-300 
                       hover:bg-red-500/10 hover:text-red-400 
                       transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </>
  );
};

export default AdminSidebar;
