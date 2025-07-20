import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../config/api';

// Async thunks for dashboard
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.dashboard.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch dashboard stats');
    }
  }
);

// Initial state
const initialState = {
  stats: {
    total_feedback: 0,
    positive_feedback: 0,
    neutral_feedback: 0,
    negative_feedback: 0,
    team_members_count: 0,
    recent_feedback: [],
  },
  loading: false,
  error: null,
};

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearStats: (state) => {
      state.stats = initialState.stats;
    },
    // Update stats when feedback is created/updated
    updateStatsOnFeedbackCreate: (state, action) => {
      const feedback = action.payload;
      state.stats.total_feedback += 1;
      
      switch (feedback.sentiment) {
        case 'positive':
          state.stats.positive_feedback += 1;
          break;
        case 'neutral':
          state.stats.neutral_feedback += 1;
          break;
        case 'negative':
          state.stats.negative_feedback += 1;
          break;
      }
      
      // Add to recent feedback (keep only 5 most recent)
      state.stats.recent_feedback.unshift(feedback);
      if (state.stats.recent_feedback.length > 5) {
        state.stats.recent_feedback.pop();
      }
    },
    updateStatsOnFeedbackUpdate: (state, action) => {
      const updatedFeedback = action.payload;
      
      // Update recent feedback if it exists there
      const recentIndex = state.stats.recent_feedback.findIndex(
        f => f.id === updatedFeedback.id
      );
      if (recentIndex !== -1) {
        state.stats.recent_feedback[recentIndex] = updatedFeedback;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearStats, 
  updateStatsOnFeedbackCreate, 
  updateStatsOnFeedbackUpdate 
} = dashboardSlice.actions;

export default dashboardSlice.reducer;