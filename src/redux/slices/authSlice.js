import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// --- IMPORT YOUR NEW API ROUTES ---
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../../api/apiRoutes";

// ----------------------------------------------------------------------
// ASYNC THUNKS (The API Client)
// ----------------------------------------------------------------------

/**
 * 1. REGISTER
 * - Calls the `register` function from `apiRoutes.js`.
 * - Combines `firstName` and `lastName` into `name` for your backend.
 * - UPDATED: Accepts ...otherFields to ensure gender, dob, etc. are passed.
 */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    { firstName, lastName, email, password, ...otherFields },
    { rejectWithValue }
  ) => {
    try {
      // Combine first/last name to match your controller's 'name' field
      const name = `${firstName} ${lastName}`;

      // Call the clean API route with ALL data
      const response = await register({
        name,
        email,
        password,
        role: "user",
        ...otherFields, // This passes gender, dob, address, etc.
      });

      // Return the user data from response.data.data
      return response.data; // This is { success: true, data: user }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      return rejectWithValue(message);
    }
  }
);

/**
 * 2. LOGIN
 * - Calls the `login` function from `apiRoutes.js`.
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Call the clean API route
      const response = await login({ email, password });

      // Return payload: { user: {...}, token: "..." }
      // This comes from response.data, which is { success, data, token }
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid email or password";
      return rejectWithValue(message);
    }
  }
);

/**
 * 3. FORGOT PASSWORD
 * - Calls the `forgotPassword` function from `apiRoutes.js`.
 */
export const sendPasswordReset = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await forgotPassword({ email });
      return response.data.message; // Returns the success message
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send reset email.";
      return rejectWithValue(message);
    }
  }
);

/**
 * 4. RESET PASSWORD
 * - Calls the `resetPassword` function from `apiRoutes.js`.
 */
export const resetUserPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await resetPassword({ token, newPassword });
      return response.data.message; // Returns the success message
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to reset password. Token may be invalid or expired.";
      return rejectWithValue(message);
    }
  }
);

// ----------------------------------------------------------------------
// INITIAL STATE (Reads from localStorage)
// ----------------------------------------------------------------------

const getInitialState = () => {
  try {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      const { user, token } = JSON.parse(storedAuth);
      return {
        user,
        token,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    // Corrupted or invalid data, clear it
    localStorage.removeItem("auth");
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initialState = {
  ...getInitialState(),
  isLoading: false,
  error: null,
  message: null, // For success messages from password reset
  registrationSuccess: false, // To show success message on register modal
};

// ----------------------------------------------------------------------
// THE SLICE
// ----------------------------------------------------------------------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // This action is called by the login thunk on success
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      // Save to localStorage
      localStorage.setItem("auth", JSON.stringify({ user, token }));
    },
    // This is the one you call from your "Logout" button
    logout: (state) => {
      localStorage.removeItem("auth");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    // Resets the success flag when opening the register modal
    resetRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- REGISTER CASES ---
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationSuccess = true; // Set success flag
        // We do NOT log the user in, as per your controller
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // --- LOGIN CASES ---
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // The payload is { success, data, token }
        // We call our own 'setCredentials' reducer to do the work
        authSlice.caseReducers.setCredentials(state, {
          payload: { user: action.payload.data, token: action.payload.token },
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
      })

      // --- FORGOT PASSWORD CASES ---
      .addCase(sendPasswordReset.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(sendPasswordReset.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload; // Show success message
      })
      .addCase(sendPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // --- RESET PASSWORD CASES ---
      .addCase(resetUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload; // Show success message
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  logout,
  clearError,
  clearMessage,
  resetRegistrationSuccess,
  setCredentials,
} = authSlice.actions;
export default authSlice.reducer;
