import { useState, useEffect } from "react";
import { usersApi, applicationsApi, userApplicationApi, ApiError } from "@/apiService/api";
import type { User, Application } from "@/types/index";

export default function AssignAccessPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAppsMap, setUserAppsMap] = useState<{ [userId: string]: string[] }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, appsData] = await Promise.all([
        usersApi.getAll(),
        applicationsApi.getAll(),
      ]);

      setUsers(usersData.filter((u) => u.isActive));
      setApplications(appsData);

      // Load assignments for each user
      const appsMap: { [userId: string]: string[] } = {};
      for (const user of usersData.filter((u) => u.isActive)) {
        const userApps = await userApplicationApi.getForUser(user.id);
        appsMap[user.id] = userApps.map((a: { id: string }) => a.id);
      }
      setUserAppsMap(appsMap);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        setError(err.message);
      } else {
        setError("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAssignment = async (userId: string, appId: string) => {
    try {
      const currentApps = userAppsMap[userId] || [];
      const isAssigned = currentApps.includes(appId);

      if (isAssigned) {
        await userApplicationApi.remove(userId, appId);
      } else {
        await userApplicationApi.assign(userId, appId);
      }

      // Update local state
      setUserAppsMap((prev) => ({
        ...prev,
        [userId]: isAssigned
          ? prev[userId].filter((id) => id !== appId)
          : [...(prev[userId] || []), appId],
      }));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <div className="p-6">Loading access matrix...</div>;
  }

  const getAppAbbr = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">User Access Management</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left font-semibold">User</th>
              {applications.map((app) => (
                <th
                  key={app.id}
                  className="border px-4 py-2 text-center font-semibold"
                >
                  <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    {getAppAbbr(app.name)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                    active
                  </span>
                </td>
                {applications.map((app) => {
                  const isAssigned = (userAppsMap[user.id] || []).includes(app.id);
                  return (
                    <td key={app.id} className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleToggleAssignment(user.id, app.id)}
                        className={`w-6 h-6 rounded flex items-center justify-center ${
                          isAssigned
                            ? "bg-green-200 text-green-700"
                            : "bg-gray-200 text-gray-400"
                        } hover:opacity-75 transition`}
                      >
                        {isAssigned ? "✓" : "✕"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !error && (
        <p className="text-center text-gray-500 py-8">
          No active users found
        </p>
      )}
    </div>
  );
}
