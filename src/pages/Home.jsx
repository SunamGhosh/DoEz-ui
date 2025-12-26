import { CheckCircle2, Droplets, Flower2, Hammer, Paintbrush, Sparkles, Tv, Wind, Zap } from "lucide-react";
import React from "react";
import Layout from "../components/Layout";

const Home = () => {
  const services = [
    { name: "Cleaning", icon: <Sparkles className="text-teal-600" /> },
    { name: "Plumbing", icon: <Droplets className="text-blue-600" /> },
    { name: "Electrical", icon: <Zap className="text-yellow-600" /> },
    { name: "Painting", icon: <Paintbrush className="text-orange-600" /> },
    { name: "Carpentry", icon: <Hammer className="text-indigo-600" /> },
    { name: "AC Repair", icon: <Wind className="text-red-600" /> },
    { name: "Gardening", icon: <Flower2 className="text-green-600" /> },
    { name: "Appliance", icon: <Tv className="text-purple-600" /> },
  ];

  return (
    <Layout>
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-[70vh] flex items-center justify-center pb-20 overflow-hidden"
      >
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] rounded-full opacity-10 blur-3xl bg-teal-400 animate-pulse" />
          <div
            className="absolute bottom-0 -right-20 w-[35rem] h-[35rem] rounded-full opacity-10 blur-3xl bg-orange-400 animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full text-center">
          <div className="inline-flex items-center px-5 py-2 mb-8 rounded-full border border-teal-100 bg-teal-50 text-teal-700 font-bold text-sm shadow-sm">
            <CheckCircle2 size={16} className="mr-2" />
            Trusted by 10,000+ local happy customers
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-gray-900 leading-[1] lg:leading-[0.9]">
            Local Services
            <br />
            <span className="bg-gradient-to-r from-teal-500 to-orange-500 bg-clip-text text-transparent">
              Marketplace
            </span>
          </h1>

          <p className="text-lg md:text-2xl mb-12 max-w-2xl mx-auto text-gray-500 font-medium leading-relaxed px-4">
            Book trusted local professionals for all your home service needs.
            Verified experts, transparent pricing, and guaranteed peace of mind.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="w-full sm:w-auto px-10 py-5 text-lg font-black text-white bg-teal-500 rounded-full transition-all hover:scale-105 hover:shadow-2xl active:scale-95 shadow-lg">
              Book a Service
            </button>
            <button className="w-full sm:w-auto px-10 py-5 text-lg font-black border-2 border-teal-500 text-teal-600 rounded-full transition-all hover:bg-teal-50 active:scale-95">
              Join as Provider
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="py-24 bg-gray-50 rounded-[4rem] mx-4 mb-20 shadow-sm border border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-gray-900">
              Popular Services
            </h2>
            <div className="h-2 w-24 bg-teal-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group hover:-translate-y-3 transition-all duration-500 bg-white p-8 rounded-[3rem] text-center cursor-pointer shadow-sm hover:shadow-2xl border border-gray-100"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-sm">
                  {React.cloneElement(service.icon, { size: 40 })}
                </div>
                <h3 className="text-xl font-black text-gray-800 tracking-tight">
                  {service.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Bottom CTA Section */}
      <section className="py-20 text-center px-4">
          <div className="max-w-4xl mx-auto bg-gray-900 rounded-[3.5rem] p-12 md:p-20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
             <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                    Ready to get started?
                </h2>
                <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                    Join thousands of happy homeowners and verified professionals today. 
                    Quality work is just a click away.
                </p>
                <button className="px-10 py-5 bg-white text-gray-900 font-black rounded-full text-lg shadow-xl hover:bg-teal-50 transition-colors">
                    Get Free Quote
                </button>
             </div>
          </div>
      </section>
    </div>
    </Layout>
  );
};

export default Home;