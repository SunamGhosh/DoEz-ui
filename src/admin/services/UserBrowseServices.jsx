import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, Wrench, Search } from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../../components/Navbar";
import { getServices } from "../../apiservice/service";
import { getSubServices } from "../../apiservice/subservice";
import serviceImg from "../../assets/images/images.jpg";

const BrowseServices = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesRes = await getServices();
        const subServicesRes = await getSubServices();

        setServices(servicesRes?.data?.data || []);
        setSubServices(subServicesRes?.data?.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================
     SEARCH FILTER
  ========================= */
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;

    return services.filter(
      (service) =>
        service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, services]);

  /* =========================
     SUB SERVICES FILTER
  ========================= */
  const relatedSubServices = useMemo(() => {
    if (!selectedService) return [];
    return subServices.filter(
      (sub) => sub?.serviceId?._id === selectedService._id
    );
  }, [selectedService, subServices]);

  const handleSubServiceClick = (subId) => {
    setSelectedService(null);
    navigate(`/sub-ser1/${subId}`);
  };

  /* =========================
     LOADING STATE
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-teal-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-teal-50 py-24">
        <div className="max-w-7xl mx-auto px-4">

          {/* ================= HEADER ================= */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <h1 className="text-4xl font-black text-center text-gray-900">
            <span className="text-orange-500 underline">Services</span>
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Find the perfect service for your needs
          </p>

          {/* ================= SEARCH ================= */}
          <div className="mt-8 mb-10 max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* ================= SERVICES GRID ================= */}
          {filteredServices.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">
              No services found
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service._id}
                  onClick={() => setSelectedService(service)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl cursor-pointer transition overflow-hidden"
                >
                  <img
                    src={serviceImg}
                    alt={service?.name || "Service"}
                    className="h-44 w-full object-cover"
                  />

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {service.description || "No description available"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl overflow-auto max-h-[80vh]">
            <div className="p-6">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {selectedService.name}
                </h2>
                <button onClick={() => setSelectedService(null)}>
                  <X />
                </button>
              </div>

              {relatedSubServices.length === 0 ? (
                <p className="text-center text-gray-600">
                  No sub-services available
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {relatedSubServices.map((sub) => (
                    <div
                      key={sub._id}
                      onClick={() => handleSubServiceClick(sub._id)}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer flex gap-3"
                    >
                      <div className="bg-teal-100 p-2 rounded-md">
                        <Wrench className="text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{sub.name}</h4>
                        <p className="text-sm text-gray-600">
                          {sub.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BrowseServices;
