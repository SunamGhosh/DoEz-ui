import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Shield,
  Users,
  Heart,
  Target,
  Award,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  MapPin,
  Wrench,
  Droplets,
  Paintbrush,
  Hammer,
  Flower2,
  Tv,
  Menu,
  X,
  LogOut,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  TrendingUp,
  Globe,
  Lightbulb,
  BadgeCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import API from "../api";
import Reveal from "../components/Reveal";

const About = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* ═══════════════════════════════════════════
          NAVBAR — same style as homepage
      ═══════════════════════════════════════════ */}
      <nav
        className={`fixed z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
        }`}
      >
        <div className={scrolled || mobileMenuOpen ? "max-w-7xl mx-auto" : "w-full"}>
          <div
            className={`flex items-center justify-between px-6 py-3 transition-all duration-300 ${
              scrolled
                ? "rounded-full bg-[#1a1f36]/90 backdrop-blur-2xl shadow-2xl shadow-black/15 border border-white/10"
                : "rounded-none bg-white/10 backdrop-blur-xl border-b border-white/15"
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
                <Link
                  key={l.label}
                  to={l.href}
                  className={`relative pb-1 text-[15px] font-medium transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-white after:rounded-full after:transition-all after:duration-300 after:ease-out ${
                    l.href === "/about"
                      ? "text-white after:w-full"
                      : "text-white/70 hover:text-white after:w-0 hover:after:w-full"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

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

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-2 bg-[#1a1f36]/95 backdrop-blur-2xl rounded-2xl border border-white/10 px-6 py-5 space-y-3 animate-fadeIn">
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
                <Link
                  key={l.label}
                  to={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 text-white/80 font-medium hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
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
                      setMobileMenuOpen(false);
                      navigate("/login");
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
          HERO — About page header 
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f36] via-[#1e2a4a] to-[#2563eb]" />
        {/* radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[120%] bg-gradient-to-r from-blue-500/15 via-cyan-400/10 to-transparent rounded-full blur-3xl" />

        {/* Floating decorative icons */}
        <div className="absolute inset-0 z-0 hidden lg:block">
          {[
            { Icon: Shield, top: "20%", left: "8%", size: "w-12 h-12", bg: "bg-white/8" },
            { Icon: Heart, top: "30%", right: "12%", size: "w-10 h-10", bg: "bg-white/10" },
            { Icon: Award, top: "60%", left: "15%", size: "w-11 h-11", bg: "bg-white/8" },
            { Icon: Users, top: "15%", right: "25%", size: "w-9 h-9", bg: "bg-white/12" },
            { Icon: Target, top: "65%", right: "8%", size: "w-10 h-10", bg: "bg-white/8" },
          ].map(({ Icon, size, bg, ...pos }, i) => (
            <div
              key={i}
              className={`absolute ${size} ${bg} backdrop-blur-sm rounded-full flex items-center justify-center`}
              style={{
                ...pos,
                animation: `float ${3.5 + i * 0.5}s ease-in-out infinite ${i * 0.4}s`,
              }}
            >
              <Icon className="w-1/2 h-1/2 text-white/50" />
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-36 lg:pt-44 pb-24 lg:pb-36 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-sm font-medium text-white/80 mb-8">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto">
            Making home services{" "}
            <span className="relative inline-block">
              effortless
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
            for every Indian home
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto mb-10">
            EzFix was born from a simple idea — that finding reliable home
            service professionals shouldn't be a gamble. We're building the most
            trusted platform in India for home services.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { val: "50+", label: "Cities" },
              { val: "12K+", label: "Bookings" },
              { val: "5K+", label: "Professionals" },
              { val: "98%", label: "Satisfaction" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-white">
                  {s.val}
                </div>
                <div className="text-xs text-white/40 font-medium mt-1">
                  {s.label}
                </div>
              </div>
            ))}
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
          MISSION & VISION — two-column cards
      ═══════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white">
        <Reveal>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Mission */}
              <div className="group relative bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-3xl p-8 lg:p-10 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-7 h-7 text-blue-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-500 text-[15px] leading-relaxed">
                  To democratize access to quality home services across India. We
                  believe every household — whether in a metro city or a growing
                  town — deserves access to skilled, verified professionals at
                  fair and transparent prices. EzFix bridges the gap between
                  homeowners and service providers through technology, trust, and
                  transparency.
                </p>
              </div>

              {/* Vision */}
              <div className="group relative bg-gradient-to-br from-gray-50 to-emerald-50/50 rounded-3xl p-8 lg:p-10 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
                  Our Vision
                </h2>
                <p className="text-gray-500 text-[15px] leading-relaxed">
                  To become India's most loved home services platform — where
                  booking a plumber, electrician, or cleaner is as simple and
                  reliable as ordering food online. We envision a future where
                  every service provider has a dignified livelihood and every
                  homeowner has a trusted partner just a tap away.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          OUR STORY — dark section with timeline feel
      ═══════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f36] via-[#1e2a4a] to-[#0f172a]" />
        <div className="absolute top-0 right-[-10%] w-[50%] h-[100%] bg-blue-600/10 rounded-full blur-[120px]" />

        <Reveal>
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left — story text */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white/60 uppercase tracking-wider mb-6">
                  <Heart className="w-3.5 h-3.5 text-red-400" />
                  Our Story
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                  Built with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    passion
                  </span>{" "}
                  for your comfort
                </h2>
                <div className="space-y-5 text-white/60 text-[15px] leading-relaxed">
                  <p>
                    EzFix started when our founders faced a common problem — finding
                    a trustworthy electrician for an urgent repair at home. After
                    calling multiple numbers, getting quoted wildly different prices,
                    and dealing with no-shows, they realized there had to be a better
                    way.
                  </p>
                  <p>
                    That frustration became the seed for EzFix. We set out to build a
                    platform that puts trust first — where every professional is
                    verified, every price is transparent, and every booking is
                    backed by our service guarantee.
                  </p>
                  <p>
                    Today, EzFix serves thousands of homes across 50+ cities in
                    India, with a growing community of skilled professionals who
                    take pride in their craft.
                  </p>
                </div>
              </div>

              {/* Right — floating value cards */}
              <div className="relative h-[420px] hidden lg:block">
                {/* Card 1 */}
                <div className="absolute top-0 right-0 w-[280px] bg-gradient-to-br from-[#2d3555] to-[#1e293b] rounded-2xl p-6 shadow-2xl border border-white/10 transform rotate-3 hover:rotate-1 transition-transform duration-500 z-20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        Trust First
                      </div>
                      <div className="text-xs text-gray-400">
                        Core Principle
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Every professional undergoes thorough background verification
                    and skill assessment before joining our platform.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="absolute top-36 right-44 w-[260px] bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 shadow-2xl transform -rotate-6 hover:-rotate-3 transition-transform duration-500 z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        Customer Love
                      </div>
                      <div className="text-xs text-white/60">
                        What Drives Us
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-white/60">
                      4.9 avg rating
                    </span>
                  </div>
                </div>

                {/* Floating badge */}
                <div
                  className="absolute bottom-12 right-8 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 z-30"
                  style={{ animation: "float 4.5s ease-in-out infinite" }}
                >
                  <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">
                      Growing Fast
                    </div>
                    <div className="text-[11px] text-gray-400">
                      50+ cities & counting
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          CORE VALUES — 3-column grid
      ═══════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white">
        <Reveal>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                What we stand for
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Our values aren't just words on a wall — they guide every
                decision we make, every feature we build, and every professional
                we onboard.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="w-6 h-6 text-blue-600" />,
                  bg: "bg-blue-50",
                  hoverBorder: "hover:border-blue-200",
                  title: "Trust & Safety",
                  desc: "Every service provider is background-verified, ID-checked, and skill-tested. Your safety is our #1 priority.",
                },
                {
                  icon: <Zap className="w-6 h-6 text-amber-600" />,
                  bg: "bg-amber-50",
                  hoverBorder: "hover:border-amber-200",
                  title: "Speed & Reliability",
                  desc: "From booking to doorstep — we deliver fast. Same-day service availability with real-time tracking ensures you're never left waiting.",
                },
                {
                  icon: <Heart className="w-6 h-6 text-rose-600" />,
                  bg: "bg-rose-50",
                  hoverBorder: "hover:border-rose-200",
                  title: "Customer First",
                  desc: "Every feature, every policy, every process is designed around your comfort. 24/7 support, easy rebooking, and a service guarantee.",
                },
                {
                  icon: <Globe className="w-6 h-6 text-cyan-600" />,
                  bg: "bg-cyan-50",
                  hoverBorder: "hover:border-cyan-200",
                  title: "Accessibility",
                  desc: "From metros to tier-2 cities, we're expanding access to quality home services for every Indian household.",
                },
                {
                  icon: <BadgeCheck className="w-6 h-6 text-emerald-600" />,
                  bg: "bg-emerald-50",
                  hoverBorder: "hover:border-emerald-200",
                  title: "Fair Pricing",
                  desc: "No hidden charges, no inflated rates. Transparent upfront pricing so you always know what you're paying before you book.",
                },
                {
                  icon: <Users className="w-6 h-6 text-violet-600" />,
                  bg: "bg-violet-50",
                  hoverBorder: "hover:border-violet-200",
                  title: "Empowering Providers",
                  desc: "We believe in dignified livelihoods. Our platform gives skilled professionals the tools, training, and fair earnings they deserve.",
                },
              ].map((v, i) => (
                <div
                  key={i}
                  className={`group bg-white rounded-2xl p-7 border border-gray-100 ${v.hoverBorder} hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-300`}
                >
                  <div
                    className={`w-14 h-14 ${v.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {v.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {v.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-[15px]">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          WHY CHOOSE US — alternating layout
      ═══════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <Reveal>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                Why families choose EzFix
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                We're not just another app — we're your trusted home service
                partner committed to quality and convenience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
                  title: "Verified & Background-Checked Pros",
                  desc: "Every professional undergoes rigorous ID verification, criminal background checks, and hands-on skill assessments.",
                },
                {
                  icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
                  title: "Real-Time Booking & Tracking",
                  desc: "Book instantly, track your professional's arrival in real-time, and stay informed every step of the way.",
                },
                {
                  icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
                  title: "100% Service Guarantee",
                  desc: "Not satisfied? We'll send another professional or refund your money. Your satisfaction is guaranteed on every booking.",
                },
                {
                  icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
                  title: "Secure Digital Payments",
                  desc: "Pay securely through the app via UPI, cards, or wallets. No cash hassles, complete transaction transparency.",
                },
                {
                  icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
                  title: "50+ Services Under One Roof",
                  desc: "From plumbing and electrical to deep cleaning and painting — find every home service you need in one platform.",
                },
                {
                  icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
                  title: "24/7 Customer Support",
                  desc: "Real humans ready to help at any hour. Whether it's an urgent repair or a booking question, we've got you covered.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                >
                  <div className="shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          CTA — blue gradient (same as homepage)
      ═══════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_70%)]" />

        {/* Floating icons */}
        <div className="absolute inset-0 z-0 hidden lg:block">
          {[
            { Icon: Wrench, top: "15%", left: "8%", size: "w-14 h-14", bg: "bg-white/10" },
            { Icon: Zap, top: "25%", left: "25%", size: "w-11 h-11", bg: "bg-white/15" },
            { Icon: Sparkles, top: "12%", right: "20%", size: "w-12 h-12", bg: "bg-white/10" },
            { Icon: Droplets, top: "65%", left: "12%", size: "w-10 h-10", bg: "bg-white/10" },
            { Icon: Paintbrush, top: "55%", right: "10%", size: "w-12 h-12", bg: "bg-white/15" },
            { Icon: Hammer, top: "70%", right: "28%", size: "w-10 h-10", bg: "bg-white/10" },
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
              Ready to experience hassle-free home services?
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of happy homeowners who trust EzFix for all their
              home service needs. Browse services and book your first
              professional in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition-all text-[15px] shadow-xl shadow-black/10"
              >
                Explore Services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER — same style as homepage
      ═══════════════════════════════════════════ */}
      <footer className="bg-[#0f172a] text-white py-16 lg:py-20">
        <Reveal>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-14">
              {/* Brand */}
              <div className="col-span-2 md:col-span-4 lg:col-span-2">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-extrabold tracking-tight">
                    EzFix
                  </span>
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
                    { label: "Home", href: "/" },
                    { label: "About", href: "/about" },
                    { label: "Services", href: "/services" },
                    { label: "Careers", href: "#" },
                  ].map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.href}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {l.label}
                      </Link>
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
                  {["Cleaning", "Plumbing", "Electrical", "AC Repair", "Painting"].map(
                    (s) => (
                      <li key={s}>
                        <Link
                          to="/services"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {s}
                        </Link>
                      </li>
                    )
                  )}
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
                    hi@ezfix.com
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
    </div>
  );
};

export default About;
