import React from 'react';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand Column */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white tracking-tighter">
              EasyFix<span className="text-teal-500">.</span>
            </h2>
            <p className="text-gray-400 leading-relaxed max-w-xs">
              Your trusted partner for all home services.
              Verified professionals, transparent pricing, and quality guaranteed.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-teal-600 transition-colors group">
                <Facebook size={18} className="text-gray-400 group-hover:text-white" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-teal-600 transition-colors group">
                <Twitter size={18} className="text-gray-400 group-hover:text-white" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-teal-600 transition-colors group">
                <Instagram size={18} className="text-gray-400 group-hover:text-white" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-teal-600 transition-colors group">
                <Linkedin size={18} className="text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-teal-500 rounded-full"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-teal-500 rounded-full"></span>
                  Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-teal-500 rounded-full"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-teal-500 rounded-full"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Popular Services</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/services" className="hover:text-teal-400 transition-colors">Cleaning Services</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-teal-400 transition-colors">Plumbing Solutions</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-teal-400 transition-colors">Electrical Repairs</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-teal-400 transition-colors">Appliance Repair</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-teal-400 transition-colors">Painting & Decor</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-teal-500 shrink-0 mt-1" />
                <span>123 Innovation Drive, Tech City, TC 90210</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-teal-500 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-teal-500 shrink-0" />
                <span>support@doez.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} DoEz Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
