import React from "react";
import { Link, useLocation } from "react-router-dom";
import { X, LayoutDashboard, Book, User, DollarSign } from "lucide-react";

const ProviderSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const navLinks = [
    { to: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/provider/bookings", label: "Bookings", icon: Book },
    { to: "/provider/profile", label: "Profile", icon: User },
    { to: "/provider/earnings", label: "Earnings", icon: DollarSign },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 md:hidden`}
      >
        <div className="flex justify-end items-center p-6 border-b border-gray-100">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === link.to
                      ? "bg-linear-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30"
                      : "text-gray-600 hover:bg-teal-50 hover:text-teal-600"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="hidden md:flex md:shrink-0">
        <div className="flex flex-col w-64 h-screen">
          <div className="flex flex-col flex-1 bg-white shadow-lg border-r border-gray-100 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                      location.pathname === link.to
                        ? "bg-linear-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30 scale-105"
                        : "text-gray-600 hover:bg-teal-50 hover:text-teal-600 hover:scale-105"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-100">
                <div className="px-4 py-3 bg-linear-to-r from-teal-50 to-orange-50 rounded-2xl">
                  <p className="text-xs font-semibold text-gray-600 text-center">
                    Provider Dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProviderSidebar;
