import React, { useState } from "react";
import { useAuthStatus } from "../store/hooks";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser, resendVerification, clearError } from "../store/slices/authSlice";
import { addNotification } from "../store/slices/uiSlice";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  
  const { 
    isAuthenticated, 
    loading, 
    error, 
    needsVerification, 
    verificationEmail,
    verificationLoading 
  } = useAuthStatus();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    const result = await dispatch(loginUser({ email, password }));
    
    if (loginUser.fulfilled.match(result)) {
      dispatch(addNotification({
        type: 'success',
        message: 'Login successful! Welcome back.',
      }));
    }
  };

  const handleResendVerification = async () => {
    const result = await dispatch(resendVerification(verificationEmail || email));
    
    if (resendVerification.fulfilled.match(result)) {
      dispatch(addNotification({
        type: 'success',
        message: 'Verification email sent successfully! Please check your inbox.',
      }));
    } else {
      dispatch(addNotification({
        type: 'error',
        message: result.payload || 'Failed to send verification email',
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Feedback System
          </h2>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Demo accounts:</p>
            <p>
              <strong>Manager:</strong> manager@company.com / password123
            </p>
            <p>
              <strong>Employee:</strong> employee1@company.com / password123
            </p>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          {needsVerification && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Email Verification Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Please check your email and click the verification link to
                      activate your account.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={verificationLoading}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      {verificationLoading
                        ? "Sending..."
                        : "Resend Verification Email"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
