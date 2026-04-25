import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { X, User, Wrench, ArrowLeft, Mail, Lock, KeyRound, ShieldCheck, Eye, EyeOff } from "lucide-react";
import {
  sendOTP, verifyOTP, registerUser, loginUser, clearError, resetOTPFlow,
  forgotPasswordSendOTP, forgotPasswordVerifyOTP, forgotPasswordReset, resetForgotPasswordFlow,
} from "../store/authSlice";
import ezFixLogo from "../assets/images/EzFixLogo.jpeg";

const RESEND_COOLDOWN = 60;

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    loading, error, otpSent, otpVerified, isAuthenticated, user,
    forgotPasswordStep, forgotPasswordOtpSent, forgotPasswordOtpVerified,
    forgotPasswordSuccess, forgotPasswordEmail, forgotPasswordOtp,
  } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("login");
  const [signupStep, setSignupStep] = useState(1);
  const [showForgotNewPw, setShowForgotNewPw] = useState(false);
  const [showForgotConfirmPw, setShowForgotConfirmPw] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegisterPw, setShowRegisterPw] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", otp: "", name: "", password: "", role: "customer" });
  const [forgotData, setForgotData] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => (p <= 1 ? (clearInterval(t), 0) : p - 1)), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "provider") navigate("/provider/dashboard");
      else navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (otpSent && !otpVerified) setSignupStep(2);
    else if (otpVerified) setSignupStep(3);
  }, [otpSent, otpVerified]);

  useEffect(() => { dispatch(clearError()); }, [activeTab, dispatch]);

  useEffect(() => {
    if (forgotPasswordSuccess) {
      setActiveTab("login");
      setForgotData({ email: "", otp: "", newPassword: "", confirmPassword: "" });
      setPasswordMismatch(false);
    }
  }, [forgotPasswordSuccess]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    dispatch(resetOTPFlow());
    dispatch(resetForgotPasswordFlow());
    setSignupStep(1);
    setResendTimer(0);
    setPasswordMismatch(false);
    setForgotData({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  };

  const handleCloseModal = () => {
    dispatch(resetOTPFlow());
    setSignupStep(1);
    setResendTimer(0);
    navigate("/");
  };

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // shared classes
  const inp = "w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400";
  const btn = "w-full py-3 bg-[#1a1f36] hover:bg-blue-600 text-white font-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1a1f36]/70 backdrop-blur-md p-0 sm:p-4">
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[95vh] overflow-y-auto animate-scaleIn">

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <img src={ezFixLogo} alt="EzFix" className="h-7 sm:h-8 w-auto object-contain rounded-md" />
          </div>
          <button onClick={handleCloseModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-5 sm:py-6">

          {/* Tab toggle — only for login/register */}
          {activeTab !== "forgot" && (
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
              {["login", "register"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabSwitch(tab)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                    activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* ══════════ LOGIN ══════════ */}
          {activeTab === "login" && (
            <form onSubmit={(e) => { e.preventDefault(); dispatch(loginUser(loginData)); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" placeholder="your@email.com" value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className={inp} required autoComplete="email" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showLoginPw ? "text" : "password"} placeholder="Your password" value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={inp + " pr-10"} required autoComplete="current-password" />
                  <button type="button" onClick={() => setShowLoginPw(!showLoginPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                    {showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className={btn}>
                {loading ? <><Spinner /> Signing in...</> : "Sign In"}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => handleTabSwitch("forgot")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Forgot password?
                </button>
              </div>
            </form>
          )}

          {/* ══════════ REGISTER ══════════ */}
          {activeTab === "register" && (
            <>
              {/* Step dots */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      signupStep >= step ? "bg-[#1a1f36] text-white" : "bg-gray-100 text-gray-400"
                    }`}>{step}</div>
                    {i < 2 && <div className={`flex-1 h-0.5 rounded-full transition-all ${signupStep > step ? "bg-blue-500" : "bg-gray-100"}`} />}
                  </React.Fragment>
                ))}
                <span className="ml-2 text-xs text-gray-400 font-medium">
                  {signupStep === 1 ? "Email" : signupStep === 2 ? "Verify" : "Details"}
                </span>
              </div>

              {/* Step 1 — Email */}
              {signupStep === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); dispatch(sendOTP({ email: signupData.email, forceResend: true })); setResendTimer(RESEND_COOLDOWN); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" placeholder="your@email.com" value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className={inp} required autoComplete="email" />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400">We'll send a 6-digit OTP to verify your email.</p>
                  </div>
                  <button type="submit" disabled={loading || !isValidEmail(signupData.email)} className={btn}>
                    {loading ? <><Spinner /> Sending OTP...</> : "Send OTP"}
                  </button>
                </form>
              )}

              {/* Step 2 — OTP */}
              {signupStep === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); dispatch(verifyOTP({ email: signupData.email, otp: signupData.otp })); }} className="space-y-4">
                  <button type="button" onClick={() => { setSignupStep(1); dispatch(resetOTPFlow()); setSignupData((p) => ({ ...p, otp: "" })); setResendTimer(0); }}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
                    <ArrowLeft size={14} /> Change email
                  </button>
                  <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                    OTP sent to <span className="font-bold">{signupData.email}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Enter OTP</label>
                    <input type="text" inputMode="numeric" placeholder="• • • • • •"
                      value={signupData.otp}
                      onChange={(e) => setSignupData({ ...signupData, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                      required autoComplete="one-time-code" />
                    <p className="mt-1.5 text-xs text-gray-400 text-center">Valid for 5 minutes.</p>
                  </div>
                  <button type="submit" disabled={loading || signupData.otp.length !== 6} className={btn}>
                    {loading ? <><Spinner /> Verifying...</> : "Verify OTP"}
                  </button>
                  <div className="text-center text-sm">
                    {resendTimer > 0
                      ? <span className="text-gray-400">Resend in <span className="font-bold text-blue-600">{resendTimer}s</span></span>
                      : <button type="button" onClick={() => { dispatch(sendOTP({ email: signupData.email, forceResend: true })); setResendTimer(RESEND_COOLDOWN); }} disabled={loading} className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50">Resend OTP</button>
                    }
                  </div>
                </form>
              )}

              {/* Step 3 — Details */}
              {signupStep === 3 && (
                <form onSubmit={(e) => { e.preventDefault(); dispatch(registerUser({ name: signupData.name, email: signupData.email, password: signupData.password, role: signupData.role })); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Your full name" value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        className={inp} required autoComplete="name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showRegisterPw ? "text" : "password"} placeholder="Min. 8 chars" value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className={inp + " pr-10"} required minLength={8} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowRegisterPw(!showRegisterPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                        {showRegisterPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Uppercase, lowercase, number & special character.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">I am a</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "customer", icon: User, label: "Customer" },
                        { value: "provider", icon: Wrench, label: "Service Provider" },
                      ].map(({ value, icon: Icon, label }) => (
                        <button key={value} type="button" onClick={() => setSignupData({ ...signupData, role: value })}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            signupData.role === value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}>
                          <Icon size={22} className={`mx-auto mb-1.5 ${signupData.role === value ? "text-blue-600" : "text-gray-400"}`} />
                          <p className={`text-xs font-bold ${signupData.role === value ? "text-blue-700" : "text-gray-600"}`}>{label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className={btn}>
                    {loading ? <><Spinner /> Creating account...</> : "Create Account"}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ══════════ FORGOT PASSWORD ══════════ */}
          {activeTab === "forgot" && (
            <>
              <div className="mb-5">
                <button type="button" onClick={() => handleTabSwitch("login")}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors mb-4">
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
                <h2 className="text-lg font-extrabold text-gray-900">Reset Password</h2>
                <p className="text-sm text-gray-400 mt-0.5">We'll verify your identity before resetting.</p>
              </div>

              {/* Step dots */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      forgotPasswordStep >= step ? "bg-[#1a1f36] text-white" : "bg-gray-100 text-gray-400"
                    }`}>{step}</div>
                    {i < 2 && <div className={`flex-1 h-0.5 rounded-full transition-all ${forgotPasswordStep > step ? "bg-blue-500" : "bg-gray-100"}`} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Forgot Step 1 — Email */}
              {forgotPasswordStep === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); dispatch(forgotPasswordSendOTP({ email: forgotData.email, forceResend: true })); setResendTimer(RESEND_COOLDOWN); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" placeholder="your@email.com" value={forgotData.email}
                        onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                        className={inp} required autoComplete="email" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading || !isValidEmail(forgotData.email)} className={btn}>
                    {loading ? <><Spinner /> Sending OTP...</> : "Send OTP"}
                  </button>
                </form>
              )}

              {/* Forgot Step 2 — OTP */}
              {forgotPasswordStep === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); dispatch(forgotPasswordVerifyOTP({ email: forgotData.email, otp: forgotData.otp })); }} className="space-y-4">
                  <button type="button" onClick={() => { dispatch(resetForgotPasswordFlow()); setForgotData((p) => ({ ...p, otp: "" })); setResendTimer(0); }}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
                    <ArrowLeft size={14} /> Change email
                  </button>
                  <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                    OTP sent to <span className="font-bold">{forgotData.email}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Enter OTP</label>
                    <input type="text" inputMode="numeric" placeholder="• • • • • •"
                      value={forgotData.otp}
                      onChange={(e) => setForgotData({ ...forgotData, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                      required autoComplete="one-time-code" />
                    <p className="mt-1.5 text-xs text-gray-400 text-center">Valid for 5 minutes.</p>
                  </div>
                  <button type="submit" disabled={loading || forgotData.otp.length !== 6} className={btn}>
                    {loading ? <><Spinner /> Verifying...</> : "Verify OTP"}
                  </button>
                  <div className="text-center text-sm">
                    {resendTimer > 0
                      ? <span className="text-gray-400">Resend in <span className="font-bold text-blue-600">{resendTimer}s</span></span>
                      : <button type="button" onClick={() => { dispatch(forgotPasswordSendOTP({ email: forgotData.email, forceResend: true })); setResendTimer(RESEND_COOLDOWN); }} disabled={loading} className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50">Resend OTP</button>
                    }
                  </div>
                </form>
              )}

              {/* Forgot Step 3 — New Password */}
              {forgotPasswordStep === 3 && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setPasswordMismatch(false);
                  if (forgotData.newPassword !== forgotData.confirmPassword) { setPasswordMismatch(true); return; }
                  dispatch(forgotPasswordReset({ email: forgotData.email || forgotPasswordEmail, otp: forgotData.otp || forgotPasswordOtp, newPassword: forgotData.newPassword }));
                }} className="space-y-4">
                  <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
                    <ShieldCheck size={15} /> Email verified — set your new password.
                  </div>
                  {[
                    { label: "New Password", key: "newPassword", show: showForgotNewPw, toggle: () => setShowForgotNewPw(!showForgotNewPw) },
                    { label: "Confirm Password", key: "confirmPassword", show: showForgotConfirmPw, toggle: () => setShowForgotConfirmPw(!showForgotConfirmPw) },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{f.label}</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type={f.show ? "text" : "password"} placeholder="Min. 8 characters"
                          value={forgotData[f.key]}
                          onChange={(e) => { setForgotData({ ...forgotData, [f.key]: e.target.value }); setPasswordMismatch(false); }}
                          className={inp + " pr-10" + (passwordMismatch && f.key === "confirmPassword" ? " border-red-300 bg-red-50" : "")}
                          required minLength={8} autoComplete="new-password" />
                        <button type="button" onClick={f.toggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                          {f.show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {passwordMismatch && <p className="text-xs text-red-500 font-medium">Passwords do not match.</p>}
                  <button type="submit" disabled={loading || !forgotData.newPassword || !forgotData.confirmPassword} className={btn}>
                    {loading ? <><Spinner /> Resetting...</> : "Reset Password"}
                  </button>
                </form>
              )}

              {/* Forgot Step 4 — Success */}
              {forgotPasswordStep === 4 && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1">Password Reset!</h3>
                  <p className="text-gray-500 text-sm mb-6">You can now sign in with your new password.</p>
                  <button onClick={() => { dispatch(clearError()); dispatch(resetForgotPasswordFlow()); setActiveTab("login"); }} className={btn}>
                    Back to Sign In
                  </button>
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
