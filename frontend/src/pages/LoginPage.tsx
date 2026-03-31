
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, ApiError, applicationsApi, userApplicationApi } from "@/apiService/api";
import { validateLoginForm } from "@/lib/validators";
import type { Application } from "@/types/index";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [selectedRole, setSelectedRole] = useState<"Admin" | "User">("Admin");
  const [selectedApp, setSelectedApp] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [globalError, setGlobalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load applications from database on component mount
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoadingApps(true);
        const apps = await applicationsApi.getAll();
        setApplications(apps);
      } catch (err) {
        console.error("Failed to load applications:", err);
        // Applications will be empty, user can still login
      } finally {
        setLoadingApps(false);
      }
    };

    loadApplications();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setErrors({});
    setSuccessMessage("");

    // Validate form
    const validationErrors = validateLoginForm(formData.email, formData.password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login(formData.email, formData.password);

      // Store token and user info for both roles
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("selectedRole", selectedRole);

      // If Admin role, navigate to admin dashboard
      if (selectedRole === "Admin") {
        setSuccessMessage("✓ Successfully signed in as Admin!");
        setTimeout(() => {
          navigate("/admin/users");
        }, 1500);
      } else {
        // For User role, check if an app is selected and verify access
        if (selectedApp) {
          try {
            const userApps = await userApplicationApi.getForUser(response.user.id);
            const hasAccess = userApps.some((app: Application) => app.id === selectedApp);

            if (hasAccess) {
              const selectedAppName = applications.find(a => a.id === selectedApp)?.name || "Application";
              localStorage.setItem("selectedApp", selectedApp);
              setSuccessMessage(`✓ Successfully signed in! You have access to "${selectedAppName}"`);
              setTimeout(() => {
                navigate("/user/dashboard");
              }, 1500);
            } else {
              // No access to selected app - logout and show error
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("selectedRole");
              setGlobalError("You don't have access to the selected application. Contact an administrator to request access.");
              setFormData({ email: "", password: "" });
              setSelectedApp("");
            }
          } catch (accessErr) {
            console.error("Failed to check application access:", accessErr);
            // Clear auth on error
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("selectedRole");
            setGlobalError("Failed to verify application access. Please try again.");
          }
        } else {
          // No app selected, go to dashboard
          setSuccessMessage("✓ Successfully signed in!");
          setTimeout(() => {
            navigate("/user/dashboard");
          }, 1500);
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setGlobalError(error.message);
      } else {
        setGlobalError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          User Management
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Sign in to your account
        </p>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {globalError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Select Role (Testing):</p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="Admin"
                  checked={selectedRole === "Admin"}
                  onChange={(e) => setSelectedRole(e.target.value as "Admin" | "User")}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Admin - Full Access</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="User"
                  checked={selectedRole === "User"}
                  onChange={(e) => setSelectedRole(e.target.value as "Admin" | "User")}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">User - Limited Access</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="admin@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="text"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Target Application (only for User role) */}
          {selectedRole === "User" && (
            <div>
              <label htmlFor="application" className="block text-sm font-medium text-gray-700">
                Target Application <span className="text-gray-500 text-xs">(Optional - you can select in your dashboard)</span>
              </label>
              <select
                id="application"
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                disabled={loadingApps}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">{loadingApps ? "Loading applications..." : "Select an application (optional)"}</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                The system will verify your access to this application upon login.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? "Verifying..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}