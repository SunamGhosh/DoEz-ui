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
  async (phone, { rejectWithValue }) => {
    try {
      const response = await API.post("/users/register/send-otp", { phone });
      // toast.success("OTP Sent Successfully")
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
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const response = await API.post("/users/register/verify-otp", {
        phone,
        otp,
      });
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
      toast.success("Registered Successfully")
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
  async ({ phone, password }, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post("/auth/login", { phone, password });
      // Fetch fresh user data after successful login
      await dispatch(checkAuth());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
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
    registrationPhone: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOTPFlow: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.registrationPhone = null;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.otpVerified = false;
      state.registrationPhone = null;
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
        state.registrationPhone = action.meta.arg; // Store the phone number
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
        state.registrationPhone = null;
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
  },
});

export const { clearError, resetOTPFlow, logout } = authSlice.actions;
export default authSlice.reducer;
