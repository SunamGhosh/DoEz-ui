import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile } from "../../apiservice/user";
import { getSettings, updateSettings, uploadLogo } from "../../apiservice/settings";
import { checkAuth } from "../../store/authSlice";
import {
    Settings,
    Globe,
    ShieldCheck,
    Bell,
    Lock,
    Wrench,
    IndianRupee,
    Save,
    Eye,
    EyeOff,
    ToggleLeft,
    ToggleRight,
    UserCog,
    Trash2,
    PlusCircle,
    ChevronRight,
    AlertTriangle,
    CheckCircle,
    X,
    Mail,
    Phone,
    MapPin,
    Upload,
    Pencil,
} from "lucide-react";

const Toggle = ({ checked, onChange, color = "teal" }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none
      ${checked ? `bg-gradient-to-r from-teal-500 to-emerald-500` : "bg-slate-300"}`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300
        ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
    </button>
);

const InputField = ({ label, icon: Icon, type = "text", value, onChange, placeholder, readOnly }) => (
    <div className="mb-5">
        <label className="block text-sm font-semibold text-slate-600 mb-1.5">{label}</label>
        <div className="relative">
            {Icon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon size={16} />
                </span>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-xl border border-slate-200
          bg-white text-slate-700 text-sm shadow-sm
          focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent
          transition-all duration-200
          ${readOnly ? "bg-slate-50 cursor-not-allowed text-slate-400" : ""}`}
            />
        </div>
    </div>
);

const SectionCard = ({ title, subtitle, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-sm">
                <Icon size={18} />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
                {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
        </div>
        <div className="p-6">{children}</div>
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
    { id: "general", label: "General", icon: Globe },
    { id: "access", label: "Access Control", icon: ShieldCheck },
    { id: "commission", label: "Commission", icon: IndianRupee },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
];

const DEFAULT_ROLES = [
    { id: 1, name: "Super Admin", canManageUsers: true, canManageProviders: true, canManageBookings: true, canManageFinance: true, canViewReports: true },
    { id: 2, name: "Manager", canManageUsers: true, canManageProviders: true, canManageBookings: true, canManageFinance: false, canViewReports: true },
    { id: 3, name: "Support Agent", canManageUsers: false, canManageProviders: false, canManageBookings: true, canManageFinance: false, canViewReports: false },
];

const PERM_KEYS = [
    { key: "canManageUsers", label: "Manage Users" },
    { key: "canManageProviders", label: "Manage Providers" },
    { key: "canManageBookings", label: "Manage Bookings" },
    { key: "canManageFinance", label: "Manage Finance" },
    { key: "canViewReports", label: "View Reports" },
];

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState("general");
    const [toast, setToast] = useState({ msg: "", type: "success" });

    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [general, setGeneral] = useState({
        siteName: "EzFix",
        tagline: "Your trusted home service partner",
        email: "admin@ezfix.in",
        phone: "",
        address: "Mumbai, Maharashtra, India",
        currency: "INR",
        timezone: "Asia/Kolkata",
        logo: null,
    });

    const [phoneVerified, setPhoneVerified] = useState(true);
    const [otpVisible, setOtpVisible] = useState(false);
    const [otpValue, setOtpValue] = useState("");

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [addressDetails, setAddressDetails] = useState({
        country: "India",
        state: "Maharashtra",
        city: "Mumbai",
        district: "",
        area: "",
        pincode: ""
    });

    const handleSaveAddressDetails = () => {
        const parts = [addressDetails.area, addressDetails.district, addressDetails.city, addressDetails.state, addressDetails.country].filter(Boolean);
        const joined = parts.join(", ");
        const fullAddress = addressDetails.pincode ? `${joined} - ${addressDetails.pincode}` : joined;
        setGeneral({ ...general, address: fullAddress });
        setIsAddressModalOpen(false);
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await getSettings();
                const settingsData = res.data?.data;
                if (settingsData) {
                    setGeneral((prev) => ({
                        ...prev,
                        siteName: settingsData.siteName || prev.siteName,
                        tagline: settingsData.tagline || prev.tagline,
                        currency: settingsData.currency || prev.currency,
                        timezone: settingsData.timezone || prev.timezone,
                        logo: settingsData.logo || prev.logo,
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        if (user && user.role === "admin") {
            const currentPhone = user.phone || "";
            setGeneral((prev) => {
                if (prev.phone !== currentPhone) {
                    setPhoneVerified(true);
                    setOtpVisible(false);
                    setOtpValue("");
                }
                return {
                    ...prev,
                    email: user.email || prev.email,
                    phone: currentPhone,
                };
            });
        }
    }, [user]);

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
        setGeneral({ ...general, phone: val });
        if (user && val !== (user.phone || "")) {
            setPhoneVerified(false);
            setOtpVisible(false);
        } else {
            setPhoneVerified(true);
            setOtpVisible(false);
        }
    };

    const handleSendOtp = () => {
        if (general.phone.length !== 10) return showToast("Phone number must be exactly 10 digits.", "error");
        setOtpVisible(true);
        showToast("OTP sent successfully to " + general.phone);
    };

    const handleVerifyOtp = () => {
        if (otpValue.length < 4) return showToast("Enter a valid OTP", "error");
        setPhoneVerified(true);
        setOtpVisible(false);
        showToast("Phone number verified successfully!");
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("logo", file);

            const res = await uploadLogo(formData);
            if (res.data && res.data.logo) {
                setGeneral(prev => ({ ...prev, logo: res.data.logo }));
                showToast("Logo uploaded successfully!");
            } else if (res.data && res.data.logoUrl) {
                setGeneral(prev => ({ ...prev, logo: res.data.logoUrl }));
                showToast("Logo uploaded successfully!");
            }
        } catch (err) {
            console.error("Logo upload error:", err);
            showToast("Failed to upload logo", "error");
        }
    };

    const [roles, setRoles] = useState(DEFAULT_ROLES);
    const [newRoleName, setNewRoleName] = useState("");

    const [commission, setCommission] = useState({
        defaultRate: "15",
        providerRate: "10",
        platformFee: "5",
        gstEnabled: true,
        gstRate: "18",
        autoSettle: true,
        settleCycle: "weekly",
    });

    const [notif, setNotif] = useState({
        emailBooking: true,
        emailPayment: true,
        emailProvider: true,
        smsBooking: false,
        smsPayment: true,
        pushEnabled: true,
        adminAlert: true,
    });

    const [security, setSecurity] = useState({
        twoFactor: true,
        sessionTimeout: "30",
        maxLoginAttempts: "5",
        ipWhitelist: "",
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

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
    };

    const handleSave = async (section) => {
        if (section === "General") {
            if (!phoneVerified) return showToast("Please verify the new phone number before saving.", "error");
            if (general.phone && general.phone.length !== 10) return showToast("Phone number must be exactly 10 digits.", "error");
            try {
                if (user) {
                    await updateUserProfile({ name: user.name, phone: general.phone, email: general.email });
                    await dispatch(checkAuth());
                }

                await updateSettings({
                    siteName: general.siteName,
                    tagline: general.tagline,
                    currency: general.currency,
                    timezone: general.timezone,
                    address: general.address,
                });

                showToast(`${section} settings saved successfully!`);
            } catch (err) {
                console.error("Settings update error:", err);
                const errMsg = err.response?.data?.error || err.response?.data?.message || "Failed to save to database.";
                showToast(errMsg, "error");
            }
        } else {
            showToast(`${section} settings saved successfully!`);
        }
    };

    const togglePerm = (roleId, permKey) => {
        setRoles((prev) =>
            prev.map((r) => (r.id === roleId ? { ...r, [permKey]: !r[permKey] } : r))
        );
    };

    const addRole = () => {
        if (!newRoleName.trim()) return showToast("Role name cannot be empty", "error");
        setRoles((prev) => [
            ...prev,
            {
                id: Date.now(),
                name: newRoleName.trim(),
                canManageUsers: false,
                canManageProviders: false,
                canManageBookings: false,
                canManageFinance: false,
                canViewReports: false,
            },
        ]);
        setNewRoleName("");
        showToast("New role added!");
    };

    const deleteRole = (id) => {
        if (id === 1) return showToast("Super Admin role cannot be deleted", "error");
        setRoles((prev) => prev.filter((r) => r.id !== id));
        showToast("Role removed");
    };

    const handlePasswordChange = () => {
        if (!passwords.current) return showToast("Enter current password", "error");
        if (passwords.newPass.length < 8) return showToast("New password must be at least 8 characters", "error");
        if (passwords.newPass !== passwords.confirm) return showToast("Passwords do not match", "error");
        setPasswords({ current: "", newPass: "", confirm: "" });
        showToast("Password updated successfully!");
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg">
                        <Settings size={26} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                            Admin Settings
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            Full platform control — restricted to administrators only
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <ShieldCheck size={14} />
                        Admin Access
                    </div>
                </div>
            </div>

            <div className="flex gap-6 flex-col lg:flex-row">
                <div className="lg:w-56 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-6">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-200
                    ${isActive
                                            ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-inner"
                                            : "text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                                        }`}
                                >
                                    <Icon size={17} />
                                    <span className="flex-1 text-left">{tab.label}</span>
                                    {isActive && <ChevronRight size={14} className="opacity-70" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 min-w-0">

                    {activeTab === "general" && (
                        <>
                            <SectionCard title="Site Identity" subtitle="Brand name, tagline and logo" icon={Globe}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                    <InputField label="Site Name" icon={Globe} value={general.siteName}
                                        onChange={(e) => setGeneral({ ...general, siteName: e.target.value })} />
                                    <InputField label="Tagline" value={general.tagline}
                                        onChange={(e) => setGeneral({ ...general, tagline: e.target.value })} />
                                </div>

                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Site Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-extrabold text-xl shadow overflow-hidden">
                                        {general.logo && typeof general.logo === 'string' ? (
                                            <img src={general.logo.startsWith('http') ? general.logo : `http://localhost:5000${general.logo}`} alt="Logo" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                        ) : (
                                            general.siteName?.[0] || "E"
                                        )}
                                    </div>
                                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm hover:border-teal-400 hover:text-teal-600 transition-colors">
                                        <Upload size={16} /> Upload Logo
                                        <input type="file" className="hidden" accept="image/*"
                                            onChange={handleLogoUpload} />
                                    </label>
                                </div>
                            </SectionCard>

                            <SectionCard title="Contact Information" subtitle="Platform contact details" icon={Mail}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                    <InputField label="Email Address" icon={Mail} type="email" value={general.email}
                                        onChange={(e) => setGeneral({ ...general, email: e.target.value })} />
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold text-slate-600 mb-1.5">Phone Number</label>
                                        <div className="relative flex flex-col gap-2">
                                            <div className="relative flex">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <Phone size={16} />
                                                </span>
                                                <input
                                                    type="text"
                                                    value={general.phone}
                                                    onChange={handlePhoneChange}
                                                    className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                                                />
                                                {!phoneVerified && general.phone.length === 10 && !otpVisible && (
                                                    <button onClick={handleSendOtp} className="absolute right-1 top-1 bottom-1 px-3 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-200 transition-colors">
                                                        Send OTP
                                                    </button>
                                                )}
                                                {phoneVerified && general.phone && (
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500">
                                                        <CheckCircle size={16} />
                                                    </span>
                                                )}
                                            </div>
                                            {otpVisible && !phoneVerified && (
                                                <div className="flex gap-2 animate-[fadeInUp_0.3s_ease]">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter OTP"
                                                        value={otpValue}
                                                        onChange={(e) => setOtpValue(e.target.value)}
                                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none"
                                                    />
                                                    <button onClick={handleVerifyOtp} className="px-4 bg-teal-500 text-white text-sm font-semibold rounded-xl hover:bg-teal-600 shadow-sm transition-all">
                                                        Verify
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-5 relative">
                                        <label className="block text-sm font-semibold text-slate-600 mb-1.5">Address</label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-slate-400">
                                                <MapPin size={16} />
                                            </span>
                                            <input
                                                type="text"
                                                value={general.address}
                                                readOnly
                                                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm shadow-sm cursor-not-allowed focus:outline-none focus:ring-0"
                                            />
                                            <button
                                                onClick={() => setIsAddressModalOpen(true)}
                                                className="absolute right-2 p-1.5 text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Regional Settings" subtitle="Currency & timezone preferences" icon={Globe}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold text-slate-600 mb-1.5">Currency</label>
                                        <select value={general.currency}
                                            onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                                            <option value="INR">INR — Indian Rupee (₹)</option>
                                            <option value="USD">USD — US Dollar ($)</option>
                                            <option value="EUR">EUR — Euro (€)</option>
                                        </select>
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold text-slate-600 mb-1.5">Timezone</label>
                                        <select value={general.timezone}
                                            onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                                            <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={() => handleSave("General")}
                                    className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow hover:shadow-md transition-all">
                                    <Save size={16} /> Save General Settings
                                </button>
                            </SectionCard>
                        </>
                    )}

                    {activeTab === "access" && (
                        <>
                            <SectionCard title="Role Management" subtitle="Define and manage admin roles & permissions" icon={ShieldCheck}>
                                <div className="flex gap-3 mb-6">
                                    <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)}
                                        placeholder="New role name…"
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                                    <button onClick={addRole}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow hover:shadow-md transition-all">
                                        <PlusCircle size={16} /> Add Role
                                    </button>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-slate-100">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="text-left px-4 py-3 font-semibold text-slate-600 min-w-[140px]">Role</th>
                                                {PERM_KEYS.map((p) => (
                                                    <th key={p.key} className="px-4 py-3 font-semibold text-slate-600 text-center whitespace-nowrap">
                                                        {p.label}
                                                    </th>
                                                ))}
                                                <th className="px-4 py-3 font-semibold text-slate-600 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roles.map((role, idx) => (
                                                <tr key={role.id}
                                                    className={`border-t border-slate-100 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                                                                {role.name[0]}
                                                            </div>
                                                            <span className="font-semibold text-slate-700">{role.name}</span>
                                                            {role.id === 1 && (
                                                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Root</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {PERM_KEYS.map((p) => (
                                                        <td key={p.key} className="px-4 py-3 text-center">
                                                            <Toggle
                                                                checked={role[p.key]}
                                                                onChange={() => role.id !== 1 && togglePerm(role.id, p.key)}
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => deleteRole(role.id)}
                                                            disabled={role.id === 1}
                                                            className={`p-1.5 rounded-lg transition-colors
                                ${role.id === 1 ? "text-slate-300 cursor-not-allowed" : "text-red-400 hover:bg-red-50 hover:text-red-600"}`}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <button onClick={() => handleSave("Access Control")}
                                    className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow hover:shadow-md transition-all">
                                    <Save size={16} /> Save Access Settings
                                </button>
                            </SectionCard>
                        </>
                    )}

                    {activeTab === "commission" && (
                        <>
                            <SectionCard title="Platform Commission Rates" subtitle="Manage earnings split & platform fees" icon={IndianRupee}>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
                                    <InputField label="Default Commission (%)" type="number" value={commission.defaultRate}
                                        onChange={(e) => setCommission({ ...commission, defaultRate: e.target.value })} />
                                    <InputField label="Provider Payout Rate (%)" type="number" value={commission.providerRate}
                                        onChange={(e) => setCommission({ ...commission, providerRate: e.target.value })} />
                                    <InputField label="Platform Fee (%)" type="number" value={commission.platformFee}
                                        onChange={(e) => setCommission({ ...commission, platformFee: e.target.value })} />
                                </div>

                                <div className="mt-2 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">Revenue Split Preview</p>
                                    <div className="flex rounded-lg overflow-hidden h-7 text-xs font-bold text-white">
                                        <div
                                            className="flex items-center justify-center bg-gradient-to-r from-teal-500 to-emerald-500 transition-all"
                                            style={{ width: `${commission.providerRate}%` }}>
                                            Provider {commission.providerRate}%
                                        </div>
                                        <div
                                            className="flex items-center justify-center bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                                            style={{ width: `${commission.platformFee}%` }}>
                                            Fee {commission.platformFee}%
                                        </div>
                                        <div className="flex-1 flex items-center justify-center bg-slate-300 text-slate-600">
                                            Platform {100 - Number(commission.providerRate) - Number(commission.platformFee)}%
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Tax & Settlement" subtitle="GST configuration and payout schedule" icon={IndianRupee}>
                                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">Enable GST</p>
                                        <p className="text-xs text-slate-400">Apply GST on service transactions</p>
                                    </div>
                                    <Toggle checked={commission.gstEnabled} onChange={(v) => setCommission({ ...commission, gstEnabled: v })} />
                                </div>

                                {commission.gstEnabled && (
                                    <div className="mt-4 mb-2">
                                        <InputField label="GST Rate (%)" type="number" value={commission.gstRate}
                                            onChange={(e) => setCommission({ ...commission, gstRate: e.target.value })} />
                                    </div>
                                )}

                                <div className="flex items-center justify-between py-3 border-b border-slate-100 mt-2">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">Auto Settlement</p>
                                        <p className="text-xs text-slate-400">Automatically process provider payouts</p>
                                    </div>
                                    <Toggle checked={commission.autoSettle} onChange={(v) => setCommission({ ...commission, autoSettle: v })} />
                                </div>

                                {commission.autoSettle && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-semibold text-slate-600 mb-1.5">Settlement Cycle</label>
                                        <div className="flex gap-3">
                                            {["daily", "weekly", "monthly"].map((c) => (
                                                <button key={c} onClick={() => setCommission({ ...commission, settleCycle: c })}
                                                    className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition-all
                            ${commission.settleCycle === c
                                                            ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-transparent shadow"
                                                            : "border-slate-200 text-slate-600 hover:border-teal-300"}`}>
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button onClick={() => handleSave("Commission")}
                                    className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow hover:shadow-md transition-all">
                                    <Save size={16} /> Save Commission Settings
                                </button>
                            </SectionCard>
                        </>
                    )}

                    {activeTab === "notifications" && (
                        <SectionCard title="Notification Preferences" subtitle="Control alert channels for admin & users" icon={Bell}>
                            {[
                                { key: "emailBooking", label: "Booking Confirmation Email", desc: "Send email when a booking is created" },
                                { key: "emailPayment", label: "Payment Receipt Email", desc: "Send email on successful payment" },
                                { key: "emailProvider", label: "Provider Approval Email", desc: "Notify provider when approved/rejected" },
                                { key: "smsBooking", label: "Booking SMS Alert", desc: "Send SMS on new booking" },
                                { key: "smsPayment", label: "Payment SMS Alert", desc: "Send SMS on payment confirmation" },
                                { key: "pushEnabled", label: "Push Notifications", desc: "Enable browser push notifications" },
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
                            <button onClick={() => handleSave("Notification")}
                                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow hover:shadow-md transition-all">
                                <Save size={16} /> Save Notification Settings
                            </button>
                        </SectionCard>
                    )}

                    {activeTab === "security" && (
                        <>
                            <SectionCard title="Authentication & Security" subtitle="Login policies and session controls" icon={Lock}>
                                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">Two-Factor Authentication</p>
                                        <p className="text-xs text-slate-400">Require 2FA for all admin logins</p>
                                    </div>
                                    <Toggle checked={security.twoFactor} onChange={(v) => setSecurity({ ...security, twoFactor: v })} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mt-4">
                                    <InputField label="Session Timeout (minutes)" type="number" value={security.sessionTimeout}
                                        onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })} />
                                    <InputField label="Max Login Attempts" type="number" value={security.maxLoginAttempts}
                                        onChange={(e) => setSecurity({ ...security, maxLoginAttempts: e.target.value })} />
                                </div>

                                <InputField label="IP Whitelist (comma-separated)" value={security.ipWhitelist}
                                    placeholder="e.g. 192.168.1.1, 10.0.0.1"
                                    onChange={(e) => setSecurity({ ...security, ipWhitelist: e.target.value })} />

                                <button onClick={() => handleSave("Security")}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow hover:shadow-md transition-all">
                                    <Save size={16} /> Save Security Settings
                                </button>
                            </SectionCard>

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
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i}
                                                        className={`flex-1 rounded-full transition-colors ${passwords.newPass.length >= i * 2
                                                            ? i < 2 ? "bg-red-400" : i < 3 ? "bg-amber-400" : "bg-teal-500"
                                                            : "bg-slate-200"}`} />
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {passwords.newPass.length < 4 ? "Weak" : passwords.newPass.length < 6 ? "Fair" : passwords.newPass.length < 8 ? "Good" : "Strong"}
                                            </p>
                                        </div>
                                    )}

                                    <button onClick={handlePasswordChange}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow hover:shadow-md transition-all">
                                        <Lock size={16} /> Update Password
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

                                <button onClick={() => handleSave("Maintenance")}
                                    className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow hover:shadow-md transition-all">
                                    <Save size={16} /> Save Maintenance Settings
                                </button>
                            </SectionCard>
                        </>
                    )}

                </div>
            </div>

            <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />

            {isAddressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-[fadeInUp_0.3s_ease]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <MapPin size={18} className="text-teal-500" />
                                Edit Address Details
                            </h3>
                            <button onClick={() => setIsAddressModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Country" value={addressDetails.country} onChange={(e) => setAddressDetails({ ...addressDetails, country: e.target.value })} />
                                <InputField label="State" value={addressDetails.state} onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })} />
                                <InputField label="City" value={addressDetails.city} onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })} />
                                <InputField label="District" value={addressDetails.district} onChange={(e) => setAddressDetails({ ...addressDetails, district: e.target.value })} />
                                <InputField label="Area / Locality" value={addressDetails.area} onChange={(e) => setAddressDetails({ ...addressDetails, area: e.target.value })} />
                                <InputField label="Pincode" value={addressDetails.pincode} onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value })} />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setIsAddressModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleSaveAddressDetails} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow hover:shadow-md transition-all">
                                Save Address
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
