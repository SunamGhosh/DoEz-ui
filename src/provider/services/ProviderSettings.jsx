import React, { useState } from "react";
import { 
  Shield, 
  Bell, 
  Clock, 
  Lock, 
  Mail, 
  Globe, 
  Trash2, 
  LogOut, 
  Moon, 
  Sun, 
  CheckCircle2, 
  ChevronRight,
  UserX,
  Languages
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../../apiservice/user";
import { logout } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function ProviderSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [toggles, setToggles] = useState({
    emailNotif: true,
    pushNotif: true,
    autoAccept: false,
    vacationMode: false,
    publicProfile: true,
  });

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Preference updated");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords don't match");
    }
    
    setLoading(true);
    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Password updated successfully!");
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-teal-500 rounded-2xl shadow-lg shadow-teal-500/20 text-white">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
            <p className="text-gray-500 font-medium">Manage your professional account preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <NavButton 
            active={activeTab === "general"} 
            onClick={() => setActiveTab("general")}
            icon={<Globe size={18} />}
            label="General"
          />
          <NavButton 
            active={activeTab === "security"} 
            onClick={() => setActiveTab("security")}
            icon={<Lock size={18} />}
            label="Security"
          />
          <NavButton 
            active={activeTab === "notifications"} 
            onClick={() => setActiveTab("notifications")}
            icon={<Bell size={18} />}
            label="Notifications"
          />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            {activeTab === "general" && (
              <div className="p-8 md:p-12 space-y-10 animate-in fade-in duration-500">
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Globe className="text-teal-500" size={20} />
                    App Preferences
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-800">Interface Language</p>
                        <p className="text-sm text-gray-500">Choose your preferred dashboard language</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
                        <Languages size={16} className="text-gray-400" />
                        <select className="bg-transparent font-bold text-sm outline-none">
                          <option>English (US)</option>
                          <option>Hindi (भारत)</option>
                          <option>Spanish</option>
                        </select>
                      </div>
                    </div>

                    <ToggleRow 
                      label="Vacation Mode" 
                      desc="Pause bookings while you are away" 
                      checked={toggles.vacationMode}
                      onChange={() => handleToggle("vacationMode")}
                      icon={<Sun size={18} className="text-orange-500" />}
                    />
                    
                    <ToggleRow 
                      label="Public Visibility" 
                      desc="Show your profile to potential customers" 
                      checked={toggles.publicProfile}
                      onChange={() => handleToggle("publicProfile")}
                      icon={<CheckCircle2 size={18} className="text-teal-500" />}
                    />
                  </div>
                </section>

                <section className="pt-8 border-t border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <LogOut className="text-red-500" size={20} />
                    Session Management
                  </h3>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all active:scale-95"
                  >
                    <LogOut size={20} />
                    Sign Out from EzFix
                  </button>
                </section>
              </div>
            )}

            {activeTab === "security" && (
              <div className="p-8 md:p-12 space-y-10 animate-in fade-in duration-500">
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Lock className="text-blue-500" size={20} />
                      Security Credentials
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-8 bg-linear-to-br from-gray-900 to-gray-800 rounded-[2rem] text-white relative overflow-hidden">
                      <Shield className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 opacity-10 -mr-12" />
                      <div className="relative z-10">
                        <h4 className="text-xl font-bold mb-2">Password Protection</h4>
                        <p className="text-gray-400 text-sm mb-6 max-w-sm">Last updated 3 months ago. We recommend changing it periodically to keep your account safe.</p>
                        <button 
                          onClick={() => setShowPasswordModal(true)}
                          className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-teal-50 transition-all active:scale-95"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                      <div className="flex items-center gap-4 mb-4 text-red-600">
                        <UserX size={24} />
                        <h4 className="font-bold">Deactivate Account</h4>
                      </div>
                      <p className="text-sm text-red-500/80 mb-6">Once you deactivate your account, your profile will be hidden and you won't receive new bookings.</p>
                      <button className="px-6 py-3 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all">
                        Deactivate Account
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="p-8 md:p-12 space-y-10 animate-in fade-in duration-500">
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Bell className="text-purple-500" size={20} />
                    Communication Preferences
                  </h3>
                  <div className="space-y-6">
                    <ToggleRow 
                      label="Email Notifications" 
                      desc="Receive booking updates and receipts via email" 
                      checked={toggles.emailNotif}
                      onChange={() => handleToggle("emailNotif")}
                      icon={<Mail size={18} className="text-blue-500" />}
                    />
                    <ToggleRow 
                      label="Push Notifications" 
                      desc="Get instant mobile alerts for new jobs" 
                      checked={toggles.pushNotif}
                      onChange={() => handleToggle("pushNotif")}
                      icon={<Bell size={18} className="text-purple-500" />}
                    />
                    <ToggleRow 
                      label="Automatic Confirmations" 
                      desc="Instantly accept bookings from top customers" 
                      checked={toggles.autoAccept}
                      onChange={() => handleToggle("autoAccept")}
                      icon={<CheckCircle2 size={18} className="text-emerald-500" />}
                    />
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Change Password</h3>
                  <p className="text-sm text-gray-500 font-medium">Protect your professional identity</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                  <input 
                    type="password"
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-semibold"
                    placeholder="••••••••"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                  />
                </div>

                <div className="h-px bg-gray-100 my-2"></div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                  <input 
                    type="password"
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-semibold"
                    placeholder="Min. 6 chars"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <input 
                    type="password"
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-semibold"
                    placeholder="Repeat password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-2 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Update Security"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
      active 
        ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1" 
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    }`}
  >
    {icon}
    {label}
  </button>
);

const ToggleRow = ({ label, desc, checked, onChange, icon }) => (
  <div className="group flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-2xl transition-colors group-hover:bg-white">
        {icon}
      </div>
      <div>
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-sm text-gray-400">{desc}</p>
      </div>
    </div>
    <div 
      onClick={onChange}
      className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
        checked ? "bg-teal-500 shadow-inner" : "bg-gray-200"
      }`}
    >
      <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ${
        checked ? "translate-x-6" : ""
      }`} />
    </div>
  </div>
);

export default ProviderSettings;
