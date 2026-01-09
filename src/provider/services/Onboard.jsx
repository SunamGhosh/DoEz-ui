import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  onboardAsProvider,
  uploadKycDocuments,
} from "../../apiservice/provider";

const Onboard = () => {
  const [formData, setFormData] = useState({
    rates: "",
    workArea: "",
    experienceYears: "",
  });
  const [kycFiles, setKycFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setKycFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onboardAsProvider(formData);

      if (kycFiles.length > 0) {
        const kycFormData = new FormData();
        for (let i = 0; i < kycFiles.length; i++) {
          kycFormData.append("kycDocs", kycFiles[i]);
        }
        await uploadKycDocuments(kycFormData);
      }

      navigate("/provider/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Become a Provider</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="rates"
              className="block text-sm font-medium text-gray-700"
            >
              Hourly Rate (₹)
            </label>
            <input
              id="rates"
              name="rates"
              type="number"
              required
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="workArea"
              className="block text-sm font-medium text-gray-700"
            >
              Work Area (e.g., San Francisco)
            </label>
            <input
              id="workArea"
              name="workArea"
              type="text"
              required
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="experienceYears"
              className="block text-sm font-medium text-gray-700"
            >
              Years of Experience
            </label>
            <input
              id="experienceYears"
              name="experienceYears"
              type="number"
              required
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="kyc"
              className="block text-sm font-medium text-gray-700"
            >
              KYC Documents (Max 3 files)
            </label>
            <input
              id="kyc"
              name="kyc"
              type="file"
              multiple
              required
              onChange={handleFileChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboard;
