import { useState, useEffect } from "react";
import { applicationsApi, ApiError } from "@/apiService/api";
import type { Application } from "@/types/index";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const apps = await applicationsApi.getAll();
      setApplications(apps);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        setError(err.message);
      } else {
        setError("Failed to load applications");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading applications...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Applications</h2>

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
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{app.name}</td>
                <td className="py-3 px-4">{app.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {applications.length === 0 && !error && (
        <p className="text-center text-gray-500 py-8">No applications found</p>
      )}
    </div>
  );
}
