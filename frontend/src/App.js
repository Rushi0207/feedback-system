import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { useAuthStatus } from "./store/hooks";
import { fetchCurrentUser } from "./store/slices/authSlice";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import FeedbackList from "./components/FeedbackList";
import CreateFeedback from "./components/CreateFeedback";
import FeedbackRequests from "./components/FeedbackRequests";
import UserManagement from "./components/UserManagement";
import EmailVerification from "./components/EmailVerification";
import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";
import NotificationContainer from "./components/NotificationContainer";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStatus();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { isAuthenticated, user, loading } = useAuthStatus();

  useEffect(() => {
    // Check for existing token and fetch user data
    const token = localStorage.getItem('token');
    if (token && !user) {
      store.dispatch(fetchCurrentUser());
    }
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      <NotificationContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <FeedbackList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback/create"
          element={
            <ProtectedRoute>
              <CreateFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback-requests"
          element={
            <ProtectedRoute>
              <FeedbackRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route path="/verify-email" element={<EmailVerification />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppContent />
          </div>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
