import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // Modal states
  showCreateUserModal: false,
  showCreateFeedbackModal: false,
  showCreateTagModal: false,
  showFeedbackRequestModal: false,
  
  // Form states
  editingFeedbackId: null,
  editingUserForm: {},
  
  // Loading states
  globalLoading: false,
  
  // Notification states
  notifications: [],
  
  // Filter states
  feedbackFilter: {
    sentiment: 'all',
    acknowledged: 'all',
    dateRange: 'all',
  },
  
  // Pagination states
  currentPage: 1,
  itemsPerPage: 10,
  
  // Search states
  searchQuery: '',
  searchResults: [],
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openCreateUserModal: (state) => {
      state.showCreateUserModal = true;
    },
    closeCreateUserModal: (state) => {
      state.showCreateUserModal = false;
    },
    openCreateFeedbackModal: (state) => {
      state.showCreateFeedbackModal = true;
    },
    closeCreateFeedbackModal: (state) => {
      state.showCreateFeedbackModal = false;
    },
    openCreateTagModal: (state) => {
      state.showCreateTagModal = true;
    },
    closeCreateTagModal: (state) => {
      state.showCreateTagModal = false;
    },
    openFeedbackRequestModal: (state) => {
      state.showFeedbackRequestModal = true;
    },
    closeFeedbackRequestModal: (state) => {
      state.showFeedbackRequestModal = false;
    },
    
    // Form editing actions
    setEditingFeedback: (state, action) => {
      state.editingFeedbackId = action.payload.id;
      state.editingUserForm = action.payload.data;
    },
    clearEditingFeedback: (state) => {
      state.editingFeedbackId = null;
      state.editingUserForm = {};
    },
    updateEditingForm: (state, action) => {
      state.editingUserForm = { ...state.editingUserForm, ...action.payload };
    },
    
    // Loading actions
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: action.payload.type || 'info', // success, error, warning, info
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        timestamp: new Date().toISOString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    // Filter actions
    setFeedbackFilter: (state, action) => {
      state.feedbackFilter = { ...state.feedbackFilter, ...action.payload };
    },
    resetFeedbackFilter: (state) => {
      state.feedbackFilter = initialState.feedbackFilter;
    },
    
    // Pagination actions
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page
    },
    
    // Search actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
    },
    
    // Reset all UI state
    resetUIState: (state) => {
      return initialState;
    },
  },
});

export const {
  // Modal actions
  openCreateUserModal,
  closeCreateUserModal,
  openCreateFeedbackModal,
  closeCreateFeedbackModal,
  openCreateTagModal,
  closeCreateTagModal,
  openFeedbackRequestModal,
  closeFeedbackRequestModal,
  
  // Form editing actions
  setEditingFeedback,
  clearEditingFeedback,
  updateEditingForm,
  
  // Loading actions
  setGlobalLoading,
  
  // Notification actions
  addNotification,
  removeNotification,
  clearAllNotifications,
  
  // Filter actions
  setFeedbackFilter,
  resetFeedbackFilter,
  
  // Pagination actions
  setCurrentPage,
  setItemsPerPage,
  
  // Search actions
  setSearchQuery,
  setSearchResults,
  clearSearch,
  
  // Reset actions
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;