import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userApplicationApi, ApiError } from "@/apiService/api";
import type { Application } from "@/types/index";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const selectedApp = localStorage.getItem("selectedApp");

  useEffect(() => {
    const fetchUserApplications = async () => {
      try {
        setLoading(true);
        if (user.id) {
          const apps = await userApplicationApi.getForUser(user.id);
          setApplications(apps);
          setError(null);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load applications");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserApplications();
  }, [user.id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedRole");
    localStorage.removeItem("selectedApp");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome, {user.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Assigned Applications</h2>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No applications assigned to you yet.</p>
              <p className="text-gray-400 mt-2">Contact an administrator to get access.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className={`p-6 border rounded-lg transition ${
                    selectedApp === app.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                  <p className="text-gray-600 text-sm mt-2">{app.description}</p>
                  
                  {selectedApp === app.id && (
                    <div className="mt-4 inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                      Currently Testing
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Test Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Testing Note:</strong> This dashboard shows applications assigned to your user account.
              The selected application ({selectedApp ? applications.find(a => a.id === selectedApp)?.name : "none"}) is being tested for user access functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
