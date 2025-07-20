import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../config/api';

// Async thunks for feedback management
export const fetchFeedback = createAsyncThunk(
  'feedback/fetchFeedback',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.feedback.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch feedback');
    }
  }
);

export const createFeedback = createAsyncThunk(
  'feedback/createFeedback',
  async (feedbackData, { rejectWithValue }) => {
    try {
      const response = await apiService.feedback.create(feedbackData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create feedback');
    }
  }
);

export const updateFeedback = createAsyncThunk(
  'feedback/updateFeedback',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await apiService.feedback.update(id, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update feedback');
    }
  }
);

export const acknowledgeFeedback = createAsyncThunk(
  'feedback/acknowledgeFeedback',
  async (feedbackId, { rejectWithValue }) => {
    try {
      await apiService.feedback.acknowledge(feedbackId);
      return feedbackId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to acknowledge feedback');
    }
  }
);

export const fetchTags = createAsyncThunk(
  'feedback/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.tags.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch tags');
    }
  }
);

export const createTag = createAsyncThunk(
  'feedback/createTag',
  async (tagData, { rejectWithValue }) => {
    try {
      const response = await apiService.tags.create(tagData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create tag');
    }
  }
);

export const fetchFeedbackRequests = createAsyncThunk(
  'feedback/fetchFeedbackRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.feedbackRequests.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch feedback requests');
    }
  }
);

export const createFeedbackRequest = createAsyncThunk(
  'feedback/createFeedbackRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await apiService.feedbackRequests.create(requestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create feedback request');
    }
  }
);

// Initial state
const initialState = {
  feedback: [],
  tags: [],
  feedbackRequests: [],
  loading: false,
  createLoading: false,
  updateLoading: false,
  acknowledgeLoading: false,
  tagsLoading: false,
  requestsLoading: false,
  error: null,
  createError: null,
  updateError: null,
  acknowledgeError: null,
  tagsError: null,
  requestsError: null,
};

// Feedback slice
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.acknowledgeError = null;
      state.tagsError = null;
      state.requestsError = null;
    },
    clearFeedback: (state) => {
      state.feedback = [];
      state.feedbackRequests = [];
    },
    // Optimistic update for acknowledgment
    optimisticAcknowledge: (state, action) => {
      const feedbackId = action.payload;
      const feedback = state.feedback.find(f => f.id === feedbackId);
      if (feedback) {
        feedback.acknowledged = true;
        feedback.acknowledged_at = new Date().toISOString();
      }
    },
    // Rollback optimistic update
    rollbackAcknowledge: (state, action) => {
      const feedbackId = action.payload;
      const feedback = state.feedback.find(f => f.id === feedbackId);
      if (feedback) {
        feedback.acknowledged = false;
        feedback.acknowledged_at = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch feedback
      .addCase(fetchFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedback = action.payload;
        state.error = null;
      })
      .addCase(fetchFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create feedback
      .addCase(createFeedback.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.createLoading = false;
        state.feedback.push(action.payload);
        state.createError = null;
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
      // Update feedback
      .addCase(updateFeedback.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.feedback.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.feedback[index] = action.payload;
        }
        state.updateError = null;
      })
      .addCase(updateFeedback.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Acknowledge feedback
      .addCase(acknowledgeFeedback.pending, (state) => {
        state.acknowledgeLoading = true;
        state.acknowledgeError = null;
      })
      .addCase(acknowledgeFeedback.fulfilled, (state, action) => {
        state.acknowledgeLoading = false;
        // Update already done optimistically
        state.acknowledgeError = null;
      })
      .addCase(acknowledgeFeedback.rejected, (state, action) => {
        state.acknowledgeLoading = false;
        state.acknowledgeError = action.payload;
      })
      
      // Fetch tags
      .addCase(fetchTags.pending, (state) => {
        state.tagsLoading = true;
        state.tagsError = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tagsLoading = false;
        state.tags = action.payload;
        state.tagsError = null;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.tagsLoading = false;
        state.tagsError = action.payload;
      })
      
      // Create tag
      .addCase(createTag.fulfilled, (state, action) => {
        state.tags.push(action.payload);
      })
      
      // Fetch feedback requests
      .addCase(fetchFeedbackRequests.pending, (state) => {
        state.requestsLoading = true;
        state.requestsError = null;
      })
      .addCase(fetchFeedbackRequests.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.feedbackRequests = action.payload;
        state.requestsError = null;
      })
      .addCase(fetchFeedbackRequests.rejected, (state, action) => {
        state.requestsLoading = false;
        state.requestsError = action.payload;
      })
      
      // Create feedback request
      .addCase(createFeedbackRequest.fulfilled, (state, action) => {
        state.feedbackRequests.unshift(action.payload);
      });
  },
});

export const { 
  clearError, 
  clearFeedback, 
  optimisticAcknowledge, 
  rollbackAcknowledge 
} = feedbackSlice.actions;

export default feedbackSlice.reducer;