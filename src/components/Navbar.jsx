import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Globe,
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
      setIsScrolled(window.scrollY > 0);
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
        { name: "My Bookings", href: "/my-bookings" },
        { name: "My Account", href: "/my-account" },
      ]
    : [
        { name: "Home", href: "/" },
        { name: "Services", href: "/services" },
        { name: "Become a Provider", href: "/#provider" },
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

  return (
    <>
      <nav
        className={`sticky top-0 left-0 right-0 z-40 bg-white transition-all duration-300 ${
          isScrolled ? "shadow-md py-3" : "border-b border-gray-100 py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                EF
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900 group-hover:text-teal-600 transition-colors">
                EasyFix<span className="text-teal-500">.</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    location.pathname === link.href
                      ? "text-teal-600 bg-teal-50"
                      : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      Welcome
                    </p>
                    <p className="text-sm font-black text-gray-900 leading-none">
                      {user?.name || "User"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-105"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm font-bold text-gray-600 hover:text-teal-600 px-4 py-2 hover:bg-gray-50 rounded-full transition-all"
                  >
                    Log In
                  </Link>
                  <button
                    className="group flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gray-900 rounded-full shadow-lg hover:bg-teal-600 hover:shadow-teal-200/50 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                    onClick={() => navigate("/login")}
                  >
                    Get Started
                    <ChevronRight
                      size={16}
                      className="text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                    />
                  </button>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <button
                className="p-2.5 rounded-xl bg-gray-50 text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`md:hidden fixed inset-0 z-50 bg-white transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-full pointer-events-none"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 flex justify-between items-center border-b border-gray-100">
              <Link
                to="/"
                className="flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-lg">
                  D
                </div>
                <span className="text-xl font-black text-gray-900">DoEz.</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Menu
                  </h3>
                  <div className="space-y-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-xl font-bold text-gray-900 py-3 border-b border-gray-50 active:text-teal-600 hover:text-teal-600 transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Contact
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600 font-medium">
                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                        <Phone size={16} />
                      </div>
                      +1 (555) 123-4567
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 font-medium">
                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                        <Mail size={16} />
                      </div>
                      support@doez.com
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-700 font-bold text-xl shadow-sm border border-gray-100">
                      {user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="font-bold text-lg text-gray-900">
                        {user?.name || "User"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold text-red-600 bg-white border border-red-100 rounded-xl shadow-sm hover:bg-red-50 transition-all"
                  >
                    <LogOut size={20} />
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    className="py-4 text-lg font-bold text-gray-700 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Log In
                  </button>
                  <button
                    className="py-4 text-lg font-bold text-white bg-gray-900 rounded-2xl hover:bg-gray-800 shadow-lg transition-colors"
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
