import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuthStatus, useFeedback, useUI } from '../store/hooks';
import { fetchFeedback, updateFeedback, acknowledgeFeedback, optimisticAcknowledge, rollbackAcknowledge } from '../store/slices/feedbackSlice';
import { setEditingFeedback, clearEditingFeedback, updateEditingForm, addNotification } from '../store/slices/uiSlice';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';

function FeedbackList() {
  const { user } = useAuthStatus();
  const { feedback, loading } = useFeedback();
  const { editingFeedbackId, editingUserForm } = useUI();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchFeedback());
  }, [dispatch]);

  const handleAcknowledgeFeedback = async (feedbackId) => {
    // Optimistic update
    dispatch(optimisticAcknowledge(feedbackId));
    
    const result = await dispatch(acknowledgeFeedback(feedbackId));
    
    if (acknowledgeFeedback.rejected.match(result)) {
      // Rollback on error
      dispatch(rollbackAcknowledge(feedbackId));
      dispatch(addNotification({
        type: 'error',
        message: result.payload || 'Failed to acknowledge feedback'
      }));
    } else {
      dispatch(addNotification({
        type: 'success',
        message: 'Feedback acknowledged successfully!'
      }));
    }
  };

  const startEditing = (feedbackItem) => {
    dispatch(setEditingFeedback({
      id: feedbackItem.id,
      data: {
        strengths: feedbackItem.strengths,
        areas_to_improve: feedbackItem.areas_to_improve,
        sentiment: feedbackItem.sentiment
      }
    }));
  };

  const cancelEditing = () => {
    dispatch(clearEditingFeedback());
  };

  const saveFeedback = async (feedbackId) => {
    const result = await dispatch(updateFeedback({
      id: feedbackId,
      updateData: editingUserForm
    }));
    
    if (updateFeedback.fulfilled.match(result)) {
      dispatch(clearEditingFeedback());
      dispatch(addNotification({
        type: 'success',
        message: 'Feedback updated successfully!'
      }));
    } else {
      dispatch(addNotification({
        type: 'error',
        message: result.payload || 'Failed to update feedback'
      }));
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
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

  if (loading) {
    return <LoadingSpinner message="Loading feedback..." />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {user?.role === 'manager' ? 'Feedback Given' : 'My Feedback'}
        </h1>

        {feedback.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No feedback available yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedback.map((item) => (
              <div key={item.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {user?.role === 'manager' 
                          ? `Feedback for ${item.employee.full_name}`
                          : `Feedback from ${item.manager.full_name}`
                        }
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created: {formatDate(item.created_at)}
                        {item.updated_at !== item.created_at && (
                          <span> • Updated: {formatDate(item.updated_at)}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                        {item.sentiment}
                      </span>
                      {user?.role === 'manager' && (
                        <button
                          onClick={() => startEditing(item)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  {editingFeedbackId === item.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Strengths
                        </label>
                        <textarea
                          value={editingUserForm.strengths || ''}
                          onChange={(e) => dispatch(updateEditingForm({strengths: e.target.value}))}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Areas to Improve
                        </label>
                        <textarea
                          value={editingUserForm.areas_to_improve || ''}
                          onChange={(e) => dispatch(updateEditingForm({areas_to_improve: e.target.value}))}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sentiment
                        </label>
                        <select
                          value={editingUserForm.sentiment || 'positive'}
                          onChange={(e) => dispatch(updateEditingForm({sentiment: e.target.value}))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="positive">Positive</option>
                          <option value="neutral">Neutral</option>
                          <option value="negative">Negative</option>
                        </select>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveFeedback(item.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Strengths</h4>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{item.strengths}</ReactMarkdown>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Areas to Improve</h4>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{item.areas_to_improve}</ReactMarkdown>
                        </div>
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{ backgroundColor: tag.color + '20', color: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {user?.role === 'employee' && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    {item.acknowledged ? (
                      <p className="text-sm text-green-600">
                        ✓ Acknowledged on {formatDate(item.acknowledged_at)}
                      </p>
                    ) : (
                      <button
                        onClick={() => handleAcknowledgeFeedback(item.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Acknowledge Feedback
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedbackList;