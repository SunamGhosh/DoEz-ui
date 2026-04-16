import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ChevronRight, MapPin, Clock, Sparkles } from "lucide-react";
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
      getServices()
        .then((res) => setServices(res.data.data || res.data || []))
        .catch(() => toast.error("Failed to load services"));
    }
  }, [isOpen]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedSubServices([]);
    setSubServices([]);
    getSubServicesByServiceId(service._id)
      .then((res) => setSubServices(res.data.data || res.data || []))
      .catch(() => {});
  };

  const handleSubToggle = (sub) => {
    setSelectedSubServices((prev) =>
      prev.find((s) => s._id === sub._id) ? prev.filter((s) => s._id !== sub._id) : [...prev, sub]
    );
  };

  const handleSubmit = async () => {
    if (!workArea.trim()) { toast.error("Enter your work area"); return; }
    if (!experienceYears || experienceYears <= 0) { toast.error("Enter your experience in years"); return; }
    if (!selectedService) { toast.error("Select a service category"); return; }
    if (!selectedSubServices.length) { toast.error("Select at least one sub-service"); return; }

    setLoading(true);
    try {
      await updateProviderServices({
        workArea: workArea.trim(),
        experienceYears: parseInt(experienceYears),
        services: selectedSubServices.map((ss) => ({ serviceId: selectedService._id, subServiceId: ss._id })),
      });
      setSuccess(true);
      toast.success("Profile updated!");
      setTimeout(() => { onComplete?.(); onClose(); }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update services");
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const inp = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1a1f36]/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col animate-scaleIn">

        {success ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Onboarding Complete!</h3>
            <p className="text-gray-500 text-sm">Your profile and services have been updated.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-gray-900">Complete Your Profile</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Set your area and select the services you offer</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Basic info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5"><MapPin size={11} className="inline mr-1" />Work Area</label>
                  <input value={workArea} onChange={(e) => setWorkArea(e.target.value)} placeholder="e.g. Mumbai, Andheri" className={inp} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5"><Clock size={11} className="inline mr-1" />Experience (years)</label>
                  <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="e.g. 3" className={inp} />
                </div>
              </div>

              {/* Service selection */}
              <div className="border-t border-gray-100 pt-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Categories */}
                  <div className="md:col-span-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">1. Select Category</p>
                    <div className="space-y-1.5">
                      {services.map((s) => (
                        <button key={s._id} onClick={() => handleServiceSelect(s)}
                          className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-sm font-semibold transition-all text-left border ${
                            selectedService?._id === s._id
                              ? "bg-[#1a1f36] text-white border-[#1a1f36] shadow-md"
                              : "border-gray-100 text-gray-700 hover:border-blue-200 hover:bg-blue-50/30"
                          }`}>
                          <span>{s.name}</span>
                          {selectedService?._id === s._id && <ChevronRight size={15} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sub-services */}
                  <div className="md:col-span-8">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      2. Select Sub-Services {selectedService ? `— ${selectedService.name}` : ""}
                    </p>
                    {!selectedService ? (
                      <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">Select a category first</p>
                      </div>
                    ) : subServices.length === 0 ? (
                      <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm italic">No sub-services found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {subServices.map((sub) => {
                          const selected = !!selectedSubServices.find((s) => s._id === sub._id);
                          return (
                            <button key={sub._id} onClick={() => handleSubToggle(sub)}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold text-left flex items-center justify-between transition-all ${
                                selected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-100 text-gray-700 hover:border-blue-200"
                              }`}>
                              <span>{sub.name}</span>
                              {selected && (
                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                  <CheckCircle2 size={12} className="text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
              <div>
                <p className="text-xs text-gray-400 font-semibold">
                  {selectedSubServices.length > 0
                    ? <span className="text-blue-600 font-bold">{selectedSubServices.length} sub-service{selectedSubServices.length > 1 ? "s" : ""} selected</span>
                    : "No sub-services selected yet"}
                </p>
              </div>
              <button onClick={handleSubmit}
                disabled={loading || !selectedSubServices.length || !workArea || !experienceYears}
                className="w-full sm:w-auto px-8 py-3 bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? "Saving..." : "Save & Finish"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceSelectionModal;
