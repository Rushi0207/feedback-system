import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuthStatus, useFeedback } from '../store/hooks';
import { fetchFeedbackRequests, createFeedbackRequest } from '../store/slices/feedbackSlice';
import { addNotification } from '../store/slices/uiSlice';
import LoadingSpinner from './LoadingSpinner';

function FeedbackRequests() {
  const { user } = useAuthStatus();
  const { feedbackRequests, requestsLoading } = useFeedback();
  const dispatch = useDispatch();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ message: '' });

  useEffect(() => {
    dispatch(fetchFeedbackRequests());
  }, [dispatch]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    const result = await dispatch(createFeedbackRequest(newRequest));
    
    if (createFeedbackRequest.fulfilled.match(result)) {
      setNewRequest({ message: '' });
      setShowCreateForm(false);
      dispatch(addNotification({
        type: 'success',
        message: 'Feedback request sent successfully!'
      }));
    } else {
      dispatch(addNotification({
        type: 'error',
        message: result.payload || 'Error creating request. Please try again.'
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'declined': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (requestsLoading) {
    return <LoadingSpinner message="Loading feedback requests..." />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'manager' ? 'Team Feedback Requests' : 'My Feedback Requests'}
          </h1>
          {user?.role === 'employee' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Request Feedback
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Request Feedback</h2>
            <form onSubmit={handleCreateRequest}>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message to your manager
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={newRequest.message}
                  onChange={(e) => setNewRequest({...newRequest, message: e.target.value})}
                  placeholder="What specific areas would you like feedback on? Any particular projects or situations you'd like to discuss?"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        )}

        {feedbackRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {user?.role === 'manager' 
                ? 'No feedback requests from your team yet.'
                : 'You haven\'t requested any feedback yet.'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {feedbackRequests.map((request) => (
                <li key={request.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.role === 'manager' 
                            ? `Request from ${request.employee.full_name}`
                            : 'Feedback Request'
                          }
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          <p className="text-sm text-gray-500">
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {request.message}
                      </p>
                      {user?.role === 'manager' && request.status === 'pending' && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-500 mb-2">
                            You can create feedback for this employee to address their request.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedbackRequests;