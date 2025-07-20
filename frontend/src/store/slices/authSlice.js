import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../config/api';

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiService.auth.login({ email, password });
      const { access_token, user } = response.data;
      
      // Check if user is verified
      if (!user.is_verified) {
        return rejectWithValue({
          message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
          needsVerification: true,
          email: email
        });
      }
      
      // Store token in localStorage
      localStorage.setItem('token', access_token);
      
      return { user, token: access_token };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.detail || 'Login failed',
        needsVerification: false
      });
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.auth.getMe();
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user');
    }
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiService.auth.resendVerification(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to send verification email');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await apiService.auth.verifyEmail(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Email verification failed');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
  needsVerification: false,
  verificationEmail: null,
  verificationLoading: false,
  verificationError: null,
  emailVerificationLoading: false,
  emailVerificationError: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.needsVerification = false;
      state.verificationEmail = null;
    },
    clearError: (state) => {
      state.error = null;
      state.verificationError = null;
      state.emailVerificationError = null;
    },
    clearVerificationState: (state) => {
      state.needsVerification = false;
      state.verificationEmail = null;
      state.verificationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.needsVerification = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.needsVerification = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.needsVerification = action.payload.needsVerification;
        state.verificationEmail = action.payload.email;
      })
      
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // Resend verification
      .addCase(resendVerification.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.verificationLoading = false;
        state.verificationError = null;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload;
      })
      
      // Email verification
      .addCase(verifyEmail.pending, (state) => {
        state.emailVerificationLoading = true;
        state.emailVerificationError = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.emailVerificationLoading = false;
        state.emailVerificationError = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.emailVerificationLoading = false;
        state.emailVerificationError = action.payload;
      });
  },
});

export const { logout, clearError, clearVerificationState } = authSlice.actions;
export default authSlice.reducer;