import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminLoginAPI } from "../../api/apiRoutes";

// --- Thunk: Admin Login ---
export const loginAdminThunk = createAsyncThunk(
  "auth/loginAdmin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await adminLoginAPI(credentials);
      // Backend returns: { message: "...", token: "...", data: { email: "...", role: "admin" } }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Login failed. Please check credentials."
      );
    }
  }
);

// --- Initial State ---
const initialState = {
  // Check localStorage to keep admin logged in on refresh
  admin: JSON.parse(localStorage.getItem("adminData")) || null,
  token: localStorage.getItem("adminToken") || null,
  isAuthenticated: !!localStorage.getItem("adminToken"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // --- Logout Action ---
    logoutAdmin: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear Local Storage
      localStorage.removeItem("adminData");
      localStorage.removeItem("adminToken");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Pending
      .addCase(loginAdminThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Success
      .addCase(loginAdminThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.admin = action.payload.data;

        // Save to Local Storage
        localStorage.setItem("adminToken", action.payload.token);
        localStorage.setItem("adminData", JSON.stringify(action.payload.data));
      })
      // Rejected
      .addCase(loginAdminThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutAdmin, clearError } = authSlice.actions;
export default authSlice.reducer;
