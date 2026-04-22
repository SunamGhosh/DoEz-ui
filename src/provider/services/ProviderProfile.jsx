import React, { useState, useEffect, useRef } from "react";
import { getProviderProfile, updateProviderProfile, uploadKycDocuments, uploadPaymentQr } from "../../apiservice/provider";
import { uploadProfileImage } from "../../apiservice/user";
import { getImageUrl } from "../../utils/imageUtils";
import { User, Briefcase, MapPin, Clock, ShieldCheck, Upload, Landmark, Camera, Loader2, Eye } from "lucide-react";
import { useDispatch } from "react-redux";
import { checkAuth } from "../../store/authSlice";
import toast from "react-hot-toast";

const inp = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";

const DocImg = ({ src, alt }) => src ? (
  <div className="relative group cursor-pointer" onClick={() => window.open(getImageUrl(src), "_blank")}>
    <img src={getImageUrl(src)} alt={alt} className="w-full h-36 object-cover rounded-xl border border-gray-100" />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
      <Eye className="text-white" size={22} />
    </div>
  </div>
) : <div className="w-full h-36 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 border border-dashed border-gray-200 text-sm">No image</div>;

const ProviderProfile = () => {
  const [provider, setProvider] = useState(null);
  const [formData, setFormData] = useState({});
  const [kycFiles, setKycFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const getProviderImageSrc = () => {
    if (!provider?.profileImage) return null;
    const rawUrl = getImageUrl(provider.profileImage);
    if (!rawUrl) return null;
    const stamp = provider?.updatedAt ? new Date(provider.updatedAt).getTime() : avatarVersion;
    const sep = rawUrl.includes("?") ? "&" : "?";
    return `${rawUrl}${sep}v=${stamp}`;
  };

  useEffect(() => {
    getProviderProfile()
      .then((res) => { setProvider(res.data.data); setFormData(res.data.data); })
      .catch(() => toast.error("Could not fetch profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProviderProfile(formData);
      setProvider(res.data.data);
      toast.success("Profile updated!");
    } catch (err) { toast.error(err.response?.data?.error || "Update failed"); }
    finally { setSaving(false); }
  };

  const handleKycUpload = async () => {
    if (!kycFiles.length) { toast.error("Select files first"); return; }
    setSaving(true);
    const fd = new FormData();
    for (let f of kycFiles) fd.append("kycDocs", f);
    try {
      const res = await uploadKycDocuments(fd);
      setProvider(res.data.data);
      toast.success("KYC uploaded!");
    } catch { toast.error("Upload failed"); }
    finally { setSaving(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    setUploadingImg(true);
    try {
      await uploadProfileImage(fd);
      const res = await getProviderProfile();
      setProvider(res.data.data);
      setAvatarVersion(Date.now());
      await dispatch(checkAuth());
      toast.success("Photo updated!");
    } catch { toast.error("Upload failed"); }
    finally {
      setUploadingImg(false);
      e.target.value = "";
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("paymentQr", file);
    setSaving(true);
    try {
      const res = await uploadPaymentQr(fd);
      setProvider(res.data.data);
      toast.success("Payment QR updated!");
    } catch { toast.error("Upload failed"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" /><p className="text-gray-500 text-sm">Loading profile...</p></div>
    </div>
  );

  const kycColor = provider?.kycStatus === "approved" ? "bg-emerald-100 text-emerald-700" : provider?.kycStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#1a1f36] rounded-2xl p-5 sm:p-7 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/10">
              {provider?.profileImage
                ? <img src={getProviderImageSrc()} alt="" className={`w-full h-full object-cover ${uploadingImg ? "opacity-50" : ""}`} />
                : <div className="w-full h-full flex items-center justify-center text-white/50"><User size={28} /></div>}
              {uploadingImg && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>}
            </div>
            <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 transition-colors">
              <Camera className="w-3.5 h-3.5 text-gray-700" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Provider Profile</p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{provider?.name || "Provider"}</h1>
            <p className="text-white/40 text-sm mt-0.5">{provider?.email}</p>
            <span className={`mt-2 inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${kycColor}`}>
              KYC: {provider?.kycStatus || "Pending"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — KYC + QR */}
        <div className="space-y-4">
          {/* KYC upload */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2"><ShieldCheck size={16} className="text-blue-600" />KYC Documents</h3>
            <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-all">
              <Upload size={15} /> Select files
              <input type="file" multiple className="hidden" onChange={(e) => setKycFiles(e.target.files)} />
            </label>
            {kycFiles.length > 0 && <p className="text-xs text-gray-400 mt-1.5">{kycFiles.length} file(s) selected</p>}
            <button onClick={handleKycUpload} disabled={saving} className="mt-3 w-full py-2.5 bg-[#1a1f36] hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50">
              {saving ? "Uploading..." : "Submit KYC"}
            </button>
          </div>

          {/* Payment QR */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-600" />Payment QR</h3>
            {provider?.paymentQrCode
              ? <img src={getImageUrl(provider.paymentQrCode)} alt="QR" className="w-full rounded-xl border border-gray-100 mb-3" />
              : <div className="w-full h-28 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 border border-dashed border-gray-200 mb-3 text-sm">No QR uploaded</div>}
            <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-all">
              <Upload size={15} /> Update QR
              <input type="file" className="hidden" onChange={handleQrUpload} accept="image/*" />
            </label>
          </div>

          {/* KYC docs view */}
          {(provider?.aadharFile || provider?.panFile || provider?.bankDetails?.passbookImage) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900">Uploaded Documents</h3>
              {provider.aadharFile && <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Aadhar</p><DocImg src={provider.aadharFile} alt="Aadhar" /></div>}
              {provider.panFile && <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">PAN</p><DocImg src={provider.panFile} alt="PAN" /></div>}
              {provider.bankDetails?.passbookImage && <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Passbook</p><DocImg src={provider.bankDetails.passbookImage} alt="Passbook" /></div>}
            </div>
          )}
        </div>

        {/* Right — Edit form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <h3 className="text-sm font-extrabold text-gray-900 mb-5">Edit Profile</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Work Area", name: "workArea", icon: <MapPin size={14} />, placeholder: "City / Area" },
                { label: "Experience (years)", name: "experienceYears", icon: <Clock size={14} />, placeholder: "e.g. 3" },
                { label: "Rates (₹/hr)", name: "rates", icon: <Briefcase size={14} />, placeholder: "e.g. 500" },
                { label: "Aadhar Number", name: "aadharNumber", icon: <ShieldCheck size={14} />, placeholder: "12-digit" },
                { label: "PAN Number", name: "panNumber", icon: <ShieldCheck size={14} />, placeholder: "ABCDE1234F" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{f.icon}</span>
                    <input name={f.name} value={formData[f.name] || ""} onChange={handleChange} placeholder={f.placeholder} className={inp + " pl-9"} />
                  </div>
                </div>
              ))}
            </div>

            {/* Bank details */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Landmark size={12} />Bank Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Account Number</label>
                  <input value={formData.bankDetails?.accountNumber || ""} onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })} placeholder="Account number" className={inp} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">IFSC Code</label>
                  <input value={formData.bankDetails?.ifscCode || ""} onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value } })} placeholder="IFSC code" className={inp} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#1a1f36] hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
