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
  Quote
} from "lucide-react";
import Layout from "../components/Layout";
import { getServices } from "../apiservice/service";
import happyServiceImg from "../assets/happy-service.png";

const Home = () => {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const serviceIcons = {
    CLEANING: <Sparkles className="w-10 h-10 text-teal-600" />,
    PLUMBING: <Droplets className="w-10 h-10 text-blue-500" />,
    ELECTRICAL: <Zap className="w-10 h-10 text-yellow-500" />,
    MECHANICAL: <Wrench className="w-10 h-10 text-gray-500" />,
    PAINTING: <Paintbrush className="w-10 h-10 text-pink-500" />,
    CARPENTRY: <Hammer className="w-10 h-10 text-amber-700" />,
    GARDENARING: <Flower2 className="w-10 h-10 text-green-500" />,
    APPLIANCE: <Tv className="w-10 h-10 text-purple-500" />,
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
      <div className="bg-white overflow-hidden">

        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-16 pb-24 lg:pt-32 lg:pb-40 overflow-hidden bg-gray-50/50">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-100/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                </span>
                <span className="text-sm font-bold text-gray-600 tracking-wide uppercase">
                  #1 Trusted Home Services Platform
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
                Quality home services, <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                  on demand.
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                Expert professionals for cleaning, repair, and maintenance. Trusted by thousands of homeowners.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <button
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-teal-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Book a Service
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => navigate('/#provider')}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                >
                  Join as Professional
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-200 pt-10">
                {[
                  { label: "Active Users", value: "15k+" },
                  { label: "Verified Pros", value: "850+" },
                  { label: "Services Delivered", value: "50k+" },
                  { label: "Avg. Rating", value: "4.9/5" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= SERVICES SECTION ================= */}
        <section id="services" className="py-24 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">Expert Services</h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Everything you need to maintain your home, delivered by verified experts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <div
                  key={service._id}
                  onClick={() => navigate(`/bookservice/${service._id}`)}
                  className="group bg-white rounded-3xl p-8 cursor-pointer border border-gray-100 shadow-sm hover:shadow-2xl hover:border-teal-100 hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-teal-50 transition-colors duration-300">
                    {serviceIcons[service.name] || <Sparkles className="w-10 h-10 text-teal-600" />}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-gray-500 mb-6 line-clamp-2 text-sm leading-relaxed">
                    Professional {service.name.toLowerCase()} services at affordable rates.
                  </p>

                  <div className="flex items-center text-sm font-bold text-gray-400 group-hover:text-teal-600 transition-colors">
                    Book Now <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= WHY CHOOSE US ================= */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">

              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-6">
                  <Shield size={14} /> Why DoEz?
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                  Simpler, Safer, <br />
                  <span className="text-teal-600">Better Services.</span>
                </h2>
                <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                  We are committed to providing the highest quality home services with a focus on safety, reliability, and customer satisfaction.
                </p>

                <div className="space-y-6">
                  {[
                    { title: "Verified Professionals", desc: "Background checked and trained experts.", icon: <CheckCircle2 className="text-teal-600" /> },
                    { title: "Transparent Pricing", desc: "Upfront quotes, no hidden fees.", icon: <Sparkles className="text-purple-600" /> },
                    { title: "100% Satisfaction", desc: "We ensure you are happy with the job.", icon: <Heart className="text-red-500" /> },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="mt-1 bg-gray-50 p-2 rounded-full h-fit">{item.icon}</div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h4>
                        <p className="text-gray-500 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-1 md:order-2 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-200 to-transparent rounded-[3rem] rotate-6 opacity-30 blur-2xl"></div>
                <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src={happyServiceImg}
                    alt="Happy family"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            User
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">4.9/5 Rating</div>
                        <div className="text-xs text-gray-500">from local homeowners</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-16">What our customers say</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Alex Morgan", role: "Apartment Owner", text: "The booking process was incredibly smooth. The cleaner arrived exactly on time and did a fantastic job." },
                { name: "Sarah Jenkins", role: "Small Business", text: "Finally a reliable platform for maintenance work. Transparent pricing and professional service every time." },
                { name: "David Chen", role: "Homeowner", text: "I love the peace of mind knowing the professionals are verified. The electrical work was top-notch." }
              ].map((review, i) => (
                <div key={i} className="bg-gray-50 p-10 rounded-[2.5rem] text-left hover:bg-white hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-transparent hover:border-gray-100">
                  <Quote className="text-teal-500 mb-6 rotate-180" size={32} />
                  <p className="text-gray-600 text-lg mb-8 leading-relaxed font-medium">"{review.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">{review.name[0]}</div>
                    <div>
                      <div className="font-bold text-gray-900">{review.name}</div>
                      <div className="text-sm text-gray-400">{review.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CALL TO ACTION ================= */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto bg-gray-900 rounded-[3rem] relative overflow-hidden text-center px-6 py-24 shadow-2xl">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                Ready to transform your home?
              </h2>
              <p className="text-gray-400 text-xl mb-12 leading-relaxed">
                Join thousands of satisfied customers who trust DoEz for their home service needs. Quick, reliable, and affordable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-10 py-5 bg-white text-gray-900 font-bold rounded-full text-lg shadow-lg hover:bg-teal-50 transition-colors">
                  Get Started Now
                </button>
                <button className="px-10 py-5 bg-transparent border border-gray-700 text-white font-bold rounded-full text-lg hover:bg-gray-800 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default Home;
