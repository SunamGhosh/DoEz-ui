import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  LogOut,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import API from "../api";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = isAuthenticated
    ? [
        { name: "Home", href: "/" },
        { name: "Services", href: "/services" },
        { name: "About", href: "/about" },
        { name: "My Bookings", href: "/my-bookings" },
        { name: "My Account", href: "/my-account" },
      ]
    : [
        { name: "Home", href: "/" },
        { name: "Services", href: "/services" },
        { name: "About", href: "/about" },
        { name: "Become a Provider", href: "/login" },
      ];

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

  const shouldFloatNavbar = isScrolled || isMobileMenuOpen;

  return (
    <nav
      className={`fixed z-50 transition-all duration-300 ${
        shouldFloatNavbar ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`flex items-center justify-between px-6 py-3 transition-all duration-300 ${
            shouldFloatNavbar
              ? "rounded-full bg-[#1a1f36]/95 backdrop-blur-2xl shadow-2xl shadow-black/15 border border-white/10"
              : "rounded-none bg-[#1a1f36] backdrop-blur-xl border-b border-white/10"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              EzFix
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`relative pb-1 text-[15px] font-medium transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-white after:rounded-full after:transition-all after:duration-300 after:ease-out ${
                  location.pathname === link.href
                    ? "text-white after:w-full"
                    : "text-white/70 hover:text-white after:w-0 hover:after:w-full"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="text-right">
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                    Welcome
                  </p>
                  <p className="text-sm font-bold text-white leading-none">
                    {user?.name || "User"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/70 hover:text-red-400 hover:bg-white/5 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:translate-y-[-1px] active:translate-y-0 transition-all"
              >
                Login / Signup
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 bg-[#1a1f36]/95 backdrop-blur-2xl rounded-2xl border border-white/10 px-6 py-5 space-y-4 animate-fadeIn">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-2.5 font-medium transition-colors ${
                    location.pathname === link.href
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Signed in as</p>
                      <p className="font-bold text-white">
                        {user?.name || "User"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-400 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full shadow-lg"
                >
                  Login / Signup
                </button>
              )}
            </div>

            {/* Contact Info (Mobile Only) */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Phone size={14} /> +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Mail size={14} /> support@ezfiz.com
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
