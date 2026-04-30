import React, { useState } from "react";
import { Shield, Bell, Lock, Mail, Globe, LogOut, CheckCircle2, Sun, UserX, X, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../../apiservice/user";
import { logout } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Toggle = ({ checked, onChange }) => (
  <div onClick={onChange} className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-300 shrink-0 ${checked ? "bg-blue-600" : "bg-gray-200"}`}>
    <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-all duration-300 ${checked ? "translate-x-5" : ""}`} />
  </div>
);

function ProviderSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("security");
  const [loading, setLoading] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [toggles, setToggles] = useState({ emailNotif: true, pushNotif: true, autoAccept: false, vacationMode: false, publicProfile: true });

  const handleToggle = (key) => { setToggles(p => ({ ...p, [key]: !p[key] })); toast.success("Preference updated"); };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Passwords don't match");
    setLoading(true);
    try {
      await changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      toast.success("Password updated!");
      setShowPwModal(false);
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { dispatch(logout()); navigate("/login"); };

  const inp = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all";

  const tabs = [
    { id: "security", label: "Security", icon: <Lock size={16} /> },
    { id: "general", label: "General", icon: <Globe size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#1a1f36] rounded-2xl p-5 sm:p-7 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Provider</p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">Account Settings</h1>
          <p className="text-white/40 text-sm mt-1">Manage your preferences and security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Tab nav */}
        <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === t.id ? "bg-[#1a1f36] text-white shadow-md" : "bg-white border border-gray-100 text-gray-600 hover:text-gray-900 hover:border-gray-200"
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          {activeTab === "general" && (
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4">App Preferences</h3>
              {[
                { key: "vacationMode", label: "Vacation Mode", desc: "Pause bookings while away", icon: <Sun size={15} className="text-amber-500" /> },
                { key: "publicProfile", label: "Public Visibility", desc: "Show profile to customers", icon: <CheckCircle2 size={15} className="text-emerald-500" /> },
              ].map((t) => (
                <div key={t.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">{t.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                      <p className="text-xs text-gray-400">{t.desc}</p>
                    </div>
                  </div>
                  <Toggle checked={toggles[t.key]} onChange={() => handleToggle(t.key)} />
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100">
                <button onClick={handleLogout} className="flex items-center gap-2.5 px-5 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all">
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4">Security</h3>
              <div className="bg-[#1a1f36] rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-5"><Shield size={120} /></div>
                <div className="relative z-10">
                  <h4 className="font-extrabold mb-1">Password</h4>
                  <p className="text-white/40 text-xs mb-4">Keep your account secure with a strong password.</p>
                  <button onClick={() => setShowPwModal(true)} className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all">
                    Change Password
                  </button>
                </div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <div className="flex items-center gap-2.5 text-red-600 mb-2"><UserX size={16} /><h4 className="font-bold text-sm">Deactivate Account</h4></div>
                <p className="text-xs text-red-500/80 mb-4">Your profile will be hidden and you won't receive new bookings.</p>
                <button className="px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all">
                  Deactivate
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4">Notification Preferences</h3>
              {[
                { key: "emailNotif", label: "Email Notifications", desc: "Booking updates via email", icon: <Mail size={15} className="text-blue-500" /> },
                { key: "pushNotif", label: "Push Notifications", desc: "Instant mobile alerts", icon: <Bell size={15} className="text-violet-500" /> },
                { key: "autoAccept", label: "Auto-Accept Bookings", desc: "Instantly confirm new jobs", icon: <CheckCircle2 size={15} className="text-emerald-500" /> },
              ].map((t) => (
                <div key={t.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">{t.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                      <p className="text-xs text-gray-400">{t.desc}</p>
                    </div>
                  </div>
                  <Toggle checked={toggles[t.key]} onChange={() => handleToggle(t.key)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Password modal */}
      {showPwModal && (
        <div className="fixed inset-0 bg-[#1a1f36]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900">Change Password</h3>
              <button onClick={() => setShowPwModal(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"><X size={16} /></button>
            </div>
            <form onSubmit={handlePasswordChange} className="px-6 py-5 space-y-4">
              {[
                { label: "Current Password", key: "oldPassword" },
                { label: "New Password", key: "newPassword" },
                { label: "Confirm Password", key: "confirmPassword" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input type="password" value={pwForm[f.key]} onChange={(e) => setPwForm({ ...pwForm, [f.key]: e.target.value })} required className={inp} placeholder="••••••••" />
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowPwModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[#1a1f36] hover:bg-blue-600 text-white text-sm font-semibold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={14} className="animate-spin" />Saving...</> : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProviderSettings;
