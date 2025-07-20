import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  
  // Users
  USERS: {
    CREATE: '/users',
    LIST: '/users',
    TEAM: '/users/team',
    MANAGERS: '/users/managers',
  },
  
  // Feedback
  FEEDBACK: {
    CREATE: '/feedback',
    LIST: '/feedback',
    UPDATE: (id) => `/feedback/${id}`,
    ACKNOWLEDGE: (id) => `/feedback/${id}/acknowledge`,
  },
  
  // Tags
  TAGS: {
    LIST: '/tags',
    CREATE: '/tags',
  },
  
  // Feedback Requests
  FEEDBACK_REQUESTS: {
    CREATE: '/feedback-requests',
    LIST: '/feedback-requests',
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
  },
};

// API Service Functions
export const apiService = {
  // Authentication
  auth: {
    login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
    getMe: () => api.get(API_ENDPOINTS.AUTH.ME),
    verifyEmail: (token) => api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, null, { params: { token } }),
    resendVerification: (email) => api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, null, { params: { email } }),
  },
  
  // Users
  users: {
    create: (userData) => api.post(API_ENDPOINTS.USERS.CREATE, userData),
    getAll: () => api.get(API_ENDPOINTS.USERS.LIST),
    getTeam: () => api.get(API_ENDPOINTS.USERS.TEAM),
    getManagers: () => api.get(API_ENDPOINTS.USERS.MANAGERS),
    delete: (id) => api.delete(`/users/${id}`),
  },
  
  // Feedback
  feedback: {
    create: (feedbackData) => api.post(API_ENDPOINTS.FEEDBACK.CREATE, feedbackData),
    getAll: () => api.get(API_ENDPOINTS.FEEDBACK.LIST),
    update: (id, updateData) => api.put(API_ENDPOINTS.FEEDBACK.UPDATE(id), updateData),
    acknowledge: (id) => api.post(API_ENDPOINTS.FEEDBACK.ACKNOWLEDGE(id)),
    delete: (id) => api.delete(`/feedback/${id}`),
  },
  
  // Tags
  tags: {
    getAll: () => api.get(API_ENDPOINTS.TAGS.LIST),
    create: (tagData) => api.post(API_ENDPOINTS.TAGS.CREATE, tagData),
  },
  
  // Feedback Requests
  feedbackRequests: {
    create: (requestData) => api.post(API_ENDPOINTS.FEEDBACK_REQUESTS.CREATE, requestData),
    getAll: () => api.get(API_ENDPOINTS.FEEDBACK_REQUESTS.LIST),
  },
  
  // Dashboard
  dashboard: {
    getStats: () => api.get(API_ENDPOINTS.DASHBOARD.STATS),
  },
};

export default api;