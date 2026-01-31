import React, { useState } from "react";
import { X, Upload, ShieldCheck, Landmark, FileText, CreditCard, CheckCircle2 } from "lucide-react";
import { submitFullKyc } from "../../apiservice/provider";

const KycModal = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        aadharNumber: "",
        panNumber: "",
        accountNumber: "",
        ifscCode: "",
    });

    const [files, setFiles] = useState({
        aadharFile: null,
        panFile: null,
        passbookImage: null,
    });

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const data = new FormData();
        data.append("aadharNumber", formData.aadharNumber);
        data.append("panNumber", formData.panNumber);
        data.append("accountNumber", formData.accountNumber);
        data.append("ifscCode", formData.ifscCode);

        if (files.aadharFile) data.append("aadharFile", files.aadharFile);
        if (files.panFile) data.append("panFile", files.panFile);
        if (files.passbookImage) data.append("passbookImage", files.passbookImage);

        try {
            await submitFullKyc(data);
            setSuccess(true);
            if (onComplete) onComplete();
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to submit KYC. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
                    <div
                        className="h-full bg-linear-to-r from-teal-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                {success ? (
                    <div className="p-12 text-center animate-scaleIn">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">KYC Submitted!</h2>
                        <p className="text-gray-500">Your documents are under review. You can now access your dashboard.</p>
                    </div>
                ) : (
                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Complete Your Profile</h2>
                                <p className="text-sm text-gray-500 font-medium">Verify your identity to start receiving bookings</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {step === 1 && (
                                <div className="space-y-6 animate-slideRight">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard size={18} className="text-teal-600" />
                                        <h3 className="font-bold text-gray-800">Identity Details</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Aadhar Number</label>
                                            <input
                                                type="text"
                                                name="aadharNumber"
                                                value={formData.aadharNumber}
                                                onChange={handleInputChange}
                                                placeholder="12-digit Aadhar No."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Aadhar Upload</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    name="aadharFile"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="aadharFile"
                                                    required
                                                />
                                                <label
                                                    htmlFor="aadharFile"
                                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition-all text-gray-500"
                                                >
                                                    <Upload size={18} />
                                                    <span className="text-sm font-semibold">
                                                        {files.aadharFile ? files.aadharFile.name : "Choose File"}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    PAN Card Number <span className="text-gray-400 font-normal">(Optional)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="panNumber"
                                                    value={formData.panNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="ABCDE1234F"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    PAN Card Upload <span className="text-gray-400 font-normal">(Optional)</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        name="panFile"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                        id="panFile"
                                                    />
                                                    <label
                                                        htmlFor="panFile"
                                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition-all text-gray-500"
                                                    >
                                                        <Upload size={18} />
                                                        <span className="text-sm font-semibold">
                                                            {files.panFile ? files.panFile.name : "Choose File"}
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-slideRight">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Landmark size={18} className="text-orange-500" />
                                        <h3 className="font-bold text-gray-800">Bank Details</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Account Number</label>
                                            <input
                                                type="text"
                                                name="accountNumber"
                                                value={formData.accountNumber}
                                                onChange={handleInputChange}
                                                placeholder="Enter your bank account number"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">IFSC Code</label>
                                            <input
                                                type="text"
                                                name="ifscCode"
                                                value={formData.ifscCode}
                                                onChange={handleInputChange}
                                                placeholder="HDFC0001234"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Passbook Image</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    name="passbookImage"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="passbookImage"
                                                    required
                                                />
                                                <label
                                                    htmlFor="passbookImage"
                                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-orange-500 hover:bg-orange-50/30 transition-all text-gray-500"
                                                >
                                                    <FileText size={18} />
                                                    <span className="text-sm font-semibold">
                                                        {files.passbookImage ? files.passbookImage.name : "Upload Passbook"}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-8 py-3 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-12 py-3 bg-linear-to-r from-teal-500 to-orange-500 text-white font-black rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                                        >
                                            {loading ? "Submitting..." : "Submit KYC"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KycModal;
