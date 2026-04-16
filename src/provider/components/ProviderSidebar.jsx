import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUnreadCount } from "../../apiservice/notification";
import {
  X,
  LayoutDashboard,
  Book,
  User,
  DollarSign,
  Settings,
  Bell,
  LogOut,
  ThumbsUp,
} from "lucide-react";
import { logout } from "../../store/authSlice";
import { useDispatch } from "react-redux";
import API from "../../api";

const menuItems = [
  { path: "/provider/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/provider/bookings", name: "My Bookings", icon: Book },
  { path: "/provider/profile", name: "Profile", icon: User },
  { path: "/provider/earnings", name: "Earnings", icon: DollarSign },
  {
    path: "/provider/notifications",
    name: "Notifications",
    icon: Bell,
    badge: true, // Marker for dynamic badge
  },
  { path: "/provider/settings", name: "Settings", icon: Settings },
  {
    path: "/provider/reviews$ratings",
    name: "Rating & Reviews",
    icon: ThumbsUp,
  },
];

const ProviderSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await getUnreadCount();
        setUnreadCount(res.data.data);
      } catch (err) {
        console.error("Failed to fetch unread count", err);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      dispatch(logout());
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <React.Fragment>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white text-gray-700
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static flex flex-col`}
      >
        <div className="shrink-0 px-6 py-2 border-b border-gray-200">
          <Link
            to="/provider/dashboard"
            className="flex items-center gap-3 group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform duration-200">
              EF
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900 group-hover:text-teal-600 transition-colors duration-200">
              EzFix
            </span>
          </Link>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-5 right-5 z-50 p-2 rounded-full hover:bg-gray-100 md:hidden"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="flex flex-col space-y-1 pr-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const badgeCount = item.badge ? unreadCount : null;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl 
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-teal-500/10 hover:text-teal-600"
                    }`}
                >
                  <Icon size={20} />
                  <span className="font-medium flex-1">{item.name}</span>
                  {badgeCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 
                       rounded-xl text-gray-700 
                       hover:bg-red-500/10 hover:text-red-400 
                       transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>

        <div className="shrink-0 px-4 py-5 border-t border-gray-200">
          <div className="px-4 py-3 rounded-xl bg-teal-50 text-center">
            <p className="text-xs font-semibold text-gray-600">
              Provider Dashboard
            </p>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </React.Fragment>
  );
};

export default ProviderSidebar;
