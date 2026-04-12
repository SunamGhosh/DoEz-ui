import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, User, Mail, Phone, Lock, LogOut, Globe, Moon, Sun, Loader2, MapPin } from "lucide-react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { logout, checkAuth } from "../store/authSlice";
import { getUserProfile, updateUserProfile, changePassword, uploadProfileImage } from "../apiservice/user";
import Modal from "../components/Modal";
import toast from "react-hot-toast";

function MyAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const fileInputRef = useRef(null);

  const [updateForm, setUpdateForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getUserProfile();
      setProfile(res.data.data);
      setUpdateForm({
        name: res.data.data.name || "",
        email: res.data.data.email || "",
        phone: res.data.data.phone || "",
        address: res.data.data.address || ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (updateForm.phone && !/^[0-9]{10}$/.test(updateForm.phone)) {
      setPhoneError("Please enter a valid 10-digit mobile number");
      return;
    }
    setPhoneError("");
    try {
      setLoading(true);
      await updateUserProfile(updateForm);
      toast.success("Profile updated successfully");
      setIsUpdateModalOpen(false);
      fetchProfile();
      dispatch(checkAuth());
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      setLoading(true);
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Password changed successfully");
      setIsPasswordModalOpen(false);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
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
      toast.success("Profile picture updated");
      fetchProfile();
      dispatch(checkAuth());
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl = BACKEND_URL.split('/api')[0];
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 border-teal-600 animate-spin mx-auto text-teal-600" />
            <p className="mt-4 text-gray-600 font-medium">Loading your account...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#F8FAFC] py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-10 animate-slideRight">
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Account</h1>
              <span className="text-teal-500 font-mono text-sm font-bold uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-full ring-1 ring-teal-100/50">Details</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Profile Info Card */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="relative bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden animate-fadeIn">
                {/* Visual Header Decoration */}
                <div className="h-40 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)] pointer-events-none"></div>
                  <div className="absolute top-0 right-0 p-6 opacity-20">
                    <User className="w-32 h-32 text-white -mr-16 -mt-16 rotate-12" />
                  </div>
                </div>

                <div className="px-8 pb-10">
                  {/* Profile Image & Essential Info */}
                  <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                    <div className="relative h-32 w-32 rounded-[28px] border-[6px] border-white shadow-xl overflow-hidden bg-slate-50 group">
                      {profile?.profileImage ? (
                        <img
                          src={getImageUrl(profile.profileImage)}
                          alt="Profile"
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600">
                          <span className="text-4xl font-bold">
                            {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                          </span>
                        </div>
                      )}
                      
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                        </div>
                      )}

                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-2 right-2 p-2 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-lg hover:bg-teal-600 transition-all hover:scale-105 active:scale-95"
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

                    <div className="text-center sm:text-left flex-1 pb-2">
                      <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-slate-900">
                          {profile?.name || "-"}
                        </h2>
                        <span className="px-3 py-1 bg-teal-50 text-teal-600 border border-teal-100 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          {profile?.role || "Customer"}
                        </span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 font-medium">
                        <Mail className="w-4 h-4 text-teal-500 opacity-70" />
                        <span className="text-sm font-mono tracking-tight">{profile?.email || "-"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-50">
                    <DetailItem 
                      label="Full Identity" 
                      value={profile?.name} 
                      icon={<User className="w-5 h-5" />} 
                      color="teal" 
                    />
                    <DetailItem 
                      label="Communication Link" 
                      value={profile?.email} 
                      icon={<Mail className="w-5 h-5" />} 
                      color="emerald" 
                    />
                    <DetailItem 
                      label="Mobile Connection" 
                      value={profile?.phone || "Not provided"} 
                      icon={<Phone className="w-5 h-5" />} 
                      color="blue" 
                      isMissing={!profile?.phone}
                    />
                    <DetailItem 
                      label="Membership Scope" 
                      value={profile?.role} 
                      icon={<Globe className="w-5 h-5" />} 
                      color="purple" 
                    />
                    <div className="sm:col-span-2">
                      <DetailItem 
                        label="Registered Location" 
                        value={profile?.address || "Address not provided"} 
                        icon={<MapPin className="w-5 h-5" />} 
                        color="slate" 
                        isMissing={!profile?.address}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Banner for Missing Info */}
              {profile && (!profile.phone || !profile.address) && (
                <div className="group bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-[28px] p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                    <MapPin className="w-24 h-24 text-amber-600" />
                  </div>
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-500 ring-4 ring-amber-100/50">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-center sm:text-left z-10">
                    <h4 className="font-bold text-slate-800 text-lg">Complete your persona</h4>
                    <p className="text-sm text-slate-600/80 mt-1 max-w-sm">Secure your account by adding your contact details and address for instant service matching.</p>
                  </div>
                  <button
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="shrink-0 px-6 py-3 bg-slate-900 hover:bg-teal-600 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-slate-100 active:scale-95 z-10"
                  >
                    Add Details
                  </button>
                </div>
              )}
            </div>

            {/* Side Action Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 flex flex-col gap-6 animate-scaleIn">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-1.5 bg-teal-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-slate-900">Preferences</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <SettingsButton
                    label="Update Personal Profile"
                    description="Edit your name and email"
                    icon={<User className="w-5 h-5" />}
                    color="teal"
                    onClick={() => setIsUpdateModalOpen(true)}
                  />
                  <SettingsButton
                    label="Security & Access"
                    description="Update your password"
                    icon={<Lock className="w-5 h-5" />}
                    color="blue"
                    onClick={() => setIsPasswordModalOpen(true)}
                  />
                  <SettingsButton
                    label="Regional Language"
                    description="English (Primary)"
                    icon={<Globe className="w-5 h-5" />}
                    color="indigo"
                  />
                  <SettingsButton
                    label="Visual Theme"
                    description="Light mode active"
                    icon={<Sun className="w-5 h-5" />}
                    color="slate"
                    secondaryIcon={<Moon className="w-4 h-4" />}
                  />

                  <div className="pt-4 mt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-4 rounded-3xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-all group group-active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                          <LogOut className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm">Sign Out Account</span>
                      </div>
                      <div className="w-5 h-5 flex items-center justify-center opacity-40 group-hover:translate-x-1 transition-transform">
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </div>
                    </button>
                    <p className="mt-4 text-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      Version 1.0.4-Stable
                    </p>
                  </div>
                </div>
              </div>

              {/* Extra Info / Tips Board */}
              <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-teal-500/20"></div>
                <div className="relative z-10">
                  <h4 className="font-bold text-white mb-2">Did you know?</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    A verified phone number speeds up your booking approval process by <span className="text-teal-400 font-bold">35%</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals - (Minimal change to keep existing structure but improve UI) */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Profile Identity"
      >
        <div className="p-1">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/50 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400"
                    placeholder="Enter your name"
                    value={updateForm.name}
                    onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/50 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400"
                    placeholder="Email address"
                    value={updateForm.email}
                    onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    className={`w-full pl-11 pr-4 py-4 bg-slate-50 border-0 ring-1 rounded-2xl focus:ring-2 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400 ${
                      phoneError ? "ring-rose-500 bg-rose-50/50" : "ring-slate-200 focus:ring-teal-500/50"
                    }`}
                    value={updateForm.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setUpdateForm({ ...updateForm, phone: val });
                      if (phoneError) setPhoneError("");
                    }}
                    maxLength={10}
                  />
                </div>
                {phoneError && <p className="text-xs text-rose-500 font-medium ml-1">{phoneError}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Location Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <textarea
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/50 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400 min-h-[100px] resize-none"
                    placeholder="Enter your full address"
                    value={updateForm.address}
                    onChange={(e) => setUpdateForm({ ...updateForm, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-teal-600 text-white rounded-2xl font-bold text-base shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : "Update Account"}
            </button>
          </form>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Security & Protection"
      >
        <div className="p-1">
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="grid gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-semibold"
                    placeholder="Existing password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="h-px bg-slate-100 my-1"></div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-semibold"
                    placeholder="Minimum 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-semibold"
                    placeholder="Repeat new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-base shadow-xl shadow-blue-100 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : "Seal New Password"}
            </button>
          </form>
        </div>
      </Modal>
    </Layout>
  );
}

const DetailItem = ({ label, value, icon, color, isMissing }) => {
  const themes = {
    teal: "text-teal-600 bg-teal-50 ring-teal-100/50",
    emerald: "text-emerald-600 bg-emerald-50 ring-emerald-100/50",
    blue: "text-blue-600 bg-blue-50 ring-blue-100/50",
    purple: "text-purple-600 bg-purple-50 ring-purple-100/50",
    slate: "text-slate-600 bg-slate-50 ring-slate-100/50",
  };

  return (
    <div className={`p-5 rounded-[24px] border ${isMissing ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-50' } shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] group`}>
      <div className="flex items-center gap-4">
        <div className={`shrink-0 p-3 rounded-2xl ring-4 ${themes[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">
            {label}
          </p>
          <p className={`text-base font-bold tracking-tight ${isMissing ? 'text-slate-300 italic font-medium text-sm' : 'text-slate-800'}`}>
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

const SettingsButton = ({ label, description, icon, color, onClick, secondaryIcon }) => {
  const themes = {
    teal: "text-teal-600 bg-teal-50/50 hover:bg-teal-50 border-teal-100/30",
    blue: "text-blue-600 bg-blue-50/50 hover:bg-blue-50 border-blue-100/30",
    indigo: "text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 border-indigo-100/30",
    slate: "text-slate-600 bg-slate-50/50 hover:bg-slate-50 border-slate-100/30",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-center justify-between p-4 rounded-[24px] border ${themes[color]} transition-all hover:translate-x-1 active:translate-x-0`}
    >
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-left">
          <span className="block font-bold text-slate-800 text-sm leading-tight">{label}</span>
          {description && <span className="text-[11px] text-slate-400 font-medium block mt-0.5">{description}</span>}
        </div>
      </div>
      {secondaryIcon ? (
        <div className="p-1 text-slate-300 group-hover:text-slate-500 transition-colors">
          {secondaryIcon}
        </div>
      ) : (
         <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
      )}
    </button>
  );
};

export default MyAccount;
