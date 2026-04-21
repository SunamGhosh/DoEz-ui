import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Home,
  Briefcase,
  Info,
  Calendar,
  User,
  LogIn,
} from "lucide-react";
import { logout } from "../store/authSlice";
import API from "../api";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      navigate("/");
    }
  };

  const navItems = isAuthenticated
    ? [
        { name: "Home", href: "/", icon: Home },
        { name: "Services", href: "/services", icon: Briefcase },
        { name: "Bookings", href: "/my-bookings", icon: Calendar },
        { name: "Account", href: "/my-account", icon: User },
      ]
    : [
        { name: "Home", href: "/", icon: Home },
        { name: "Services", href: "/services", icon: Briefcase },
        { name: "Login", href: "/login", icon: LogIn },
      ];

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1f36]/98 backdrop-blur-xl border-t border-white/10 shadow-2xl shadow-black/40">
      <div className="flex items-center justify-around px-2 py-3 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ease-out min-w-[60px] active:scale-95"
            >
              <div
                className={`transition-all duration-300 ${
                  active ? "rotate-[8deg]" : ""
                }`}
              >
                <Icon
                  size={22}
                  className={`transition-all duration-300 ${
                    active
                      ? "text-blue-400 stroke-[2.5]"
                      : "text-white/60 stroke-2"
                  }`}
                  strokeWidth={2}
                />
              </div>
              <span
                className={`text-[10px] font-semibold transition-all duration-300 ${
                  active
                    ? "text-blue-400"
                    : "text-white/50"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
