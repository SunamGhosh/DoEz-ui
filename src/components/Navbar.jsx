import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
} from "lucide-react";

/**
 * NAVBAR COMPONENT
 * Fixed alignment issues using Grid for desktop and improved the floating transition.
 */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Services", href: "#services" },
    { name: "Become a Provider", href: "#provider" },
    { name: "Help", href: "#help" },
  ];

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
          {/* Main Desktop Container: Using Grid to force true centering */}
          <div className="hidden md:grid grid-cols-3 items-center min-h-[48px]">
            
            {/* 1. Logo Slot (Left) */}
            <div className="flex justify-start">
              <a
                href="#home"
                className="text-2xl font-black bg-gradient-to-r from-teal-500 to-orange-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                DoEz
              </a>
            </div>

            {/* 2. Nav Links (Center - Perfectly Aligned) */}
            <div className="flex justify-center items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-semibold text-gray-600 hover:text-teal-600 transition-all duration-300 relative group whitespace-nowrap"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>

            {/* 3. Auth Actions (Right) */}
            <div className="flex justify-end items-center gap-4">
              <button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-teal-600 transition-colors">
                Login
              </button>
              <button className="px-6 py-2.5 text-sm font-bold text-white bg-teal-500 rounded-full shadow-md hover:bg-teal-600 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95">
                Join
              </button>
            </div>
          </div>

          {/* Mobile Header (Shown only on small screens) */}
          <div className="flex md:hidden items-center justify-between min-h-[44px]">
            <a href="#home" className="text-xl font-black bg-gradient-to-r from-teal-500 to-orange-500 bg-clip-text text-transparent">
              DoEz
            </a>
            <button
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          <div 
            className={`md:hidden absolute top-[calc(100%+12px)] left-0 right-0 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
              isMobileMenuOpen ? "max-h-[400px] opacity-100 p-6" : "max-h-0 opacity-0 p-0"
            }`}
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-bold text-gray-700 hover:text-teal-500 transition-colors p-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="h-px bg-gray-100 my-2" />
              <div className="grid grid-cols-2 gap-4">
                <button className="py-3 font-bold text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50">
                  Login
                </button>
                <button className="py-3 font-bold text-white bg-teal-500 rounded-2xl hover:bg-teal-600 shadow-md">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;