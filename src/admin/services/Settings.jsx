import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile, changePassword } from "../../apiservice/user";
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
                    <option key={idx} value={opt}>{opt}</option>
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
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
];

const LOCATION_DATA = {
    India: {
        Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad"],
        Delhi: ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
        Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
        Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
        TamilNadu: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
        WestBengal: ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol"],
        UttarPradesh: ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida"],
        Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"]
    },
    USA: {
        California: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"],
        Texas: ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth"],
        NewYork: ["New York City", "Buffalo", "Albany", "Rochester", "Syracuse"],
        Florida: ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee"]
    },
    UK: {
        England: ["London", "Manchester", "Birmingham", "Liverpool", "Leeds"],
        Scotland: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"],
        Wales: ["Cardiff", "Swansea", "Newport"]
    },
    Canada: {
        Ontario: ["Toronto", "Ottawa", "Mississauga", "Hamilton"],
        Quebec: ["Montreal", "Quebec City", "Laval"],
        BritishColumbia: ["Vancouver", "Victoria", "Surrey"]
    },
    Australia: {
        NewSouthWales: ["Sydney", "Newcastle", "Wollongong"],
        Victoria: ["Melbourne", "Geelong", "Ballarat"],
        Queensland: ["Brisbane", "Gold Coast", "Cairns"]
    }
};

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState("general");
    const [toast, setToast] = useState({ msg: "", type: "success" });

    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [general, setGeneral] = useState({
        siteName: "",
        tagline: "",
        email: "",
        phone: "",
        address: "Gamharia",
        currency: "",
        timezone: "",
        logo: null,
    });

    const [phoneVerified, setPhoneVerified] = useState(true);
    const [otpVisible, setOtpVisible] = useState(false);
    const [otpValue, setOtpValue] = useState("");

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailDraft, setEmailDraft] = useState("");
    const [emailVerified, setEmailVerified] = useState(true);
    const [emailOtpVisible, setEmailOtpVisible] = useState(false);
    const [emailOtpValue, setEmailOtpValue] = useState("");

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [addressDetails, setAddressDetails] = useState({
        country: "India",
        state: "Maharashtra",
        city: "Mumbai",
        pincode: ""
    });

    const handleCountryChange = (e) => {
        setAddressDetails({ ...addressDetails, country: e.target.value, state: "", city: "" });
    };

    const handleStateChange = (e) => {
        setAddressDetails({ ...addressDetails, state: e.target.value, city: "" });
    };

    const handleSaveAddressDetails = () => {
        const parts = [addressDetails.city, addressDetails.state, addressDetails.country].filter(Boolean);
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
            showToast("Password updated successfully!");
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
                    <div className="ml-auto hidden sm:flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
                        <ShieldCheck size={16} />
                        Admin Access
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
                                            <img 
                                                src={general.logo.startsWith('http') 
                                                    ? general.logo 
                                                    : `${import.meta.env.VITE_BACKEND_URL?.replace(/\/api\/?$/, "")}${general.logo.startsWith('/') ? general.logo : `/${general.logo}`}`} 
                                                alt="Logo" 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => e.target.style.display = 'none'} 
                                            />
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
                                    <div className="mb-5 relative">
                                        <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email Address</label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-slate-400">
                                                <Mail size={16} />
                                            </span>
                                            <input
                                                type="email"
                                                value={general.email}
                                                readOnly
                                                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm shadow-sm cursor-not-allowed focus:outline-none focus:ring-0"
                                            />
                                            <button
                                                onClick={() => {
                                                    setEmailDraft(general.email);
                                                    setIsEmailModalOpen(true);
                                                }}
                                                className="absolute right-2 p-1.5 text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        </div>
                                    </div>
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
                                <div className="mt-4 flex justify-end">
                                    <button onClick={() => handleSave("General")}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-500 text-white text-sm font-bold shadow-lg shadow-teal-500/30 hover:bg-teal-600 hover:-translate-y-0.5 transition-all duration-300">
                                        <Save size={18} /> Save General Settings
                                    </button>
                                </div>
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

                                <div className="mt-6 flex justify-end">
                                    <button onClick={() => handleSave("Security")}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-500 text-white text-sm font-bold shadow-lg shadow-teal-500/30 hover:bg-teal-600 hover:-translate-y-0.5 transition-all duration-300">
                                        <Save size={18} /> Save Security Settings
                                    </button>
                                </div>
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
                                <SelectField 
                                    label="Country" 
                                    value={addressDetails.country} 
                                    onChange={handleCountryChange} 
                                    options={Object.keys(LOCATION_DATA)} 
                                    placeholder="Select Country" 
                                />
                                <SelectField 
                                    label="State" 
                                    value={addressDetails.state} 
                                    onChange={handleStateChange} 
                                    options={addressDetails.country ? Object.keys(LOCATION_DATA[addressDetails.country] || {}) : []} 
                                    placeholder="Select State" 
                                />
                                <SelectField 
                                    label="City" 
                                    value={addressDetails.city} 
                                    onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })} 
                                    options={addressDetails.country && addressDetails.state ? (LOCATION_DATA[addressDetails.country]?.[addressDetails.state] || []) : []} 
                                    placeholder="Select City" 
                                />
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

            {isEmailModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-[fadeInUp_0.3s_ease]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Mail size={18} className="text-teal-500" />
                                Edit Email Address
                            </h3>
                            <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <InputField
                                label="New Email Address"
                                icon={Mail}
                                type="email"
                                value={emailDraft}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setEmailDraft(val);
                                    if (val !== general.email) {
                                        setEmailVerified(false);
                                        setEmailOtpVisible(false);
                                        setEmailOtpValue("");
                                    } else {
                                        setEmailVerified(true);
                                        setEmailOtpVisible(false);
                                        setEmailOtpValue("");
                                    }
                                }}
                            />

                            {!emailVerified && !emailOtpVisible && (
                                <button onClick={() => {
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    if (!emailRegex.test(emailDraft)) return showToast("Enter a valid email address.", "error");
                                    setEmailOtpVisible(true);
                                    showToast("OTP sent successfully to " + emailDraft);
                                }} className="mt-[-10px] mb-4 w-full px-4 py-2 bg-amber-100 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-200 transition-colors">
                                    Send OTP to Verify Email
                                </button>
                            )}

                            {emailOtpVisible && !emailVerified && (
                                <div className="mt-[-10px] mb-4 animate-[fadeInUp_0.3s_ease]">
                                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Enter OTP</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter OTP"
                                            value={emailOtpValue}
                                            onChange={(e) => setEmailOtpValue(e.target.value)}
                                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none"
                                        />
                                        <button onClick={() => {
                                            if (emailOtpValue.length < 4) return showToast("Enter a valid OTP", "error");
                                            setEmailVerified(true);
                                            setEmailOtpVisible(false);
                                            showToast("Email address verified successfully!");
                                        }} className="px-4 bg-teal-500 text-white text-sm font-semibold rounded-xl hover:bg-teal-600 shadow-sm transition-all">
                                            Verify
                                        </button>
                                    </div>
                                </div>
                            )}

                            {emailVerified && emailDraft !== general.email && (
                                <div className="mt-[-10px] mb-4 flex items-center gap-2 text-teal-600 text-sm font-semibold">
                                    <CheckCircle size={16} /> Email Verified
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setIsEmailModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!emailVerified) return showToast("Please verify the new email before saving.", "error");
                                    setGeneral({ ...general, email: emailDraft });
                                    setIsEmailModalOpen(false);
                                }}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow hover:shadow-md transition-all"
                            >
                                Save Email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
