import React, { useState, useEffect } from "react";
import {
  getProviderProfile,
  updateProviderProfile,
  uploadKycDocuments,
  uploadPaymentQr,
} from "../../apiservice/provider";
import { uploadProfileImage } from "../../apiservice/user";
import { getImageUrl } from "../../utils/imageUtils";
import {
  UserCircle,
  Briefcase,
  MapPin,
  Clock,
  ShieldCheck,
  Upload,
  Landmark,
  Camera,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { checkAuth } from "../../store/authSlice";

const ProviderProfile = () => {
  const [provider, setProvider] = useState(null);
  const [formData, setFormData] = useState({});
  const [kycFiles, setKycFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = React.useRef(null);
  const dispatch = useDispatch();

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgData = new FormData();
    imgData.append("image", file);

    try {
      setIsUploadingImage(true);
      await uploadProfileImage(imgData);
      
      // refetch profile to get new image
      const res = await getProviderProfile();
      setProvider(res.data.data);
      dispatch(checkAuth());
      alert("Profile picture updated successfully!");
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (loading && !isUploadingImage) {
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
            <div className="flex flex-col items-center relative">
              <div className="relative group">
                <img
                  className={`h-32 w-32 rounded-full object-cover border-4 border-gray-50 shadow-md ${isUploadingImage ? 'opacity-50' : 'opacity-100'}`}
                  src={
                    getImageUrl(provider?.profileImage) ||
                    "https://via.placeholder.com/150"
                  }
                  alt="Provider Avatar"
                />
                
                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-1 right-1 p-2 bg-cyan-600 border border-white text-white rounded-full shadow-lg hover:bg-cyan-700 transition-all hover:scale-105 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <h2 className="mt-4 text-2xl font-bold text-center">
                {provider?.name || "Provider"}
              </h2>
              <p className="text-gray-600">
                {provider?.email || ""}
              </p>
            </div>
          </div>
          <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShieldCheck className="h-6 w-6 mr-2 text-cyan-700" />
              KYC Status
            </h3>
            <p
              className={`font-semibold ${
                provider.kycStatus === "Verified"
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
            <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShieldCheck className="h-6 w-6 mr-2 text-cyan-700" />
                Payment QR Code
              </h3>
              {provider.paymentQrCode ? (
                <div className="mb-4">
                  <img
                    src={getImageUrl(provider.paymentQrCode)}
                    alt="Payment QR"
                    className="w-full rounded-lg shadow-md mb-2 border-2 border-dashed border-cyan-200 p-2"
                  />
                  <p className="text-xs text-center text-gray-500">
                    This QR will be shown to customers upon job completion.
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-4 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400">
                  <Upload size={32} className="mb-2" />
                  <p className="text-sm text-center italic">
                    No QR uploaded yet
                  </p>
                </div>
              )}
              <div>
                <label
                  htmlFor="qr-upload"
                  className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Update Payment QR
                </label>
                <input
                  id="qr-upload"
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append("paymentQr", file);
                      setLoading(true);
                      try {
                        const res = await uploadPaymentQr(formData);
                        setProvider(res.data.data);
                        alert("Payment QR updated successfully");
                      } catch (err) {
                        alert("Failed to upload QR code");
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                />
              </div>
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankDetails: {
                              ...formData.bankDetails,
                              accountNumber: e.target.value,
                            },
                          })
                        }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankDetails: {
                              ...formData.bankDetails,
                              ifscCode: e.target.value,
                            },
                          })
                        }
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
          {(provider.aadharFile ||
            provider.panFile ||
            provider.bankDetails?.passbookImage) && (
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
                        src={getImageUrl(provider.aadharFile)}
                        alt="Aadhar Card"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-cyan-500 transition-colors"
                        onClick={() =>
                          window.open(
                            getImageUrl(provider.aadharFile),
                            "_blank",
                          )
                        }
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Upload className="text-white" size={32} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Click to view full size
                    </p>
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
                        src={getImageUrl(provider.panFile)}
                        alt="PAN Card"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-cyan-500 transition-colors"
                        onClick={() =>
                          window.open(getImageUrl(provider.panFile), "_blank")
                        }
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Upload className="text-white" size={32} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Click to view full size
                    </p>
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
                        src={getImageUrl(provider.bankDetails.passbookImage)}
                        alt="Bank Passbook"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-cyan-500 transition-colors"
                        onClick={() =>
                          window.open(
                            getImageUrl(provider.bankDetails.passbookImage),
                            "_blank",
                          )
                        }
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Upload className="text-white" size={32} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Click to view full size
                    </p>
                  </div>
                )}
              </div>

              {/* KYC Status Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>KYC Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      provider.kycStatus === "approved"
                        ? "text-green-600"
                        : provider.kycStatus === "pending"
                          ? "text-yellow-600"
                          : provider.kycStatus === "rejected"
                            ? "text-red-600"
                            : "text-gray-500"
                    }`}
                  >
                    {provider.kycStatus
                      ? provider.kycStatus.charAt(0).toUpperCase() +
                        provider.kycStatus.slice(1)
                      : "Not Submitted"}
                  </span>
                </p>
                {provider.kycStatus === "pending" && (
                  <p className="text-xs text-gray-500 mt-2">
                    Your KYC documents are under review. You will be notified
                    once verified.
                  </p>
                )}
                {provider.kycStatus === "rejected" && (
                  <p className="text-xs text-red-500 mt-2">
                    Your KYC documents were rejected. Please re-upload the
                    correct documents.
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
