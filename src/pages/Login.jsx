import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { X, User, Wrench, ArrowLeft } from "lucide-react";
import {
  sendOTP,
  verifyOTP,
  registerUser,
  loginUser,
  clearError,
  resetOTPFlow,
} from "../store/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    loading,
    error,
    otpSent,
    otpVerified,
    registrationPhone,
    isAuthenticated,
    user,
  } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("login"); 
  const [signupStep, setSignupStep] = useState(1); 

  // Login form state
  const [loginData, setLoginData] = useState({
    phone: "",
    password: "",
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    phone: "",
    otp: "",
    name: "",
    email: "",
    password: "",
    role: "customer", 
  });

  // Role-based redirection after successful login/signup
  // Wait for user data to be loaded before redirecting
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "provider") {
        navigate("/provider/dashboard");
      } else {
        // Default to homepage for customers and other roles
        navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Update signup step based on OTP flow
  useEffect(() => {
    if (otpSent && !otpVerified) {
      setSignupStep(2);
    } else if (otpVerified) {
      setSignupStep(3);
    }
  }, [otpSent, otpVerified]);

  // Clear error when switching tabs
  useEffect(() => {
    dispatch(clearError());
  }, [activeTab, dispatch]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser(loginData));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    dispatch(sendOTP(signupData.phone));
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    dispatch(verifyOTP({ phone: signupData.phone, otp: signupData.otp }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      phone: signupData.phone,
      role: signupData.role,
    };
    dispatch(registerUser(userData));
  };

  const handleBackToPhoneInput = () => {
    setSignupStep(1);
    dispatch(resetOTPFlow());
    setSignupData({ ...signupData, otp: "" });
  };

  const handleCloseModal = () => {
    dispatch(resetOTPFlow());
    setSignupStep(1);
    navigate("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 md:p-12 animate-fadeIn">
        <button
          onClick={handleCloseModal}
          className="sticky top-0 float-right p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="flex justify-center mb-6 clear-both">
          <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-teal-500 to-orange-500 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-black text-white">D</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-2 tracking-tight">
          Welcome to DoEz
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Sign in or create an account to continue
        </p>

        <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl">
          <button
            onClick={() => {
              setActiveTab("login");
              dispatch(resetOTPFlow());
              setSignupStep(1);
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === "login"
                ? "bg-white text-gray-900 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              dispatch(resetOTPFlow());
              setSignupStep(1);
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === "register"
                ? "bg-white text-gray-900 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-sm text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="1234567890"
                value={loginData.phone}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  })
                }
                pattern="[0-9]{10}"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        )}

        {activeTab === "register" && (
          <>
            {signupStep === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="1234567890"
                    value={signupData.phone}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    We'll send you an OTP to verify your number
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || signupData.phone.length !== 10}
                  className="w-full py-4 bg-linear-to-r from-teal-500 to-orange-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            )}

            {signupStep === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <button
                  type="button"
                  onClick={handleBackToPhoneInput}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 font-semibold mb-4"
                >
                  <ArrowLeft size={16} />
                  Change Number
                </button>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={signupData.otp}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                      })
                    }
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    OTP sent to {signupData.phone}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || signupData.otp.length !== 6}
                  className="w-full py-4 bg-linear-to-r from-teal-500 to-orange-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => dispatch(sendOTP(signupData.phone))}
                  disabled={loading}
                  className="w-full text-sm text-teal-600 hover:text-teal-700 font-semibold"
                >
                  Resend OTP
                </button>
              </form>
            )}

            {signupStep === 3 && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({ ...signupData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setSignupData({ ...signupData, role: "customer" })
                      }
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        signupData.role === "customer"
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <User
                        size={32}
                        className={`mx-auto mb-2 ${
                          signupData.role === "customer"
                            ? "text-teal-600"
                            : "text-gray-400"
                        }`}
                      />
                      <p
                        className={`font-bold text-sm ${
                          signupData.role === "customer"
                            ? "text-teal-700"
                            : "text-gray-600"
                        }`}
                      >
                        Customer
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSignupData({ ...signupData, role: "provider" })
                      }
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        signupData.role === "provider"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Wrench
                        size={32}
                        className={`mx-auto mb-2 ${
                          signupData.role === "provider"
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      />
                      <p
                        className={`font-bold text-sm ${
                          signupData.role === "provider"
                            ? "text-orange-700"
                            : "text-gray-600"
                        }`}
                      >
                        Service Provider
                      </p>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-linear-to-r from-teal-500 to-orange-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
