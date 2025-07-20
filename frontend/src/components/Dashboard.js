import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'manager') {
        const response = await axios.get('/dashboard/stats');
        setStats(response.data);
        setRecentFeedback(response.data.recent_feedback);
      } else {
        const response = await axios.get('/feedback');
        setRecentFeedback(response.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]); // eslint-disable-line react-hooks/exhaustive-deps

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
      day: 'numeric'
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
          {user?.role === 'manager' ? 'Manager Dashboard' : 'My Feedback Timeline'}
        </h1>

        {user?.role === 'manager' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">T</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Feedback
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total_feedback}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">+</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Positive
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.positive_feedback}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">-</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Needs Improvement
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.negative_feedback}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Team Members
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.team_members_count}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {user?.role === 'manager' ? 'Recent Feedback Given' : 'Recent Feedback Received'}
            </h3>
            <Link
              to="/feedback"
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentFeedback.length === 0 ? (
              <li className="px-4 py-4 text-gray-500 text-center">
                No feedback available yet.
              </li>
            ) : (
              recentFeedback.map((feedback) => (
                <li key={feedback.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.role === 'manager' 
                            ? `Feedback for ${feedback.employee.full_name}`
                            : `Feedback from ${feedback.manager.full_name}`
                          }
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(feedback.sentiment)}`}>
                            {feedback.sentiment}
                          </span>
                          <p className="text-sm text-gray-500">
                            {formatDate(feedback.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        <strong>Strengths:</strong> {feedback.strengths.substring(0, 100)}...
                      </p>
                      {user?.role === 'employee' && !feedback.acknowledged && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                          New - Not acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {user?.role === 'manager' && (
          <div className="mt-8 flex justify-center">
            <Link
              to="/feedback/create"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Create New Feedback
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;