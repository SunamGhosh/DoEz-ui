import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api";

// AsyncThunk for checking current auth status
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/auth/me");
      return response.data;
    } catch (error) {
      return rejectWithValue("Not authenticated");
    }
  }
);

// AsyncThunk for sending OTP
export const sendOTP = createAsyncThunk(
  "auth/sendOTP",
  async ({ email, forceResend = false }, { rejectWithValue }) => {
    try {
      const response = await API.post("/users/register/send-otp", { email, forceResend });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

// AsyncThunk for verifying OTP
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await API.post("/users/register/verify-otp", { email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Invalid OTP");
    }
  }
);

// AsyncThunk for completing registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post("/users", userData);
      // Fetch fresh user data after successful registration
      await dispatch(checkAuth());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// AsyncThunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post("/auth/login", { email, password });
      // Fetch fresh user data after successful login
      await dispatch(checkAuth());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// AsyncThunk for forgot password — send OTP
export const forgotPasswordSendOTP = createAsyncThunk(
  "auth/forgotPasswordSendOTP",
  async ({ email, forceResend = false }, { rejectWithValue }) => {
    try {
      const response = await API.post("/users/forgot-password/send-otp", { email, forceResend });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

// AsyncThunk for forgot password — verify OTP
export const forgotPasswordVerifyOTP = createAsyncThunk(
  "auth/forgotPasswordVerifyOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await API.post("/users/forgot-password/verify-otp", { email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Invalid OTP");
    }
  }
);

// AsyncThunk for forgot password — reset password
export const forgotPasswordReset = createAsyncThunk(
  "auth/forgotPasswordReset",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await API.post("/users/forgot-password/reset", { email, otp, newPassword });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    authChecked: false, // Track if we've checked auth status

    // OTP flow states
    otpSent: false,
    otpVerified: false,
    registrationEmail: null,

    // Forgot password flow states
    forgotPasswordStep: 1,
    forgotPasswordOtpSent: false,
    forgotPasswordOtpVerified: false,
    forgotPasswordSuccess: false,
    forgotPasswordEmail: null,
    forgotPasswordOtp: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOTPFlow: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.registrationEmail = null;
      state.error = null;
    },
    resetForgotPasswordFlow: (state) => {
      state.forgotPasswordStep = 1;
      state.forgotPasswordOtpSent = false;
      state.forgotPasswordOtpVerified = false;
      state.forgotPasswordSuccess = false;
      state.forgotPasswordEmail = null;
      state.forgotPasswordOtp = null;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.otpVerified = false;
      state.registrationEmail = null;
      state.forgotPasswordStep = 1;
      state.forgotPasswordOtpSent = false;
      state.forgotPasswordOtpVerified = false;
      state.forgotPasswordSuccess = false;
      state.forgotPasswordEmail = null;
      state.forgotPasswordOtp = null;
    },
  },
  extraReducers: (builder) => {
    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.authChecked = true;
      });

    // Send OTP
    builder
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.registrationEmail = action.meta.arg.email; // Store the email
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false;
        state.otpVerified = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Register User
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        // User data will be set by checkAuth() which is called in the thunk
        state.isAuthenticated = true;
        // Reset OTP flow
        state.otpSent = false;
        state.otpVerified = false;
        state.registrationEmail = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login User
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
        // User data will be set by checkAuth() which is called in the thunk
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Forgot Password — Send OTP
    builder
      .addCase(forgotPasswordSendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordSendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotPasswordOtpSent = true;
        state.forgotPasswordStep = 2;
        state.forgotPasswordEmail = action.meta.arg.email;
      })
      .addCase(forgotPasswordSendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Forgot Password — Verify OTP
    builder
      .addCase(forgotPasswordVerifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordVerifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotPasswordOtpVerified = true;
        state.forgotPasswordStep = 3;
        state.forgotPasswordOtp = action.meta.arg.otp;
      })
      .addCase(forgotPasswordVerifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Forgot Password — Reset Password
    builder
      .addCase(forgotPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.forgotPasswordSuccess = true;
        // Reset flow states
        state.forgotPasswordStep = 1;
        state.forgotPasswordOtpSent = false;
        state.forgotPasswordOtpVerified = false;
        state.forgotPasswordEmail = null;
        state.forgotPasswordOtp = null;
      })
      .addCase(forgotPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetOTPFlow, resetForgotPasswordFlow, logout } = authSlice.actions;
export default authSlice.reducer;
