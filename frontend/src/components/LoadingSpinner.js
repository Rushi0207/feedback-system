import React from 'react';

function LoadingSpinner({ size = 'large', message = 'Loading...' }) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-32 w-32',
  };

  return (
    <div className="flex flex-col justify-center items-center h-64">
      <div className={`animate-spin rounded-full border-b-2 border-indigo-500 ${sizeClasses[size]}`}></div>
      {message && (
        <p className="mt-4 text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;