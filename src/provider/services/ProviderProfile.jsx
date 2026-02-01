import React, { useState, useEffect } from "react";
import {
  getProviderProfile,
  updateProviderProfile,
  uploadKycDocuments,
} from "../../apiservice/provider";
import {
  UserCircle,
  Briefcase,
  MapPin,
  Clock,
  ShieldCheck,
  Upload,
  Landmark,
} from "lucide-react";

const ProviderProfile = () => {
  const [provider, setProvider] = useState(null);
  const [formData, setFormData] = useState({});
  const [kycFiles, setKycFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProviderProfile();
        setProvider(res.data.data);
        setFormData(res.data.data);
      } catch (err) {
        setError("Could not fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setKycFiles(e.target.files);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await updateProviderProfile(formData);
      setProvider(res.data.data);
      alert("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Could not update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleKycUpload = async () => {
    if (kycFiles.length === 0) {
      setError("Please select files to upload");
      return;
    }
    setLoading(true);
    setError("");
    const kycFormData = new FormData();
    for (let i = 0; i < kycFiles.length; i++) {
      kycFormData.append("kycDocs", kycFiles[i]);
    }
    try {
      const res = await uploadKycDocuments(kycFormData);
      setProvider(res.data.data);
      alert("KYC documents uploaded successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Could not upload documents");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p>No profile found. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Profile</h1>
      <p className="text-gray-600 mb-8">Keep your information up to date.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Picture and KYC */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col items-center">
              <img
                className="h-32 w-32 rounded-full object-cover"
                src={
                  provider?.user?.avatar ||
                  provider?.avatar ||
                  "https://via.placeholder.com/150"
                }
                alt="Provider Avatar"
              />
              <h2 className="mt-4 text-2xl font-bold">
                {provider?.user?.name || provider?.name || "Provider"}
              </h2>
              <p className="text-gray-600">
                {provider?.user?.email || provider?.email || ""}
              </p>
            </div>
          </div>
          <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShieldCheck className="h-6 w-6 mr-2 text-cyan-700" />
              KYC Status
            </h3>
            <p
              className={`font-semibold ${provider.kycStatus === "Verified"
                ? "text-green-500"
                : "text-yellow-500"
                }`}
            >
              {provider.kycStatus}
            </p>
            <div className="mt-4">
              <label
                htmlFor="kyc-upload"
                className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Documents
              </label>
              <input
                id="kyc-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={handleKycUpload}
                className="mt-2 w-full px-4 py-2 bg-cyan-600 text-white rounded-lg shadow-md hover:bg-cyan-700 transition-colors duration-200"
              >
                Submit KYC
              </button>
            </div>
            {/* Expertise & Services Section */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-6 w-6 mr-2 text-cyan-700" />
                Expertise & Services
              </h3>
              {provider.providerServices && provider.providerServices.length > 0 ? (
                <div className="space-y-4">
                  {provider.providerServices.map((service, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-sm font-black text-cyan-700 uppercase tracking-wider mb-1">
                        {service.serviceId?.name || "Main Category"}
                      </div>
                      <div className="text-gray-900 font-bold">
                        {service.subServiceId?.name || "Sub-Service"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No services selected yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <form onSubmit={handleProfileUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Rates (₹/hr)
                  </label>
                  <Briefcase className="h-5 w-5 absolute top-10 left-3 text-gray-400" />
                  <input
                    name="rates"
                    type="text"
                    className="w-full pl-10 px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    value={formData.rates || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Work Area
                  </label>
                  <MapPin className="h-5 w-5 absolute top-10 left-3 text-gray-400" />
                  <input
                    name="workArea"
                    type="text"
                    className="w-full pl-10 px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    value={formData.workArea || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Experience (Years)
                  </label>
                  <Clock className="h-5 w-5 absolute top-10 left-3 text-gray-400" />
                  <input
                    name="experienceYears"
                    type="text"
                    className="w-full pl-10 px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    value={formData.experienceYears || ""}
                    onChange={handleChange}
                  />
                </div>

                {/* Aadhar and PAN */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Aadhar Number
                  </label>
                  <input
                    name="aadharNumber"
                    type="text"
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    value={formData.aadharNumber || ""}
                    onChange={handleChange}
                    placeholder="12-digit Aadhar No."
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    PAN Card Number
                  </label>
                  <input
                    name="panNumber"
                    type="text"
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    value={formData.panNumber || ""}
                    onChange={handleChange}
                    placeholder="ABCDE1234F"
                  />
                </div>

                {/* Bank Details */}
                <div className="md:col-span-2 pt-4 border-t border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                    <Landmark className="h-5 w-5 mr-2 text-cyan-600" />
                    Bank Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Account Number
                      </label>
                      <input
                        name="accountNumber"
                        type="text"
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        value={formData.bankDetails?.accountNumber || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        IFSC Code
                      </label>
                      <input
                        name="ifscCode"
                        type="text"
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        value={formData.bankDetails?.ifscCode || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails, ifscCode: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-right">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 text-white bg-cyan-600 rounded-lg shadow-xl hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transform transition-all duration-200 hover:scale-105 disabled:bg-cyan-300"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* KYC Documents View Section */}
          {(provider.aadharFile || provider.panFile || provider.bankDetails?.passbookImage) && (
            <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <ShieldCheck className="h-6 w-6 mr-2 text-cyan-700" />
                Uploaded KYC Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Aadhar Document */}
                {provider.aadharFile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhar Card
                    </label>
                    <div className="relative group">
                      <img
                        src={provider.aadharFile}
                        alt="Aadhar Card"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-cyan-500 transition-colors"
                        onClick={() => window.open(provider.aadharFile, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Upload className="text-white" size={32} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Click to view full size</p>
                  </div>
                )}

                {/* PAN Document */}
                {provider.panFile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Card
                    </label>
                    <div className="relative group">
                      <img
                        src={provider.panFile}
                        alt="PAN Card"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-cyan-500 transition-colors"
                        onClick={() => window.open(provider.panFile, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Upload className="text-white" size={32} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Click to view full size</p>
                  </div>
                )}

                {/* Bank Passbook */}
                {provider.bankDetails?.passbookImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Passbook / Cancelled Cheque
                    </label>
                    <div className="relative group">
                      <img
                        src={provider.bankDetails.passbookImage}
                        alt="Bank Passbook"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-cyan-500 transition-colors"
                        onClick={() => window.open(provider.bankDetails.passbookImage, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Upload className="text-white" size={32} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Click to view full size</p>
                  </div>
                )}
              </div>

              {/* KYC Status Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>KYC Status:</strong>{" "}
                  <span
                    className={`font-semibold ${provider.kycStatus === "approved"
                      ? "text-green-600"
                      : provider.kycStatus === "pending"
                        ? "text-yellow-600"
                        : provider.kycStatus === "rejected"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                  >
                    {provider.kycStatus ? provider.kycStatus.charAt(0).toUpperCase() + provider.kycStatus.slice(1) : "Not Submitted"}
                  </span>
                </p>
                {provider.kycStatus === "pending" && (
                  <p className="text-xs text-gray-500 mt-2">
                    Your KYC documents are under review. You will be notified once verified.
                  </p>
                )}
                {provider.kycStatus === "rejected" && (
                  <p className="text-xs text-red-500 mt-2">
                    Your KYC documents were rejected. Please re-upload the correct documents.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
