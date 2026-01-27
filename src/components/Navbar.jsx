import React, { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import API from "../api";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = isAuthenticated
    ? [
        { name: "Home", href: "/" },
        { name: "Services", href: "/#services" },
        { name: "My Bookings", href: "/my-bookings" },
        { name: "Help", href: "/#help" },
      ]
    : [
        { name: "Home", href: "#home" },
        { name: "Services", href: "#services" },
        { name: "Become a Provider", href: "#provider" },
        { name: "Help", href: "#help" },
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled ? "py-2" : "py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative rounded-full transition-all duration-500 ease-in-out px-6 py-2 ${
            isScrolled
              ? "bg-white/90 backdrop-blur-md shadow-lg border border-gray-100"
              : "bg-white/70 backdrop-blur-sm border border-transparent shadow-sm"
          }`}
        >
          <div className="hidden md:grid grid-cols-3 items-center min-h-[48px]">
            <div className="flex justify-start">
              <Link
                to="/"
                className="text-2xl font-black bg-gradient-to-r from-teal-500 to-orange-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                DoEz
              </Link>
            </div>

            <div className="flex justify-center items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-semibold text-gray-600 hover:text-teal-600 transition-all duration-300 relative group whitespace-nowrap"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            <div className="flex justify-end items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm font-semibold text-gray-700">
                    Hi, {user?.name || "User"}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-teal-600 transition-colors"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </button>
                  <button
                    className="px-6 py-2.5 text-sm font-bold text-white bg-teal-500 rounded-full shadow-md hover:bg-teal-600 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                    onClick={() => navigate("/login")}
                  >
                    Join
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex md:hidden items-center justify-between min-h-[44px]">
            <Link
              to="/"
              className="text-xl font-black bg-gradient-to-r from-teal-500 to-orange-500 bg-clip-text text-transparent"
            >
              DoEz
            </Link>
            <button
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div
            className={`md:hidden absolute top-[calc(100%+12px)] left-0 right-0 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
              isMobileMenuOpen
                ? "max-h-[400px] opacity-100 p-6"
                : "max-h-0 opacity-0 p-0"
            }`}
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-lg font-bold text-gray-700 hover:text-teal-500 transition-colors p-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-gray-100 my-2" />
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500">Logged in as</p>
                    <p className="font-bold text-gray-900">
                      {user?.name || "User"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 font-bold text-red-600 border-2 border-red-200 rounded-2xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    className="py-3 font-bold text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </button>
                  <button
                    className="py-3 font-bold text-white bg-teal-500 rounded-2xl hover:bg-teal-600 shadow-md"
                    onClick={() => navigate("/login")}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
