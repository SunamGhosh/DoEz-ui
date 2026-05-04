import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { changePassword } from "../../apiservice/user";
import { checkAuth } from "../../store/authSlice";
import {
    Settings,
    ShieldCheck,
    Bell,
    Lock,
    Wrench,
    IndianRupee,
    Save,
    Eye,
    EyeOff,
    UserCog,
    PlusCircle,
    ChevronRight,
    AlertTriangle,
    CheckCircle,
    X,
} from "lucide-react";

const Toggle = ({ checked, onChange, color = "teal" }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500/50
      ${checked ? `bg-teal-500 shadow-inner` : "bg-slate-200"}`}
    >
        <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300
        ${checked ? "translate-x-5" : "translate-x-1"}`}
        />
    </button>
);

const InputField = ({ label, icon: Icon, type = "text", value, onChange, placeholder, readOnly }) => (
    <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
        <div className="relative group">
            {Icon && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                    <Icon size={18} />
                </span>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full ${Icon ? "pl-11" : "pl-5"} pr-5 py-3 rounded-2xl border border-slate-200
          bg-slate-50/50 text-slate-800 text-sm shadow-sm
          focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
          hover:border-slate-300 transition-all duration-300
          ${readOnly ? "bg-slate-100 cursor-not-allowed text-slate-500 opacity-80" : ""}`}
            />
        </div>
    </div>
);

const SelectField = ({ label, icon: Icon, value, onChange, options = [], placeholder = "Select option" }) => (
    <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
        <div className="relative group">
            {Icon && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors z-10">
                    <Icon size={18} />
                </span>
            )}
            <select
                value={value}
                onChange={onChange}
                className={`w-full ${Icon ? "pl-11" : "pl-5"} pr-10 py-3 rounded-2xl border border-slate-200
          bg-slate-50/50 text-slate-800 text-sm shadow-sm appearance-none
          focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
          hover:border-slate-300 transition-all duration-300`}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((opt, idx) => (
                    <option key={opt._id || opt.id || idx} value={opt.name || opt.title || opt}>
                        {opt.name || opt.title || opt}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <ChevronRight size={16} className="rotate-90" />
            </div>
        </div>
    </div>
);

const SectionCard = ({ title, subtitle, icon: Icon, children }) => (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden mb-8 transition-all hover:shadow-md">
        <div className="flex items-center gap-4 px-8 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 shadow-sm ring-1 ring-teal-100/50">
                <Icon size={20} />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 text-base">{title}</h3>
                {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
        </div>
        <div className="p-8">{children}</div>
    </div>
);

const Toast = ({ msg, type, onClose }) =>
    msg ? (
        <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium
        animate-[fadeInUp_0.3s_ease]
        ${type === "success" ? "bg-gradient-to-r from-teal-500 to-emerald-500" : "bg-gradient-to-r from-red-500 to-rose-500"}`}
        >
            {type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {msg}
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
                <X size={16} />
            </button>
        </div>
    ) : null;

const TABS = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
];

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState("notifications");
    const [toast, setToast] = useState({ msg: "", type: "success" });

    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailDraft, setEmailDraft] = useState("");
    const [emailVerified, setEmailVerified] = useState(true);
    const [emailOtpVisible, setEmailOtpVisible] = useState(false);
    const [emailOtpValue, setEmailOtpValue] = useState("");

    const [notif, setNotif] = useState({
        emailBooking: true,
        emailPayment: true,
        emailProvider: true,
        smsBooking: false,
        smsPayment: true,
        pushEnabled: true,
        adminAlert: true,
    });

    const [showPass, setShowPass] = useState(false);
    const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

    const [maintenance, setMaintenance] = useState({
        maintenanceMode: false,
        providerRegistration: true,
        userRegistration: true,
        bookingEnabled: true,
        paymentEnabled: true,
        message: "We are currently under maintenance. Please check back shortly.",
    });

    const formatError = (err) => {
        const errorData = err.response?.data;
        const message = errorData?.message || errorData?.error || err.message || "";

        if (message.includes("E11000 duplicate key error")) {
            if (message.includes("code_1")) return "This Code is already taken. Please use a unique code.";
            if (message.includes("name_1")) return "This Name already exists. Please use a unique name.";
            return "This record already exists in the database.";
        }
        return message || "An unexpected error occurred";
    };

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
    };

    const handleSave = async (section) => {
        showToast("Updated!");
    };

    const handlePasswordChange = async () => {
        const currentTrimmed = passwords.current.trim();
        const newPassTrimmed = passwords.newPass.trim();
        const confirmTrimmed = passwords.confirm.trim();

        if (!currentTrimmed) return showToast("Enter current password", "error");

        // Password validation
        const hasUpper = /[A-Z]/.test(newPassTrimmed);
        const hasLower = /[a-z]/.test(newPassTrimmed);
        const hasNumber = /\d/.test(newPassTrimmed);
        const hasSpecial = /[@$!%*?&]/.test(newPassTrimmed);
        const isLongEnough = newPassTrimmed.length >= 8;

        if (!isLongEnough) return showToast("Password must be at least 8 characters long", "error");
        if (!hasUpper) return showToast("Password must contain at least one uppercase letter", "error");
        if (!hasLower) return showToast("Password must contain at least one lowercase letter", "error");
        if (!hasNumber) return showToast("Password must contain at least one number", "error");
        if (!hasSpecial) return showToast("Password must contain at least one special character (@$!%*?&)", "error");

        if (newPassTrimmed !== confirmTrimmed) return showToast("Passwords do not match", "error");

        try {
            // Using standard keys but ensuring they are trimmed
            const payload = {
                oldPassword: currentTrimmed,
                newPassword: newPassTrimmed
            };

            await changePassword(payload);

            setPasswords({ current: "", newPass: "", confirm: "" });
            showToast("Updated!");
        } catch (err) {
            console.error("DEBUG: Password change error:", err.response);

            // Extract the most descriptive error message possible
            let errMsg = "Failed to update password.";
            if (err.response?.data) {
                errMsg = err.response.data.message || err.response.data.error || err.response.data.msg || errMsg;
            } else if (err.request) {
                errMsg = "No response from server. Check your connection.";
            }

            // If it's still generic, add context
            if (errMsg === "Failed to update password.") {
                errMsg += " Check if your current password is correct.";
            }

            showToast(errMsg, "error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 font-sans">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 p-8 mb-10 transition-all hover:shadow-md">
                <div className="flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/20">
                        <Settings size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Admin Settings
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Full platform control — restricted to administrators only
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
                            <ShieldCheck size={16} />
                            Admin Access
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-8 flex-col lg:flex-row">
                <div className="lg:w-64 shrink-0">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 p-3 sticky top-8 flex flex-col gap-1">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300
                    ${isActive
                                            ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 translate-x-1"
                                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                >
                                    <Icon size={18} className={isActive ? "text-teal-400" : ""} />
                                    <span className="flex-1 text-left">{tab.label}</span>
                                    {isActive && <ChevronRight size={16} className="text-teal-400" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    {activeTab === "notifications" && (
                        <SectionCard title="Notification Preferences" subtitle="Control alert channels for admin & users" icon={Bell}>
                            {[
                                { key: "emailBooking", label: "Booking Confirmation Email", desc: "Send email when a booking is created" },
                                { key: "emailPayment", label: "Payment Receipt Email", desc: "Send email on successful payment" },
                                { key: "adminAlert", label: "Admin Alert Emails", desc: "Critical system alerts to admin inbox" },
                            ].map(({ key, label, desc }) => (
                                <div key={key} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{label}</p>
                                        <p className="text-xs text-slate-400">{desc}</p>
                                    </div>
                                    <Toggle checked={notif[key]} onChange={(v) => setNotif({ ...notif, [key]: v })} />
                                </div>
                            ))}
                            <div className="mt-6 flex justify-end">
                                <button onClick={() => handleSave("Notification")}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-500 text-white text-sm font-bold shadow-lg shadow-teal-500/30 hover:bg-teal-600 hover:-translate-y-0.5 transition-all duration-300">
                                    <Save size={18} /> Save Notification Settings
                                </button>
                            </div>
                        </SectionCard>
                    )}

                    {activeTab === "security" && (
                        <>
                            <SectionCard title="Change Admin Password" subtitle="Update your admin account password" icon={UserCog}>
                                <div className="max-w-md">
                                    {[
                                        { key: "current", label: "Current Password" },
                                        { key: "newPass", label: "New Password" },
                                        { key: "confirm", label: "Confirm New Password" },
                                    ].map(({ key, label }) => (
                                        <div key={key} className="mb-4">
                                            <label className="block text-sm font-semibold text-slate-600 mb-1.5">{label}</label>
                                            <div className="relative">
                                                <input
                                                    type={showPass ? "text" : "password"}
                                                    value={passwords[key]}
                                                    onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                                                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                                                    placeholder="••••••••"
                                                />
                                                <button onClick={() => setShowPass(!showPass)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {passwords.newPass && (
                                        <div className="mb-4">
                                            <div className="flex gap-1 h-1.5">
                                                {[1, 2, 3, 4].map((i) => {
                                                    const hasUpper = /[A-Z]/.test(passwords.newPass);
                                                    const hasLower = /[a-z]/.test(passwords.newPass);
                                                    const hasNumber = /\d/.test(passwords.newPass);
                                                    const hasSpecial = /[@$!%*?&]/.test(passwords.newPass);

                                                    const score = [
                                                        passwords.newPass.length >= 8,
                                                        hasUpper && hasLower,
                                                        hasNumber,
                                                        hasSpecial
                                                    ].filter(Boolean).length;

                                                    return (
                                                        <div key={i}
                                                            className={`flex-1 rounded-full transition-colors ${score >= i
                                                                ? score < 2 ? "bg-red-400" : score < 4 ? "bg-amber-400" : "bg-teal-500"
                                                                : "bg-slate-200"}`} />
                                                    );
                                                })}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {(() => {
                                                    const hasUpper = /[A-Z]/.test(passwords.newPass);
                                                    const hasLower = /[a-z]/.test(passwords.newPass);
                                                    const hasNumber = /\d/.test(passwords.newPass);
                                                    const hasSpecial = /[@$!%*?&]/.test(passwords.newPass);
                                                    const score = [passwords.newPass.length >= 8, hasUpper && hasLower, hasNumber, hasSpecial].filter(Boolean).length;
                                                    return score < 2 ? "Weak" : score < 3 ? "Fair" : score < 4 ? "Good" : "Strong";
                                                })()}
                                            </p>
                                        </div>
                                    )}

                                    <button onClick={handlePasswordChange}
                                        className="mt-2 flex items-center justify-center gap-2 w-full px-6 py-3 rounded-2xl bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300">
                                        <Lock size={18} /> Update Password
                                    </button>
                                </div>
                            </SectionCard>
                        </>
                    )}

                    {activeTab === "maintenance" && (
                        <>
                            {maintenance.maintenanceMode && (
                                <div className="mb-5 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
                                    <AlertTriangle size={18} className="shrink-0" />
                                    <span>Maintenance mode is currently <strong>ACTIVE</strong>. Users cannot access the platform.</span>
                                </div>
                            )}

                            <SectionCard title="Platform Maintenance" subtitle="Control platform-wide access & features" icon={Wrench}>
                                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                                    <div>
                                        <p className="text-sm font-bold text-red-600">🚨 Maintenance Mode</p>
                                        <p className="text-xs text-slate-400">Temporarily disable platform for all users</p>
                                    </div>
                                    <Toggle checked={maintenance.maintenanceMode}
                                        onChange={(v) => setMaintenance({ ...maintenance, maintenanceMode: v })} />
                                </div>

                                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">User Registration</p>
                                        <p className="text-xs text-slate-400">Allow new users to sign up</p>
                                    </div>
                                    <Toggle checked={maintenance.userRegistration}
                                        onChange={(v) => setMaintenance({ ...maintenance, userRegistration: v })} />
                                </div>

                                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">Provider Registration</p>
                                        <p className="text-xs text-slate-400">Allow new providers to register</p>
                                    </div>
                                    <Toggle checked={maintenance.providerRegistration}
                                        onChange={(v) => setMaintenance({ ...maintenance, providerRegistration: v })} />
                                </div>

                                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">Booking System</p>
                                        <p className="text-xs text-slate-400">Allow users to create new bookings</p>
                                    </div>
                                    <Toggle checked={maintenance.bookingEnabled}
                                        onChange={(v) => setMaintenance({ ...maintenance, bookingEnabled: v })} />
                                </div>

                                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">Payment Gateway</p>
                                        <p className="text-xs text-slate-400">Enable online payments for transactions</p>
                                    </div>
                                    <Toggle checked={maintenance.paymentEnabled}
                                        onChange={(v) => setMaintenance({ ...maintenance, paymentEnabled: v })} />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Maintenance Message</label>
                                    <textarea
                                        value={maintenance.message}
                                        onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none transition-all"
                                    />
                                </div>

                                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: "Users", on: maintenance.userRegistration },
                                        { label: "Providers", on: maintenance.providerRegistration },
                                        { label: "Bookings", on: maintenance.bookingEnabled },
                                        { label: "Payments", on: maintenance.paymentEnabled },
                                    ].map(({ label, on }) => (
                                        <div key={label}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border
                        ${on ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                                            {on ? <CheckCircle size={14} /> : <X size={14} />}
                                            {label} {on ? "On" : "Off"}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button onClick={() => handleSave("Maintenance")}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-500 text-white text-sm font-bold shadow-lg shadow-teal-500/30 hover:bg-teal-600 hover:-translate-y-0.5 transition-all duration-300">
                                        <Save size={18} /> Save Maintenance Settings
                                    </button>
                                </div>
                            </SectionCard>
                        </>
                    )}
                </div>
            </div>

            <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />
        </div>
    );
};

export default AdminSettings;
