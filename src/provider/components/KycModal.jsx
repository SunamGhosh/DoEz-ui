import React, { useState } from "react";
import { X, Upload, ShieldCheck, Landmark, FileText, CreditCard, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { submitFullKyc } from "../../apiservice/provider";

const FileInput = ({ id, name, file, onChange, label, icon: Icon, required }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
      {label} {!required && <span className="text-gray-300 font-normal normal-case">(optional)</span>}
    </label>
    <input type="file" id={id} name={name} onChange={onChange} className="hidden" />
    <label htmlFor={id}
      className="flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all text-gray-500 text-sm">
      <Icon size={16} className="shrink-0 text-gray-400" />
      <span className="truncate font-medium">{file ? file.name : "Choose file"}</span>
    </label>
  </div>
);

const KycModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ aadharNumber: "", panNumber: "", accountNumber: "", ifscCode: "" });
  const [files, setFiles] = useState({ aadharFile: null, panFile: null, passbookImage: null });

  if (!isOpen) return null;

  const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFile = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleNext = () => {
    if (!formData.aadharNumber || formData.aadharNumber.length !== 12 || !/^\d+$/.test(formData.aadharNumber)) {
      setError("Enter a valid 12-digit Aadhar number."); return;
    }
    if (!files.aadharFile) { setError("Upload your Aadhar card document."); return; }
    setError(""); setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const acc = formData.accountNumber.trim();
    if (!acc || !/^\d{9,18}$/.test(acc)) { toast.error("Account number must be 9–18 digits."); return; }
    const ifsc = formData.ifscCode.trim().toUpperCase();
    if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) { toast.error("Invalid IFSC (e.g. HDFC0001234)."); return; }
    if (!files.passbookImage) { setError("Upload passbook or cancelled cheque."); return; }

    setLoading(true); setError("");
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (files.aadharFile) data.append("aadharFile", files.aadharFile);
    if (files.panFile) data.append("panFile", files.panFile);
    if (files.passbookImage) data.append("passbookImage", files.passbookImage);

    try {
      await submitFullKyc(data);
      setSuccess(true);
      setTimeout(() => { onComplete?.(); onClose(); }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit KYC. Please try again.");
    } finally { setLoading(false); }
  };

  const inp = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1a1f36]/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-scaleIn">

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 2) * 100}%` }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Complete KYC Verification</h2>
              <p className="text-xs text-gray-400 mt-0.5">Step {step} of 2 — {step === 1 ? "Identity Details" : "Bank Details"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">KYC Submitted!</h3>
            <p className="text-gray-500 text-sm">Your documents are under review. You can now access your dashboard.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">{error}</div>
              )}

              {step === 1 && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard size={15} className="text-blue-600" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Identity Details</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Aadhar Number *</label>
                      <input name="aadharNumber" value={formData.aadharNumber} onChange={handleInput} placeholder="12-digit Aadhar No." className={inp} required />
                    </div>
                    <FileInput id="aadharFile" name="aadharFile" file={files.aadharFile} onChange={handleFile} label="Aadhar Upload *" icon={Upload} required />
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">PAN Number <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
                      <input name="panNumber" value={formData.panNumber} onChange={handleInput} placeholder="ABCDE1234F" className={inp} />
                    </div>
                    <FileInput id="panFile" name="panFile" file={files.panFile} onChange={handleFile} label="PAN Upload" icon={Upload} />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Landmark size={15} className="text-blue-600" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bank Details</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Account Number *</label>
                      <input name="accountNumber" value={formData.accountNumber} onChange={handleInput} placeholder="Bank account number" className={inp} required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">IFSC Code *</label>
                      <input name="ifscCode" value={formData.ifscCode} onChange={handleInput} placeholder="HDFC0001234" className={inp} required />
                    </div>
                    <FileInput id="passbookImage" name="passbookImage" file={files.passbookImage} onChange={handleFile} label="Passbook / Cheque *" icon={FileText} required />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              {step === 2
                ? <button type="button" onClick={() => { setError(""); setStep(1); }} className="px-5 py-2.5 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-xl transition-all">Back</button>
                : <div />}
              {step === 1
                ? <button type="button" onClick={handleNext} className="px-6 py-2.5 bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md">Continue</button>
                : <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md disabled:opacity-50">
                    {loading ? "Submitting..." : "Submit KYC"}
                  </button>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default KycModal;
