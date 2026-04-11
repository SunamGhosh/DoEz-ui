import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { X, User, Wrench, ArrowLeft, Mail, Lock, ChevronRight, KeyRound, ShieldCheck, Eye, EyeOff } from "lucide-react";
import {
  sendOTP,
  verifyOTP,
  registerUser,
  loginUser,
  clearError,
  resetOTPFlow,
  forgotPasswordSendOTP,
  forgotPasswordVerifyOTP,
  forgotPasswordReset,
  resetForgotPasswordFlow,
} from "../store/authSlice";

const RESEND_COOLDOWN = 60; // seconds

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, otpSent, otpVerified, isAuthenticated, user,
    forgotPasswordStep, forgotPasswordOtpSent, forgotPasswordOtpVerified,
    forgotPasswordSuccess, forgotPasswordEmail, forgotPasswordOtp,
  } =
    useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("login");
  const [signupStep, setSignupStep] = useState(1);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Resend OTP countdown state
  const [resendTimer, setResendTimer] = useState(0);

  // Login form state
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Signup form state
  const [signupData, setSignupData] = useState({
    email: "",
    otp: "",
    name: "",
    password: "",
    role: "customer",
  });

  // Forgot password form state
  const [forgotData, setForgotData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // ——— Countdown timer for resend ———
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ——— Redirect after auth ———
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "provider") navigate("/provider/dashboard");
      else navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // ——— Step progression ———
  useEffect(() => {
    if (otpSent && !otpVerified) setSignupStep(2);
    else if (otpVerified) setSignupStep(3);
  }, [otpSent, otpVerified]);

  // ——— Clear errors on tab switch ———
  useEffect(() => {
    dispatch(clearError());
  }, [activeTab, dispatch]);

  // ——— Handlers ———
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(loginData));
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    // Always force-replace any existing OTP (handles stale records & resend)
    dispatch(sendOTP({ email: signupData.email, forceResend: true }));
    setResendTimer(RESEND_COOLDOWN);
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    dispatch(sendOTP({ email: signupData.email, forceResend: true }));
    setResendTimer(RESEND_COOLDOWN);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    dispatch(verifyOTP({ email: signupData.email, otp: signupData.otp }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser({
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      role: signupData.role,
    }));
  };

  const handleBackToEmail = () => {
    setSignupStep(1);
    dispatch(resetOTPFlow());
    setSignupData((prev) => ({ ...prev, otp: "" }));
    setResendTimer(0);
  };

  const handleCloseModal = () => {
    dispatch(resetOTPFlow());
    setSignupStep(1);
    setResendTimer(0);
    navigate("/");
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    dispatch(resetOTPFlow());
    dispatch(resetForgotPasswordFlow());
    setSignupStep(1);
    setResendTimer(0);
    setPasswordMismatch(false);
    setForgotData({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  };

  // ——— Forgot Password Handlers ———
  const handleForgotSendOTP = (e) => {
    e.preventDefault();
    dispatch(forgotPasswordSendOTP({ email: forgotData.email, forceResend: true }));
    setResendTimer(RESEND_COOLDOWN);
  };

  const handleForgotResendOTP = () => {
    if (resendTimer > 0) return;
    dispatch(forgotPasswordSendOTP({ email: forgotData.email, forceResend: true }));
    setResendTimer(RESEND_COOLDOWN);
  };

  const handleForgotVerifyOTP = (e) => {
    e.preventDefault();
    dispatch(forgotPasswordVerifyOTP({ email: forgotData.email, otp: forgotData.otp }));
  };

  const handleForgotResetPassword = (e) => {
    e.preventDefault();
    setPasswordMismatch(false);

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    dispatch(forgotPasswordReset({
      email: forgotData.email || forgotPasswordEmail,
      otp: forgotData.otp || forgotPasswordOtp,
      newPassword: forgotData.newPassword,
    }));
  };

  const handleForgotBackToEmail = () => {
    dispatch(resetForgotPasswordFlow());
    setForgotData((prev) => ({ ...prev, otp: "" }));
    setResendTimer(0);
  };

  // Switch back to login after successful password reset
  useEffect(() => {
    if (forgotPasswordSuccess) {
      setActiveTab("login");
      setForgotData({ email: "", otp: "", newPassword: "", confirmPassword: "" });
      setPasswordMismatch(false);
    }
  }, [forgotPasswordSuccess]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ——— Shared Input styles ———
  const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400";
  const labelCls = "block text-sm font-bold text-gray-700 mb-2";
  const btnPrimary =
    "w-full py-4 bg-gradient-to-r from-teal-500 to-orange-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto animate-fadeIn">

        {/* Close button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-orange-500 flex items-center justify-center shadow-md">
              <span className="text-2xl font-black text-white">D</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-center text-gray-900 mb-1 tracking-tight">
            Welcome to EzFix
          </h1>
          <p className="text-center text-gray-400 text-sm mb-8">
            Sign in or create an account to continue
          </p>

          {/* Tab Toggle */}
          <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl">
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabSwitch(tab)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${activeTab === tab
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-sm text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* ——— LOGIN TAB ——— */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className={labelCls}>Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className={inputCls + " pl-10"}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={inputCls + " pl-10 pr-10"}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleTabSwitch("forgot")}
                  className="text-sm text-teal-600 hover:text-teal-700 font-bold underline underline-offset-2 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          {/* ——— REGISTER TAB ——— */}
          {activeTab === "register" && (
            <>
              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${signupStep >= step
                      ? "bg-gradient-to-r from-teal-500 to-orange-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-400"
                      }`}>
                      {step}
                    </div>
                    {i < 2 && (
                      <div className={`flex-1 h-1 rounded-full transition-all ${signupStep > step ? "bg-teal-500" : "bg-gray-100"}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* ——— Step 1: Email Input ——— */}
              {signupStep === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className={inputCls + " pl-10"}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      We'll send a 6-digit OTP to verify your email.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isValidEmail(signupData.email)}
                    className={btnPrimary}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending OTP...
                      </span>
                    ) : "Send OTP"}
                  </button>
                </form>
              )}

              {/* ——— Step 2: OTP Verification ——— */}
              {signupStep === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 font-semibold mb-2 group"
                  >
                    <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
                    Change Email
                  </button>

                  <div className="p-3 bg-teal-50 rounded-xl text-sm text-teal-700 font-medium">
                    OTP sent to <span className="font-bold">{signupData.email}</span>
                  </div>

                  <div>
                    <label className={labelCls}>Enter OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="• • • • • •"
                      value={signupData.otp}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                        })
                      }
                      maxLength={6}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl text-center text-3xl font-bold tracking-[0.4em] focus:outline-none focus:border-teal-500 transition-all"
                      required
                      autoComplete="one-time-code"
                    />
                    <p className="mt-2 text-xs text-gray-400 text-center">
                      Code is valid for 5 minutes.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || signupData.otp.length !== 6}
                    className={btnPrimary}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : "Verify OTP"}
                  </button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-gray-400">
                        Resend OTP in <span className="font-bold text-teal-600">{resendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-sm text-teal-600 hover:text-teal-700 font-bold underline underline-offset-2 disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* ——— Step 3: Account Details ——— */}
              {signupStep === 3 && (
                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      className={inputCls}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Min. 8 chars, uppercase, number & symbol"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className={inputCls + " pl-10 pr-10"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                      >
                        {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400">
                      Must have uppercase, lowercase, number & special character (e.g. @$!%*?&).
                    </p>
                  </div>

                  <div>
                    <label className={labelCls}>I am a</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "customer", icon: User, label: "Customer", color: "teal" },
                        { value: "provider", icon: Wrench, label: "Service Provider", color: "orange" },
                      ].map(({ value, icon: Icon, label, color }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSignupData({ ...signupData, role: value })}
                          className={`p-4 rounded-2xl border-2 transition-all ${signupData.role === value
                            ? `border-${color}-500 bg-${color}-50`
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <Icon
                            size={28}
                            className={`mx-auto mb-2 ${signupData.role === value ? `text-${color}-600` : "text-gray-400"
                              }`}
                          />
                          <p className={`font-bold text-sm ${signupData.role === value ? `text-${color}-700` : "text-gray-600"
                            }`}>
                            {label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className={btnPrimary}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Creating Account...
                      </span>
                    ) : "Create Account"}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ——— FORGOT PASSWORD TAB ——— */}
          {activeTab === "forgot" && (
            <>
              {/* Success Banner */}
              {forgotPasswordSuccess && (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                    <ShieldCheck size={16} />
                    Password reset successfully! Please sign in with your new password.
                  </p>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => handleTabSwitch("login")}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 font-semibold mb-4 group"
                >
                  <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Login
                </button>
                <h2 className="text-xl font-black text-gray-900 mb-1">Reset Password</h2>
                <p className="text-sm text-gray-400">We'll send you a code to verify your identity</p>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${forgotPasswordStep >= step
                      ? "bg-gradient-to-r from-teal-500 to-orange-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-400"
                      }`}>
                      {step}
                    </div>
                    {i < 2 && (
                      <div className={`flex-1 h-1 rounded-full transition-all ${forgotPasswordStep > step ? "bg-teal-500" : "bg-gray-100"}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* ——— Forgot Step 1: Email Input ——— */}
              {forgotPasswordStep === 1 && (
                <form onSubmit={handleForgotSendOTP} className="space-y-5">
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={forgotData.email}
                        onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                        className={inputCls + " pl-10"}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      We'll send a 6-digit OTP to verify your identity.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isValidEmail(forgotData.email)}
                    className={btnPrimary}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending OTP...
                      </span>
                    ) : "Send OTP"}
                  </button>
                </form>
              )}

              {/* ——— Forgot Step 2: OTP Verification ——— */}
              {forgotPasswordStep === 2 && (
                <form onSubmit={handleForgotVerifyOTP} className="space-y-5">
                  <button
                    type="button"
                    onClick={handleForgotBackToEmail}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 font-semibold mb-2 group"
                  >
                    <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
                    Change Email
                  </button>

                  <div className="p-3 bg-teal-50 rounded-xl text-sm text-teal-700 font-medium">
                    OTP sent to <span className="font-bold">{forgotData.email}</span>
                  </div>

                  <div>
                    <label className={labelCls}>Enter OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="• • • • • •"
                      value={forgotData.otp}
                      onChange={(e) =>
                        setForgotData({
                          ...forgotData,
                          otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                        })
                      }
                      maxLength={6}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl text-center text-3xl font-bold tracking-[0.4em] focus:outline-none focus:border-teal-500 transition-all"
                      required
                      autoComplete="one-time-code"
                    />
                    <p className="mt-2 text-xs text-gray-400 text-center">
                      Code is valid for 5 minutes.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || forgotData.otp.length !== 6}
                    className={btnPrimary}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : "Verify OTP"}
                  </button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-gray-400">
                        Resend OTP in <span className="font-bold text-teal-600">{resendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleForgotResendOTP}
                        disabled={loading}
                        className="text-sm text-teal-600 hover:text-teal-700 font-bold underline underline-offset-2 disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* ——— Forgot Step 3: New Password ——— */}
              {forgotPasswordStep === 3 && (
                <form onSubmit={handleForgotResetPassword} className="space-y-5">
                  <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700 font-medium flex items-center gap-2">
                    <ShieldCheck size={16} />
                    Email verified! Set your new password below.
                  </div>

                  <div>
                    <label className={labelCls}>New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showForgotNewPassword ? "text" : "password"}
                        placeholder="Min. 8 chars, uppercase, number & symbol"
                        value={forgotData.newPassword}
                        onChange={(e) => {
                          setForgotData({ ...forgotData, newPassword: e.target.value });
                          setPasswordMismatch(false);
                        }}
                        className={inputCls + " pl-10 pr-10"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                      >
                        {showForgotNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400">
                      Must have uppercase, lowercase, number & special character (e.g. @$!%*?&).
                    </p>
                  </div>

                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showForgotConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={forgotData.confirmPassword}
                        onChange={(e) => {
                          setForgotData({ ...forgotData, confirmPassword: e.target.value });
                          setPasswordMismatch(false);
                        }}
                        className={`${inputCls} pl-10 pr-10 ${passwordMismatch ? "border-red-400 ring-2 ring-red-200" : ""}`}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                      >
                        {showForgotConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordMismatch && (
                      <p className="mt-1.5 text-xs text-red-500 font-semibold">
                        Passwords do not match.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !forgotData.newPassword || !forgotData.confirmPassword}
                    className={btnPrimary}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Resetting Password...
                      </span>
                    ) : "Reset Password"}
                  </button>
                </form>
              )}

              {/* ——— Forgot Step 4: Success ——— */}
              {forgotPasswordStep === 4 && (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h3>
                  <p className="text-gray-500 mb-8">
                    Your password has been successfully reset. You can now login with your new password.
                  </p>
                  <button
                    onClick={() => {
                      dispatch(clearError());
                      dispatch(resetForgotPasswordFlow());
                      setActiveTab("login");
                    }}
                    className={btnPrimary}
                  >
                    Back to Login
                  </button>
                  <p className="mt-4 text-xs text-gray-400">
                    Redirecting to login...
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
