import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile } from "../apiservice/user";
import { checkAuth } from "../store/authSlice";

const CustomerInfoModal = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currentLat, setCurrentLat] = useState(null);
  const [currentLong, setCurrentLong] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    // Only show for customers who are logged in
    if (isAuthenticated && user && user.role === "customer" && !loading) {
      if (!user.phone || !user.address) {
        setPhone(user.phone || "");
        setAddress(user.address || "");
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  }, [user, isAuthenticated, loading]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLat(lat);
        setCurrentLong(lng);

        try {
          // Reverse geocoding using Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          }
        } catch (err) {
          console.error("Failed to fetch address", err);
          setError("Failed to fetch address from GPS. You can enter it manually.");
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        setError("Unable to retrieve your location. Please ensure location access is allowed.");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    if (!address) {
      setError("Please provide an address");
      return;
    }

    try {
      setIsSubmitting(true);
      const updateData = { phone, address };
      if (currentLat !== null && currentLong !== null) {
        updateData.currentLat = currentLat;
        updateData.currentLong = currentLong;
      }
      
      await updateUserProfile(updateData);
      
      // Update the user context via Redux
      await dispatch(checkAuth());
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-opacity duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative transform transition-all duration-300 scale-100">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-white relative">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-3xl font-extrabold tracking-tight pr-6">Complete Your Profile</h2>
          <p className="mt-2 text-indigo-100 text-sm font-medium">
            Please provide your contact details to unlock the full DoEz experience.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50/80 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-1.5 relative">
            <label className="block text-sm font-semibold text-gray-700">
              Phone Number <span className="text-pink-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 font-medium disabled:bg-gray-100 disabled:text-gray-400"
              placeholder="Enter 10-digit phone number"
              required
              disabled={!!user?.phone}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Delivery Address <span className="text-pink-500">*</span>
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 font-medium resize-none min-h-[100px]"
              placeholder="Enter your complete address manually or use GPS"
              required
            />
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="group flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <div className={`p-1.5 rounded-full bg-indigo-50 mr-2 group-hover:bg-indigo-100 transition-colors ${locationLoading ? 'animate-spin' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                {locationLoading ? "Fetching location..." : "Use Current GPS Location"}
              </button>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg tracking-wide shadow-lg transition-all duration-200 transform
                ${isSubmitting 
                  ? 'bg-indigo-400 cursor-not-allowed translate-y-0 shadow-none' 
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:shadow-md'}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Details...
                </span>
              ) : (
                'Save My Details'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerInfoModal;
