import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Smile,
  Search,
  MapPin,
  Play
} from "lucide-react";
import Layout from "../components/Layout";
import { getServices } from "../apiservice/service";
import happyServiceImg from "../assets/happy-service.png";
import serviceImg from "../assets/images/images.jpg";
import heroMergedImg from "../assets/images/hero_services_merged.png";

const Home = () => {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const serviceColors = {
    CLEANING: "from-cyan-400 to-blue-500 shadow-cyan-500/20",
    PLUMBING: "from-blue-400 to-indigo-500 shadow-blue-500/20",
    ELECTRICAL: "from-yellow-400 to-amber-500 shadow-yellow-500/20",
    MECHANICAL: "from-zinc-400 to-stone-500 shadow-zinc-500/20",
    PAINTING: "from-pink-400 to-rose-500 shadow-pink-500/20",
    CARPENTRY: "from-orange-400 to-red-500 shadow-orange-500/20",
    GARDENARING: "from-green-400 to-emerald-500 shadow-green-500/20",
    APPLIANCE: "from-purple-400 to-violet-500 shadow-purple-500/20",
  };

  const serviceIcons = {
    CLEANING: <Sparkles className="w-8 h-8" />,
    PLUMBING: <Droplets className="w-8 h-8" />,
    ELECTRICAL: <Zap className="w-8 h-8" />,
    MECHANICAL: <Wrench className="w-8 h-8" />,
    PAINTING: <Paintbrush className="w-8 h-8" />,
    CARPENTRY: <Hammer className="w-8 h-8" />,
    GARDENARING: <Flower2 className="w-8 h-8" />,
    APPLIANCE: <Tv className="w-8 h-8" />,
  };

  useEffect(() => {
    getServices()
      .then((res) => {
        const servicesArray = res.data.data || res.data;
        setServices(servicesArray);
      })
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  useEffect(() => {
    if (location.hash === "#services") {
      const section = document.getElementById("services");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  return (
    <Layout>
      <div className="bg-white overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

        {/* ================= HERO SECTION ================= */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
          {/* Background Image / Gradient */}
          <div className="absolute inset-0 bg-white -z-20" />

          {/* Soft, moving gradient orbs */}
          <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-200/40 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-200/40 rounded-full blur-[120px] animate-pulse delay-700" />
          <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] bg-pink-200/30 rounded-full blur-[100px] animate-pulse delay-1000 -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-lg shadow-purple-500/5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                    Verified Experts Nearby
                  </span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-6 leading-[0.9] tracking-tighter">
                  Fix it. <br />
                  <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                    Love it.
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                  The easiest way to book local professionals for repair, cleaning, and maintenance.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group relative px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg overflow-hidden shadow-2xl hover:shadow-black/20 transition-all"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center gap-2">
                      Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                  <button className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors">
                    <Play className="w-5 h-5 fill-gray-900" />
                    See how it works
                  </button>
                </div>

                {/* Trust Stats */}
                <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-gray-100">
                  <div>
                    <div className="text-3xl font-black text-gray-900">4.9</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Avg Rating</div>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div>
                    <div className="text-3xl font-black text-gray-900">12k+</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Bookings</div>
                  </div>
                </div>
              </div>

              {/* Right Image Composition */}
              <div className="relative hidden lg:block h-[600px] w-full">
                <div className="absolute top-10 right-10 w-[80%] h-[90%] bg-gradient-to-b from-gray-100 to-gray-50 rounded-[3rem] -rotate-6" />
                <div className="absolute top-0 right-0 w-[80%] h-[90%] rounded-[3rem] overflow-hidden shadow-2xl rotate-0 border-[6px] border-white">
                  <img
                    src={heroMergedImg}
                    className="w-full h-full object-cover"
                    alt="Service Pro - Fan and Plumbing"
                  />

                  {/* Floating Card 1 */}
                  <div className="absolute bottom-10 left-[-20px] bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce duration-[3000ms]">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <CheckCircle2 />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Job Done</div>
                      <div className="text-xs text-gray-500">Just now</div>
                    </div>
                  </div>

                  {/* Floating Card 2 */}
                  <div className="absolute top-20 right-[-20px] bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce duration-[4000ms]">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                      <Star className="fill-yellow-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">5.0 Rating</div>
                      <div className="text-xs text-gray-500">Verified Pro</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= CATEGORIES CAROUSEL ================= */}
        <section id="services" className="py-24 bg-white relative z-10">
          <div className="max-w-full overflow-hidden px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-4xl font-black text-gray-900 mb-4">Explore Categories</h2>
              <p className="text-gray-500 text-lg">Find the perfect professional for every corner of your life.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {services.map((service, index) => {
                return (
                  <div
                    key={service._id}
                    onClick={() => navigate(`/bookservice/${service._id}`)}
                    className="relative group w-64 h-80 rounded-[2.5rem] overflow-hidden cursor-pointer transition-transform hover:-translate-y-2 hover:shadow-2xl"
                  >
                    {/* Background Image */}
                    <img
                      src={serviceImg}
                      alt={service.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-white transition-all duration-300">
                        <div className="text-white group-hover:text-teal-600 transition-colors">
                          {serviceIcons[service.name] || <Sparkles />}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">
                          {service.name}
                        </h3>
                        <div className="h-1 w-12 bg-teal-400 rounded-full group-hover:w-full transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ================= DARK FEATURE SECTION ================= */}
        <section className="py-32 bg-[#0a0a0a] text-white relative overflow-hidden rounded-t-[4rem]">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                  Peace of mind, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-400">
                    Guaranteed.
                  </span>
                </h2>
                <p className="text-gray-400 text-xl mb-12 leading-relaxed max-w-md">
                  We don't just connect you; we protect you. Every service comes with our happiness guarantee.
                </p>

                <div className="space-y-8">
                  {[
                    { title: "Vetted Professionals", desc: "Background checked & skill tested.", icon: <Shield className="w-6 h-6 text-green-400" /> },
                    { title: "Upfront Pricing", desc: "What you see is what you pay.", icon: <CheckCircle2 className="w-6 h-6 text-blue-400" /> },
                    { title: "24/7 Support", desc: "Real humans, ready to help.", icon: <Heart className="w-6 h-6 text-pink-400" /> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                        <p className="text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-white/5 shadow-2xl">
                  <img
                    src={happyServiceImg}
                    alt="Happy Family"
                    className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-10">
                    <Quote className="text-white/20 w-16 h-16 mb-4" />
                    <p className="text-2xl font-bold leading-relaxed">
                      "The best home service experience I've ever had. Period."
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      <span className="font-bold text-sm tracking-widest uppercase text-gray-400">Sarah J.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-5xl md:text-8xl font-black text-gray-900 mb-10 tracking-tighter">
              Ready to <span className="underline decoration-wavy decoration-purple-400 decoration-4 underline-offset-8">Sparkle?</span>
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-12 py-6 bg-black text-white text-xl font-bold rounded-full hover:scale-105 transition-transform shadow-2xl">
                Download App
              </button>
              <button className="px-12 py-6 bg-gray-100 text-gray-900 text-xl font-bold rounded-full hover:bg-gray-200 transition-colors">
                Browse Services
              </button>
            </div>
          </div>

          {/* Decorative Floor */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-transparent to-gray-100" />
        </section>

      </div>
    </Layout>
  );
};

export default Home;
