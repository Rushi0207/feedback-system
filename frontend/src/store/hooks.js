import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';

// Typed hooks for better TypeScript support (optional)
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hooks for specific state slices
export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  return useMemo(() => ({
    ...auth,
    dispatch,
  }), [auth, dispatch]);
};

export const useUsers = () => {
  const users = useAppSelector((state) => state.users);
  const dispatch = useAppDispatch();
  
  return useMemo(() => ({
    ...users,
    dispatch,
  }), [users, dispatch]);
};

export const useFeedback = () => {
  const feedback = useAppSelector((state) => state.feedback);
  const dispatch = useAppDispatch();
  
  return useMemo(() => ({
    ...feedback,
    dispatch,
  }), [feedback, dispatch]);
};

export const useDashboard = () => {
  const dashboard = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();
  
  return useMemo(() => ({
    ...dashboard,
    dispatch,
  }), [dashboard, dispatch]);
};

export const useUI = () => {
  const ui = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  
  return useMemo(() => ({
    ...ui,
    dispatch,
  }), [ui, dispatch]);
};

// Selector hooks for computed values
export const useAuthStatus = () => {
  return useAppSelector((state) => ({
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    loading: state.auth.loading,
  }));
};

export const useFeedbackStats = () => {
  return useAppSelector((state) => {
    const feedback = state.feedback.feedback;
    return {
      total: feedback.length,
      acknowledged: feedback.filter(f => f.acknowledged).length,
      unacknowledged: feedback.filter(f => !f.acknowledged).length,
      byRole: state.auth.user?.role === 'manager' 
        ? feedback.reduce((acc, f) => {
            acc[f.sentiment] = (acc[f.sentiment] || 0) + 1;
            return acc;
          }, {})
        : null,
    };
  });
};

export const useFilteredFeedback = () => {
  return useAppSelector((state) => {
    const { feedback } = state.feedback;
    const { feedbackFilter, searchQuery } = state.ui;
    
    let filtered = feedback;
    
    // Apply sentiment filter
    if (feedbackFilter.sentiment !== 'all') {
      filtered = filtered.filter(f => f.sentiment === feedbackFilter.sentiment);
    }
    
    // Apply acknowledged filter
    if (feedbackFilter.acknowledged !== 'all') {
      const isAcknowledged = feedbackFilter.acknowledged === 'acknowledged';
      filtered = filtered.filter(f => f.acknowledged === isAcknowledged);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.strengths.toLowerCase().includes(query) ||
        f.areas_to_improve.toLowerCase().includes(query) ||
        f.employee?.full_name.toLowerCase().includes(query) ||
        f.manager?.full_name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  });
};

export const usePaginatedData = (data) => {
  return useAppSelector((state) => {
    const { currentPage, itemsPerPage } = state.ui;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      currentData: data.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / itemsPerPage),
      currentPage,
      itemsPerPage,
      totalItems: data.length,
    };
  });
};