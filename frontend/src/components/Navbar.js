import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuthStatus } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/uiSlice';

function Navbar() {
  const { user } = useAuthStatus();
  const dispatch = useDispatch();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Feedback System
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </Link>
            
            <Link
              to="/feedback"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/feedback') 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Feedback
            </Link>
            
            {user?.role === 'manager' && (
              <Link
                to="/feedback/create"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/feedback/create') 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Create Feedback
              </Link>
            )}
            
            <Link
              to="/feedback-requests"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/feedback-requests') 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {user?.role === 'manager' ? 'Feedback Requests' : 'My Requests'}
            </Link>
            
            {user?.role === 'manager' && (
              <Link
                to="/users"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/users') 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Manage Users
              </Link>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {user?.full_name} ({user?.role})
              </span>
              <button
                onClick={() => {
                  dispatch(logout());
                  dispatch(addNotification({
                    type: 'success',
                    message: 'Logged out successfully!',
                  }));
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;