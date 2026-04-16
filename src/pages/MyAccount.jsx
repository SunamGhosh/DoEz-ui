import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, User, Mail, Phone, LogOut, Loader2, MapPin, Pencil, X, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { logout, checkAuth } from "../store/authSlice";
import { getUserProfile, updateUserProfile, uploadProfileImage } from "../apiservice/user";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/imageUtils";
import Reveal from "../components/Reveal";

function MyAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: authLoading } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getUserProfile();
      const data = res.data.data;
      setProfile(data);
      setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "", address: data.address || "" });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) {
      setPhoneError("Enter a valid 10-digit number"); return;
    }
    setPhoneError("");
    try {
      setSaving(true);
      await updateUserProfile(form);
      toast.success("Profile updated");
      setIsEditing(false);
      fetchProfile();
      dispatch(checkAuth());
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      setIsUploading(true);
      await uploadProfileImage(formData);
      toast.success("Photo updated");
      fetchProfile();
      dispatch(checkAuth());
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => { dispatch(logout()); navigate("/login"); };

  if (loading || authLoading) {
    return (
      <Layout noPadding>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm font-medium">Loading account...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout noPadding>
      <div className="min-h-screen bg-white antialiased">

        {/* ═══════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f36] via-[#1e2a4a] to-[#2563eb]" />
          <div className="absolute top-1/2 right-0 w-[55%] h-[140%] -translate-y-1/2 bg-gradient-to-l from-blue-500/20 via-blue-400/10 to-transparent rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-20 sm:pb-24">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white/20 overflow-hidden bg-white/10 shadow-xl">
                  {profile?.profileImage ? (
                    <img src={getImageUrl(profile.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                      <span className="text-3xl font-extrabold text-white">
                        {profile?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 transition-colors"
                >
                  <Camera className="w-4 h-4 text-gray-700" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                {profile?.name || "User"}
              </h1>
              <p className="text-white/50 text-sm">{profile?.email}</p>
              <span className="mt-3 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-semibold text-white/70 uppercase tracking-wider">
                {profile?.role || "Customer"}
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 50V25C360 0 1080 0 1440 25V50H0Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PROFILE DETAILS
        ═══════════════════════════════════════════ */}
        <section className="py-10 lg:py-14 bg-white">
          <Reveal>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-4">

              {/* Info card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">Profile Details</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-gray-600 hover:text-blue-600 text-sm font-semibold rounded-full transition-all"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
                    {[
                      { label: "Full Name", key: "name", type: "text", icon: <User size={15} />, placeholder: "Your name", required: true },
                      { label: "Email", key: "email", type: "email", icon: <Mail size={15} />, placeholder: "Email address", required: true },
                      { label: "Phone", key: "phone", type: "tel", icon: <Phone size={15} />, placeholder: "10-digit mobile number" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{f.icon}</span>
                          <input
                            type={f.type}
                            value={form[f.key]}
                            onChange={(e) => {
                              const val = f.key === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value;
                              setForm({ ...form, [f.key]: val });
                              if (f.key === "phone" && phoneError) setPhoneError("");
                            }}
                            placeholder={f.placeholder}
                            required={f.required}
                            className={`w-full pl-9 pr-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 ${phoneError && f.key === "phone" ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                          />
                        </div>
                        {f.key === "phone" && phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                      </div>
                    ))}

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Address</label>
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3.5 top-3 text-gray-400" />
                        <textarea
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder="Your address"
                          rows={2}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all text-sm text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => { setIsEditing(false); setPhoneError(""); }}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full text-sm transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-2.5 bg-[#1a1f36] hover:bg-blue-600 text-white font-semibold rounded-full text-sm transition-all shadow-md hover:shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {[
                      { icon: <User size={15} className="text-blue-500" />, label: "Name", value: profile?.name },
                      { icon: <Mail size={15} className="text-emerald-500" />, label: "Email", value: profile?.email },
                      { icon: <Phone size={15} className="text-violet-500" />, label: "Phone", value: profile?.phone, missing: !profile?.phone },
                      { icon: <MapPin size={15} className="text-amber-500" />, label: "Address", value: profile?.address, missing: !profile?.address },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 sm:px-6 py-4">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                          {row.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{row.label}</p>
                          <p className={`text-sm font-semibold mt-0.5 truncate ${row.missing ? "text-gray-300 italic font-normal" : "text-gray-900"}`}>
                            {row.value || "Not provided"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Incomplete profile nudge */}
              {profile && (!profile.phone || !profile.address) && !isEditing && (
                <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <User size={16} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">Complete your profile</p>
                    <p className="text-xs text-gray-500 mt-0.5">Add your phone and address for faster bookings.</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
                  >
                    Add <ArrowRight size={12} />
                  </button>
                </div>
              )}

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">Account</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  <button
                    onClick={() => navigate("/my-bookings")}
                    className="w-full flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <ArrowRight size={15} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">My Bookings</p>
                      <p className="text-xs text-gray-400 mt-0.5">View your booking history</p>
                    </div>
                    <ArrowRight size={15} className="text-gray-300 shrink-0" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-red-50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 bg-red-50 group-hover:bg-red-100 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                      <LogOut size={15} className="text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-600">Sign Out</p>
                      <p className="text-xs text-gray-400 mt-0.5">Log out of your account</p>
                    </div>
                  </button>
                </div>
              </div>

            </div>
          </Reveal>
        </section>

      </div>
    </Layout>
  );
}

export default MyAccount;
