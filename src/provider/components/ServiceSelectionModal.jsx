import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ChevronRight } from "lucide-react";
import { getServices } from "../../apiservice/service";
import { getSubServicesByServiceId } from "../../apiservice/subservice";
import { updateProviderServices } from "../../apiservice/provider";
import toast from "react-hot-toast";

const ServiceSelectionModal = ({ isOpen, onClose, onComplete }) => {
    const [services, setServices] = useState([]);
    const [subServices, setSubServices] = useState([]);

    const [selectedService, setSelectedService] = useState(null);
    const [selectedSubServices, setSelectedSubServices] = useState([]);

    const [workArea, setWorkArea] = useState("");
    const [experienceYears, setExperienceYears] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchServices();
        }
    }, [isOpen]);

    const fetchServices = async () => {
        try {
            const res = await getServices();
            setServices(res.data.data || res.data || []);
        } catch (error) {
            console.error("Failed to fetch services:", error);
            toast.error("Failed to load services");
        }
    };

    const fetchSubServices = async (serviceId) => {
        try {
            const res = await getSubServicesByServiceId(serviceId);
            setSubServices(res.data.data || res.data || []);
        } catch (error) {
            console.error("Failed to fetch sub-services:", error);
        }
    };

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setSelectedSubServices([]);
        setSubServices([]);
        fetchSubServices(service._id);
    };

    const handleSubServiceToggle = (subService) => {
        setSelectedSubServices((prev) => {
            const exists = prev.find((item) => item._id === subService._id);
            if (exists) {
                return prev.filter((item) => item._id !== subService._id);
            } else {
                return [...prev, subService];
            }
        });
    };

    const handleSubmit = async () => {
        if (!workArea.trim()) {
            toast.error("Please enter your work area");
            return;
        }

        if (!experienceYears || experienceYears <= 0) {
            toast.error("Please enter your experience in years");
            return;
        }

        if (!selectedService) {
            toast.error("Please select a service category");
            return;
        }

        if (selectedSubServices.length === 0) {
            toast.error("Please select at least one sub-service");
            return;
        }

        setLoading(true);
        try {
            const servicesData = {
                workArea: workArea.trim(),
                experienceYears: parseInt(experienceYears),
                services: selectedSubServices.map(ss => ({
                    serviceId: selectedService._id,
                    subServiceId: ss._id
                }))
            };

            await updateProviderServices(servicesData);
            setSuccess(true);
            toast.success("Profile and Services updated!");

            setTimeout(() => {
                if (onComplete) onComplete();
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Failed to update services:", error);
            toast.error(error.response?.data?.error || "Failed to update services");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
                >
                    <X size={20} />
                </button>

                {success ? (
                    <div className="p-12 text-center animate-scaleIn">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">
                            Onboarding Complete!
                        </h2>
                        <p className="text-gray-500">
                            Your profile and services have been updated successfully.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col h-[95vh]">
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">
                                Complete Your Profile
                            </h2>
                            <p className="text-gray-500">
                                Set your operating area and select the services you provide
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="space-y-10">
                                {/* Section 1: Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                            Work Area (e.g., Downtown, City Name)
                                        </label>
                                        <input
                                            type="text"
                                            value={workArea}
                                            onChange={(e) => setWorkArea(e.target.value)}
                                            placeholder="Enter areas you serve"
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-gray-900 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                            Years of Experience
                                        </label>
                                        <input
                                            type="number"
                                            value={experienceYears}
                                            onChange={(e) => setExperienceYears(e.target.value)}
                                            placeholder="e.g. 5"
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-gray-900 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-10">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                        {/* Step 1: Services */}
                                        <div className="md:col-span-4 space-y-4">
                                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">
                                                1. Select Category
                                            </h3>
                                            <div className="space-y-2">
                                                {services.map((service) => (
                                                    <button
                                                        key={service._id}
                                                        onClick={() => handleServiceSelect(service)}
                                                        className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all text-left border-2 ${selectedService?._id === service._id
                                                            ? "border-gray-900 bg-gray-900 text-white shadow-lg scale-[1.02]"
                                                            : "border-gray-100 hover:border-gray-300 text-gray-700 font-bold"
                                                            }`}
                                                    >
                                                        <span>{service.name}</span>
                                                        {selectedService?._id === service._id && <ChevronRight size={18} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Step 2: Sub-Services */}
                                        <div className="md:col-span-8 space-y-4">
                                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">
                                                2. Select Sub-Services {selectedService ? `under ${selectedService.name}` : ""}
                                            </h3>

                                            {selectedService ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-bold">
                                                    {subServices.length > 0 ? (
                                                        subServices.map((subService) => {
                                                            const isSelected = selectedSubServices.find(s => s._id === subService._id);
                                                            return (
                                                                <button
                                                                    key={subService._id}
                                                                    onClick={() => handleSubServiceToggle(subService)}
                                                                    className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${isSelected
                                                                        ? "border-teal-500 bg-teal-50"
                                                                        : "border-gray-100 hover:border-teal-200 text-gray-700"
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between relative z-10">
                                                                        <span className={`${isSelected ? "text-teal-700" : ""}`}>
                                                                            {subService.name}
                                                                        </span>
                                                                        {isSelected && (
                                                                            <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                                                                <CheckCircle2 size={14} className="text-white" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="col-span-full py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                            <p className="text-gray-400 font-medium italic">No sub-services found.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                    <p className="text-gray-400 font-medium">Please select a category first</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Submit */}
                        <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
                                <div className="text-left w-full md:w-auto">
                                    <p className="text-gray-500 text-sm font-medium">Progress</p>
                                    <p className="text-gray-900 font-black">
                                        {selectedSubServices.length > 0 ? `${selectedSubServices.length} sub-services selected` : "Awaiting service selection"}
                                    </p>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || selectedSubServices.length === 0 || !workArea || !experienceYears}
                                    className="w-full md:w-auto px-12 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 disabled:opacity-30 transition-all shadow-xl active:scale-95"
                                >
                                    {loading ? "Completing Profile..." : "Save and Finish"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceSelectionModal;
