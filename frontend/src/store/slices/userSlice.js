import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../config/api';

// Async thunks for user management
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.users.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch users');
    }
  }
);

export const fetchTeamMembers = createAsyncThunk(
  'users/fetchTeamMembers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.users.getTeam();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch team members');
    }
  }
);

export const fetchManagers = createAsyncThunk(
  'users/fetchManagers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.users.getManagers();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch managers');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiService.users.create(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await apiService.users.delete(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete user');
    }
  }
);

// Initial state
const initialState = {
  users: [],
  teamMembers: [],
  managers: [],
  loading: false,
  createLoading: false,
  error: null,
  createError: null,
};

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
    clearUsers: (state) => {
      state.users = [];
      state.teamMembers = [];
      state.managers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch team members
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMembers = action.payload;
        state.error = null;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch managers
      .addCase(fetchManagers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagers.fulfilled, (state, action) => {
        state.loading = false;
        state.managers = action.payload;
        state.error = null;
      })
      .addCase(fetchManagers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createLoading = false;
        state.users.push(action.payload);
        if (action.payload.role === 'manager') {
          state.managers.push(action.payload);
        }
        state.createError = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        const userId = action.payload;
        state.users = state.users.filter(u => u.id !== userId);
        state.teamMembers = state.teamMembers.filter(u => u.id !== userId);
        state.managers = state.managers.filter(u => u.id !== userId);
      });
  },
});

export const { clearError, clearUsers } = userSlice.actions;
export default userSlice.reducer;