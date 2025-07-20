import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuthStatus, useUsers } from "../store/hooks";
import {
  fetchUsers,
  fetchManagers,
  createUser,
  deleteUser,
} from "../store/slices/userSlice";
import { addNotification } from "../store/slices/uiSlice";

function UserManagement() {
  const { user } = useAuthStatus();
  const { users, managers, loading, createLoading, createError } = useUsers();
  const dispatch = useDispatch();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "employee",
    manager_id: "",
  });

  useEffect(() => {
    if (user?.role !== "manager") {
      return;
    }
    dispatch(fetchUsers());
    dispatch(fetchManagers());
  }, [dispatch, user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      ...newUser,
      manager_id: newUser.manager_id ? parseInt(newUser.manager_id) : null,
    };

    const result = await dispatch(createUser(userData));

    if (createUser.fulfilled.match(result)) {
      setNewUser({
        email: "",
        password: "",
        full_name: "",
        role: "employee",
        manager_id: "",
      });
      setShowCreateForm(false);
      dispatch(
        addNotification({
          type: "success",
          message:
            "User created successfully! A verification email and welcome email with login credentials have been sent to their email address.",
        })
      );
    } else {
      dispatch(
        addNotification({
          type: "error",
          message: result.payload || "Error creating user. Please try again.",
        })
      );
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${userName}? This will also delete all their feedback and cannot be undone.`
      )
    ) {
      const result = await dispatch(deleteUser(userId));

      if (deleteUser.fulfilled.match(result)) {
        dispatch(
          addNotification({
            type: "success",
            message: `User ${userName} deleted successfully!`,
          })
        );
      } else {
        dispatch(
          addNotification({
            type: "error",
            message: result.payload || "Failed to delete user",
          })
        );
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (user?.role !== "manager") {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">
              Access denied. Only managers can manage users.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Add New User
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Create New User
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    required
                    value={newUser.full_name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, full_name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>

              {newUser.role === "employee" && (
                <div>
                  <label
                    htmlFor="manager_id"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Manager (Optional - defaults to you)
                  </label>
                  <select
                    id="manager_id"
                    value={newUser.manager_id}
                    onChange={(e) =>
                      setNewUser({ ...newUser, manager_id: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">
                      Select a manager (or leave blank for yourself)
                    </option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.full_name} ({manager.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  disabled={createLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                >
                  {createLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              All Users ({users.length})
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage employees and managers in your organization.
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <li className="px-4 py-4 text-gray-500 text-center">
                No users found.
              </li>
            ) : (
              users.map((userItem) => (
                <li key={userItem.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {userItem.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {userItem.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userItem.role === "manager"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {userItem.role}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userItem.is_verified
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {userItem.is_verified
                              ? "✓ Verified"
                              : "⚠ Unverified"}
                          </span>
                          {userItem.manager_id && (
                            <span className="text-xs text-gray-500">
                              Manager:{" "}
                              {users.find((u) => u.id === userItem.manager_id)
                                ?.full_name || "Unknown"}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            Joined: {formatDate(userItem.created_at)}
                          </span>
                          {userItem.id !== user.id && (
                            <button
                              onClick={() =>
                                handleDeleteUser(
                                  userItem.id,
                                  userItem.full_name
                                )
                              }
                              className="text-red-600 hover:text-red-900 text-sm font-medium ml-4"
                              title="Delete User"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                User Management Tips
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    New employees will automatically be assigned to you as their
                    manager if no manager is specified
                  </li>
                  <li>New managers can manage their own teams independently</li>
                  <li>
                    All users will receive both a verification email and welcome
                    email with login credentials
                  </li>
                  <li>
                    Users must verify their email address before they can log in
                    to the system
                  </li>
                  <li>
                    Users can change their passwords after first login and email
                    verification
                  </li>
                  <li>
                    Unverified users will see a warning on the login page with
                    option to resend verification
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
