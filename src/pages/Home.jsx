import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Sparkles,
  Droplets,
  Zap,
  Wrench,
  Paintbrush,
  Hammer,
  Flower2,
  Tv,
  ArrowRight,
  Star,
  Shield,
  Clock,
  Heart,
  ChevronRight,
  Quote,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Download,
  Search,
  CalendarDays,
  Send,
  Globe,
  CreditCard,
  Users,
  BadgeCheck,
  Headphones,
  DollarSign,
  CircleCheckBig,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Wind,
  LogOut,
  Home as HomeIcon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import API from "../api";
import { getServices } from "../apiservice/service";
import { getAllReviews } from "../apiservice/review";
import { getImageUrl } from "../utils/imageUtils";
import Reveal from "../components/Reveal";
import MobileBottomNav from "../components/MobileBottomNav";
import ezFixLogo from "../assets/images/EzFixLogo.jpeg";

const Home = () => {
  const [services, setServices] = useState([]);
  const [serviceRatings, setServiceRatings] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, authChecked } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authChecked && isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "provider") {
        navigate("/provider/dashboard");
      }
    }
  }, [authChecked, isAuthenticated, user, navigate]);

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

  const serviceIcons = {
    CLEANING: <Sparkles className="w-6 h-6" />,
    PLUMBING: <Droplets className="w-6 h-6" />,
    ELECTRICAL: <Zap className="w-6 h-6" />,
    MECHANICAL: <Wrench className="w-6 h-6" />,
    PAINTING: <Paintbrush className="w-6 h-6" />,
    CARPENTRY: <Hammer className="w-6 h-6" />,
    GARDENARING: <Flower2 className="w-6 h-6" />,
    APPLIANCE: <Tv className="w-6 h-6" />,
  };

  // Always start at the top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, reviewsRes] = await Promise.all([
          getServices(),
          getAllReviews().catch(() => ({ data: { data: [] } }))
        ]);
        
        const servicesData = servicesRes.data?.data || servicesRes.data || [];
        setServices(servicesData);

        const reviewsData = reviewsRes.data?.data || [];
        const ratingsMap = {};
        
        reviewsData.forEach(review => {
          if (review.isVisible && review.booking_id?.service_id?.serviceId) {
            const sId = review.booking_id.service_id.serviceId._id || review.booking_id.service_id.serviceId;
            const serviceIdStr = sId.toString();
            if (!ratingsMap[serviceIdStr]) {
              ratingsMap[serviceIdStr] = { total: 0, count: 0 };
            }
            ratingsMap[serviceIdStr].total += review.rating;
            ratingsMap[serviceIdStr].count += 1;
          }
        });

        const computedRatings = {};
        Object.keys(ratingsMap).forEach(key => {
          computedRatings[key] = (ratingsMap[key].total / ratingsMap[key].count).toFixed(1);
        });
        
        setServiceRatings(computedRatings);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        document
          .getElementById(location.hash.slice(1))
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.hash]);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const getDisplayPrice = (priceStr, discount) => {
    if (!priceStr) return null;
    const num = Number(priceStr);
    if (!isNaN(num)) {
      return discount ? Math.round(num - (num * discount) / 100) : num;
    }
    if (typeof priceStr === "string" && priceStr.includes("-")) {
      const parts = priceStr.split("-");
      if (parts.length === 2) {
        const lower = Number(parts[0].trim());
        const upper = Number(parts[1].trim());
        if (!isNaN(lower) && !isNaN(upper)) {
          const newLower = discount ? Math.round(lower - (lower * discount) / 100) : lower;
          const newUpper = discount ? Math.round(upper - (upper * discount) / 100) : upper;
          return `${newLower}-${newUpper}`;
        }
      }
    }
    return priceStr;
  };

  return (
    <div className="min-h-screen bg-white antialiased overflow-x-hidden pb-20 lg:pb-0">{/* Added pb-20 for mobile bottom nav */}
      {/* ═══════════════════════════════════════════
          NAVBAR — dark navy, fixed, pill CTA
      ═══════════════════════════════════════════ */}
      <nav
        className={`fixed z-50 transition-all duration-300 ${scrolled || mobileMenuOpen ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
          }`}
      >
        <div className={scrolled || mobileMenuOpen ? "max-w-7xl mx-auto" : "w-full"}>
          <div
            className={`flex items-center justify-between px-6 py-3 transition-all duration-300 ${scrolled
                ? "rounded-full bg-[#1a1f36]/90 backdrop-blur-2xl shadow-2xl shadow-black/15 border border-white/10"
                : "rounded-none bg-white/10 backdrop-blur-xl border-b border-white/15"
              }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={ezFixLogo} alt="EzFix" className="h-8 w-auto object-contain rounded-md" />
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-8">
              {(isAuthenticated ? [
                { label: "Home", href: "/" },
                { label: "Services", href: "/services" },
                { label: "About", href: "/about" },
                { label: "How it works", href: "/#how-it-works" },
                { label: "My Bookings", href: "/my-bookings" },
                { label: "My Account", href: "/my-account" },
              ] : [
                { label: "Home", href: "/" },
                { label: "Services", href: "/services" },
                { label: "About", href: "/about" },
                { label: "How it works", href: "/#how-it-works" },
              ]).map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="relative pb-1 text-[15px] font-medium text-white/70 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-white after:rounded-full after:transition-all after:duration-300 after:ease-out hover:after:w-full"
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* Login / Signup */}
            {/* Right Side (Auth / CTA) */}
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
                  state={{ backgroundLocation: location }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:translate-y-[-1px] active:translate-y-0 transition-all"
                >
                  Login / Signup
                </Link>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu - Only About and How it works */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-2 bg-[#1a1f36]/95 backdrop-blur-2xl rounded-2xl border border-white/10 px-6 py-5 space-y-3 animate-fadeIn">
              <a
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 text-center text-white/80 font-medium hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 text-center text-white/80 font-medium hover:text-white transition-colors"
              >
                How it works
              </a>
              <div className="pt-4 border-t border-white/10">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.name?.[0] || "U"}
                      </div>
                      <div className="text-center">
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
                      setMobileMenuOpen(false);
                      navigate("/login", { state: { backgroundLocation: location } });
                    }}
                    className="w-full px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full shadow-lg"
                  >
                    Login / Signup
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO — gradient bg, floating UI cards
      ═══════════════════════════════════════════ */}
      <section id="home" className="relative overflow-hidden">
        {/* gradient background from dark navy to blue */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f36] via-[#1e2a4a] to-[#2563eb]" />
        {/* subtle radial glow */}
        <div className="absolute top-1/2 right-0 w-[70%] h-[120%] -translate-y-1/2 bg-gradient-to-l from-blue-500/20 via-blue-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 lg:pt-40 pb-20 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                Book trusted home{" "}
                <span className="relative inline-block">
                  services
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 8 C50 3, 150 3, 196 8"
                      stroke="#22c55e"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>{" "}
                for your home
              </h1>
              <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg">
                Our platform connects you with verified professionals for any
                home service. Set it up once, and enjoy hassle-free bookings
                forever.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollTo("services")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:translate-y-[-2px] active:translate-y-0 transition-all"
                >
                  Get started <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTo("how-it-works")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all"
                >
                  Learn more
                </button>
              </div>
            </div>

            {/* Right — floating UI card mockups */}
            <div className="relative h-[420px] lg:h-[480px] hidden md:block overflow-hidden">
              {/* Card 1 — main booking card (front) */}
              <div className="absolute top-8 right-0 w-[300px] bg-white rounded-2xl shadow-2xl shadow-black/20 p-6 transform rotate-3 hover:rotate-1 transition-transform duration-500 z-30">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <HomeIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      Home Cleaning
                    </div>
                    <div className="text-xs text-gray-400">Premium Service</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-500">Date</span>
                    <span className="text-xs font-semibold text-gray-800">
                      Feb 16, 2026
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-500">Time Slot</span>
                    <span className="text-xs font-semibold text-gray-800">
                      10:00 AM
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-lg font-extrabold text-gray-900">
                      ₹1,499
                    </span>
                  </div>
                </div>
                <button className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                  Book Now
                </button>
              </div>

              {/* Card 2 — provider card (behind, tilted) */}
              <div className="absolute top-24 right-52 w-[260px] bg-[#1e293b] rounded-2xl shadow-2xl shadow-black/30 p-5 transform -rotate-6 hover:-rotate-3 transition-transform duration-500 z-20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    RP
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      Raj Patel
                    </div>
                    <div className="text-xs text-gray-400">
                      Verified Professional
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    4.9 (328 reviews)
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-medium text-white/80">
                    Plumbing
                  </span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-medium text-white/80">
                    Electrical
                  </span>
                </div>
              </div>

              {/* Floating badge — Verified */}
              <div className="absolute bottom-16 right-8 bg-white rounded-xl shadow-xl shadow-black/10 px-4 py-3 flex items-center gap-3 z-40">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    Verified Pro
                  </div>
                  <div className="text-[11px] text-gray-400">ID Checked</div>
                </div>
              </div>

              {/* Floating badge — instant booking */}
              <div className="absolute top-0 left-0 lg:left-8 bg-white rounded-xl shadow-xl shadow-black/10 px-4 py-3 flex items-center gap-3 z-40">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">30 min</div>
                  <div className="text-[11px] text-gray-400">Avg. arrival</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path d="M0 60V30C360 0 1080 0 1440 30V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES — 3-column minimal icon boxes
      ═══════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white">
        <Reveal>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-10 lg:gap-14">
              {[
                {
                  icon: <Shield className="w-6 h-6 text-blue-600" />,
                  bg: "bg-blue-50",
                  title: "Verified professionals",
                  desc: "Every service provider is background-verified and skill-tested. We ensure only the best professionals join our platform.",
                },
                {
                  icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
                  bg: "bg-emerald-50",
                  title: "Transparent pricing",
                  desc: "No hidden charges. See the full price upfront before you book. What you see is exactly what you pay, every time.",
                },
                {
                  icon: <Headphones className="w-6 h-6 text-violet-600" />,
                  bg: "bg-violet-50",
                  title: "24/7 Customer support",
                  desc: "Real humans ready to help at any hour. Whether it's a booking issue or an emergency, we've got your back.",
                },
              ].map((f, i) => (
                <div key={i} className="group">
                  <div
                    className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-[15px]">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          DARK SECTION — trust + floating cards + testimonial
      ═══════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Dark background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f36] via-[#1e2a4a] to-[#0f172a]" />
        {/* Subtle circular glow */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <Reveal>
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left — text with testimonial */}
              <div>
                {/* Testimonial quote */}
                <div className="flex items-start gap-4 mb-10">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face"
                    alt="Customer"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 shrink-0"
                  />
                  <p className="text-white/70 text-[15px] leading-relaxed italic">
                    " We've tried many platforms and this product provides the
                    speed, reliability and an API-first approach that no one
                    else can. "
                  </p>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                  Build a flexible{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    home service
                  </span>{" "}
                  plan for your needs
                </h2>
                <p className="text-white/50 text-[15px] leading-relaxed mb-8 max-w-lg">
                  Whether it's a one-time deep clean or recurring maintenance,
                  EzFix adapts to your lifestyle. Customise schedules, choose
                  favourite providers, and manage everything from one dashboard.
                </p>

                <div className="flex flex-wrap gap-6">
                  {[
                    { val: "50+", label: "Cities" },
                    { val: "12K+", label: "Bookings" },
                    { val: "98%", label: "Satisfaction" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-2xl font-extrabold text-white">
                        {s.val}
                      </div>
                      <div className="text-xs text-white/40 font-medium">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — floating service cards */}
              <div className="relative h-[400px] hidden lg:block overflow-hidden">
                {/* Service card 1 */}
                <div className="absolute top-0 right-0 w-[280px] bg-gradient-to-br from-[#2d3555] to-[#1e293b] rounded-2xl p-5 shadow-2xl border border-white/10 transform rotate-6 hover:rotate-3 transition-transform duration-500 z-20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-bold text-white">
                        Electrical
                      </span>
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold">
                      Active
                    </span>
                  </div>
                  <div className="space-y-3 text-white/70 text-xs">
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span>Wiring Repair</span>
                      <span className="text-white font-semibold">₹599</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span>Switch Replacement</span>
                      <span className="text-white font-semibold">₹299</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Full Inspection</span>
                      <span className="text-white font-semibold">₹999</span>
                    </div>
                  </div>
                </div>

                {/* Service card 2 */}
                <div className="absolute top-20 right-44 w-[260px] bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 shadow-2xl transform -rotate-3 hover:-rotate-1 transition-transform duration-500 z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      Cleaning
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/80">
                        Next booking
                      </span>
                      <span className="text-xs text-white font-semibold">
                        Tomorrow
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-white/60 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {["A", "M", "S"].map((l, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 bg-white/20 rounded-full border-2 border-blue-600 flex items-center justify-center text-[10px] font-bold text-white"
                        >
                          {l}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-white/60">
                      +4 pros available
                    </span>
                  </div>
                </div>

                {/* Floating price tag */}
                <div
                  className="absolute bottom-12 right-4 bg-white rounded-xl px-4 py-3 shadow-xl z-30"
                  style={{ animation: "float 4.5s ease-in-out infinite" }}
                >
                  <div className="text-[11px] text-gray-400 mb-0.5">
                    Starting at
                  </div>
                  <div className="text-xl font-extrabold text-gray-900">
                    ₹499
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          SERVICES GRID — categories
      ═══════════════════════════════════════════ */}
      <section id="services" className="py-20 lg:py-28 bg-gray-50">
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                Explore our services
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                From electrical to deep cleaning, find verified professionals
                for every corner of your home.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {services.map((service) => (
                <div
                  key={service._id}
                  onClick={() => navigate(`/services`, { state: { autoSelectId: service._id } })}
                  className="group bg-white rounded-2xl cursor-pointer border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Image / icon area */}
                  <div className="aspect-[4/3] relative bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                    {service.image ? (
                      <img
                        src={getImageUrl(service.image)}
                        alt={service.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-200 rounded-2xl flex items-center justify-center transition-colors duration-300">
                          <div className="text-blue-600">
                            {serviceIcons[service.name] || <Sparkles className="w-6 h-6" />}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-full shrink-0 ml-2">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        {serviceRatings[service._id] || "New"}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                      {service.description || "Professional service at your doorstep."}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm font-semibold text-blue-600">
                        Explore
                        <ArrowRight size={15} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                      {service.price && (
                        service.discount ? (
                          <div className="flex flex-col items-end leading-tight">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-[11px] text-gray-400 line-through">₹{service.price}</span>
                              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1 rounded-sm">{service.discount}% OFF</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {typeof service.price === "string" && service.price.includes("-") ? "" : "from "}₹{getDisplayPrice(service.price, service.discount)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-gray-900">
                            {typeof service.price === "string" && service.price.includes("-") ? "" : "from "}₹{getDisplayPrice(service.price, 0)}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          ALTERNATING SECTION — illustration + text
      ═══════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white overflow-hidden">
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left — visual with globe/map illustration */}
              <div className="relative overflow-hidden">
                {/* Circle background */}
                <div className="w-full max-w-[360px] md:max-w-[420px] aspect-square mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full" />
                  <div className="absolute inset-6 bg-gradient-to-br from-blue-100/50 to-cyan-100/50 rounded-full" />

                  {/* Globe icon center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="w-32 h-32 text-blue-200 stroke-[0.5]" />
                  </div>

                  {/* Floating paper airplane */}
                  <div
                    className="absolute top-12 right-12"
                    style={{ animation: "float 3.5s ease-in-out infinite" }}
                  >
                    <Send className="w-10 h-10 text-blue-400 fill-blue-200 -rotate-12" />
                  </div>

                  {/* Dotted path lines */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 420 420"
                    fill="none"
                  >
                    <path
                      d="M210 80 Q280 130 320 210 Q340 280 280 340"
                      stroke="#93c5fd"
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                      fill="none"
                    />
                    <path
                      d="M100 180 Q160 160 210 210 Q250 260 210 340"
                      stroke="#93c5fd"
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                      fill="none"
                    />
                  </svg>

                  {/* Map pins */}
                  {[
                    { top: "15%", left: "45%", bg: "bg-red-400" },
                    { top: "60%", left: "22%", bg: "bg-blue-500" },
                    { top: "70%", left: "70%", bg: "bg-emerald-400" },
                  ].map((pin, i) => (
                    <div
                      key={i}
                      className={`absolute w-6 h-6 ${pin.bg} rounded-full shadow-lg flex items-center justify-center`}
                      style={{
                        top: pin.top,
                        left: pin.left,
                        animation: `float ${3 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
                      }}
                    >
                      <MapPin className="w-3.5 h-3.5 text-white" />
                    </div>
                  ))}

                  {/* Mini card */}
                  <div
                    className="absolute bottom-6 left-2 sm:left-0 bg-white rounded-xl shadow-xl p-3 flex items-center gap-3 max-w-[200px]"
                    style={{ animation: "float 5s ease-in-out infinite 0.5s" }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-[11px] font-bold text-gray-900">
                        Service completed
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      ₹1,499
                    </span>
                  </div>
                </div>
              </div>

              {/* Right — text */}
              <div className="min-w-0">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-6">
                  Available everywhere, book anyone effortlessly
                </h2>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-8 break-words">
                  Whether you're in Mumbai, Delhi, or Bangalore — EzFix connects
                  you with top-rated local professionals in minutes. Track your
                  booking in real-time, chat with your provider, and pay
                  securely through the app.
                </p>
                <div className="space-y-4">
                  {[
                    "Real-time provider tracking",
                    "Secure in-app payments",
                    "Instant booking confirmation",
                    "Service guarantee on every booking",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CircleCheckBig className="w-5 h-5 text-blue-500 shrink-0" />
                      <span className="text-gray-700 text-[15px] font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          CTA — blue gradient with circular icons
      ═══════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_70%)]" />

        {/* Floating category circles */}
        <div className="absolute inset-0 z-0 hidden lg:block">
          {[
            {
              Icon: Wrench,
              top: "15%",
              left: "8%",
              size: "w-14 h-14",
              bg: "bg-white/10",
            },
            {
              Icon: Zap,
              top: "25%",
              left: "25%",
              size: "w-11 h-11",
              bg: "bg-white/15",
            },
            {
              Icon: Sparkles,
              top: "12%",
              right: "20%",
              size: "w-12 h-12",
              bg: "bg-white/10",
            },
            {
              Icon: Droplets,
              top: "65%",
              left: "12%",
              size: "w-10 h-10",
              bg: "bg-white/10",
            },
            {
              Icon: Paintbrush,
              top: "55%",
              right: "10%",
              size: "w-12 h-12",
              bg: "bg-white/15",
            },
            {
              Icon: Hammer,
              top: "70%",
              right: "28%",
              size: "w-10 h-10",
              bg: "bg-white/10",
            },
            {
              Icon: Wind,
              bottom: "15%",
              left: "30%",
              size: "w-11 h-11",
              bg: "bg-white/10",
            },
            {
              Icon: Flower2,
              top: "35%",
              right: "8%",
              size: "w-9 h-9",
              bg: "bg-white/15",
            },
          ].map(({ Icon, size, bg, ...pos }, i) => (
            <div
              key={i}
              className={`absolute ${size} ${bg} backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg`}
              style={{
                ...pos,
                animation: `float ${3.5 + i * 0.3}s ease-in-out infinite ${i * 0.4}s`,
              }}
            >
              <Icon className="w-1/2 h-1/2 text-white/70" />
            </div>
          ))}
        </div>

        <Reveal>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
              Get started in minutes and book all your services in one place
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
              Download the app, browse services, and book a professional in
              under 60 seconds. It's that simple.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => scrollTo("services")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/25 text-white font-bold rounded-full hover:bg-white/20 transition-all text-[15px]"
              >
                Browse Services <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — numbered steps with green circles
      ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <Reveal>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
              {[
                {
                  num: "1",
                  title: "Choose your service",
                  desc: "Browse through 50+ home services. Pick what you need — from plumbing and electrical to cleaning and painting.",
                },
                {
                  num: "2",
                  title: "Pick your time slot",
                  desc: "Select a date and time that fits your schedule. Same-day bookings available between 8 AM – 10 PM, every day.",
                },
                {
                  num: "3",
                  title: "Relax, we handle it",
                  desc: "A verified professional arrives at your door. Track in real-time, pay securely, and rate your experience.",
                },
              ].map((step) => (
                <div key={step.num}>
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-5 shadow-lg shadow-emerald-500/25">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-[15px] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER — dark minimal
      ═══════════════════════════════════════════ */}
      <footer className="bg-[#0f172a] text-white py-16 lg:py-20">
        <Reveal>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-14">
              {/* Brand */}
              <div className="col-span-2 md:col-span-4 lg:col-span-2">
                <div className="flex items-center gap-2 mb-5">
                  <img src={ezFixLogo} alt="EzFix" className="h-10 w-auto object-contain rounded-md" />
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
                  Your trusted platform for verified home service professionals.
                  Book with confidence, every time.
                </p>
                <div className="flex gap-3">
                  {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-9 h-9 bg-white/8 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Icon className="w-4 h-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
                  Company
                </h4>
                <ul className="space-y-3 text-sm">
                  {[
                    { label: "About", href: "/about" },
                    { label: "Careers", href: "#" },
                    { label: "Blog", href: "#" },
                    { label: "Press", href: "#" },
                  ].map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
                  Services
                </h4>
                <ul className="space-y-3 text-sm">
                  {[
                    "Cleaning",
                    "Plumbing",
                    "Electrical",
                    "AC Repair",
                    "Painting",
                  ].map((s) => (
                    <li key={s}>
                      <a
                        href="#services"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {s}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
                  Contact
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                    +91 1800-123-4567
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                    hi@ezfiz.com
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    Mumbai, India
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-xs">
                © {new Date().getFullYear()} EzFix. All rights reserved.
              </p>
              <div className="flex gap-6 text-xs text-gray-500">
                {["Privacy", "Terms", "Cookies"].map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </footer>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default Home;
