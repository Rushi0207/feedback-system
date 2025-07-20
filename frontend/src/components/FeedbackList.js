import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

function FeedbackList() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get('/feedback');
      setFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeFeedback = async (feedbackId) => {
    try {
      await axios.post(`/feedback/${feedbackId}/acknowledge`);
      setFeedback(feedback.map(f => 
        f.id === feedbackId 
          ? { ...f, acknowledged: true, acknowledged_at: new Date().toISOString() }
          : f
      ));
    } catch (error) {
      console.error('Error acknowledging feedback:', error);
    }
  };

  const startEditing = (feedbackItem) => {
    setEditingId(feedbackItem.id);
    setEditForm({
      strengths: feedbackItem.strengths,
      areas_to_improve: feedbackItem.areas_to_improve,
      sentiment: feedbackItem.sentiment
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveFeedback = async (feedbackId) => {
    try {
      const response = await axios.put(`/feedback/${feedbackId}`, editForm);
      setFeedback(feedback.map(f => f.id === feedbackId ? response.data : f));
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating feedback:', error);
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
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
                  {editingId === item.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Strengths
                        </label>
                        <textarea
                          value={editForm.strengths}
                          onChange={(e) => setEditForm({...editForm, strengths: e.target.value})}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Areas to Improve
                        </label>
                        <textarea
                          value={editForm.areas_to_improve}
                          onChange={(e) => setEditForm({...editForm, areas_to_improve: e.target.value})}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sentiment
                        </label>
                        <select
                          value={editForm.sentiment}
                          onChange={(e) => setEditForm({...editForm, sentiment: e.target.value})}
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
                        onClick={() => acknowledgeFeedback(item.id)}
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