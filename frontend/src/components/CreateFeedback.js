import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus, useUsers, useFeedback } from '../store/hooks';
import { fetchTeamMembers } from '../store/slices/userSlice';
import { fetchTags, createFeedback } from '../store/slices/feedbackSlice';
import { addNotification } from '../store/slices/uiSlice';
import LoadingSpinner from './LoadingSpinner';

function CreateFeedback() {
  const { user } = useAuthStatus();
  const { teamMembers, loading: usersLoading } = useUsers();
  const { tags, createLoading, tagsLoading } = useFeedback();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    employee_id: '',
    strengths: '',
    areas_to_improve: '',
    sentiment: 'positive',
    tag_ids: []
  });

  useEffect(() => {
    if (user?.role !== 'manager') {
      navigate('/');
      return;
    }
    dispatch(fetchTeamMembers());
    dispatch(fetchTags());
  }, [dispatch, user?.role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(createFeedback(form));
    
    if (createFeedback.fulfilled.match(result)) {
      dispatch(addNotification({
        type: 'success',
        message: 'Feedback created successfully!'
      }));
      navigate('/feedback');
    } else {
      dispatch(addNotification({
        type: 'error',
        message: result.payload || 'Error creating feedback. Please try again.'
      }));
    }
  };

  const handleTagToggle = (tagId) => {
    setForm(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }));
  };

  if (usersLoading || tagsLoading) {
    return <LoadingSpinner message="Loading form data..." />;
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Feedback</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-lg rounded-lg p-6">
          <div>
            <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-2">
              Team Member
            </label>
            <select
              id="employee_id"
              required
              value={form.employee_id}
              onChange={(e) => setForm({...form, employee_id: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a team member</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name} ({member.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
              Strengths
              <span className="text-xs text-gray-500 ml-2">(Markdown supported)</span>
            </label>
            <textarea
              id="strengths"
              required
              rows={4}
              value={form.strengths}
              onChange={(e) => setForm({...form, strengths: e.target.value})}
              placeholder="What are this person's key strengths? Be specific with examples..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="areas_to_improve" className="block text-sm font-medium text-gray-700 mb-2">
              Areas to Improve
              <span className="text-xs text-gray-500 ml-2">(Markdown supported)</span>
            </label>
            <textarea
              id="areas_to_improve"
              required
              rows={4}
              value={form.areas_to_improve}
              onChange={(e) => setForm({...form, areas_to_improve: e.target.value})}
              placeholder="What areas could this person focus on for improvement? Provide constructive suggestions..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="sentiment" className="block text-sm font-medium text-gray-700 mb-2">
              Overall Sentiment
            </label>
            <select
              id="sentiment"
              value={form.sentiment}
              onChange={(e) => setForm({...form, sentiment: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                      form.tag_ids.includes(tag.id)
                        ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/feedback')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {createLoading ? 'Creating...' : 'Create Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateFeedback;