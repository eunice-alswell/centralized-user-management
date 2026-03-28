import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { validateCreateUserForm, hasErrors, type ValidationErrors } from "@/lib/validators";
import { usersApi, ApiError, userApplicationApi } from "@/apiService/api";
import type { User, Application } from "@/types/index";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userAppsMap, setUserAppsMap] = useState<{ [userId: string]: Application[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "User" as "Admin" | "User",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await usersApi.getAll();
      setUsers(users);
      
      // Fetch applications for each user
      const appsMap: { [userId: string]: Application[] } = {};
      for (const user of users) {
        try {
          const userApps = await userApplicationApi.getForUser(user.id);
          appsMap[user.id] = userApps;
        } catch (err) {
          console.error(`Failed to fetch apps for user ${user.id}:`, err);
          appsMap[user.id] = [];
        }
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
        setError("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "role") {
      setFormData((prev) => ({
        ...prev,
        role: value as "Admin" | "User",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCreateUser = async () => {
    const errors = validateCreateUserForm(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );

    if (hasErrors(errors)) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await usersApi.create({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "User",
      });
      setFormErrors({});
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      if (err instanceof ApiError) {
        setFormErrors({ submit: err.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (confirm("Are you sure you want to deactivate this user?")) {
      try {
        await usersApi.deactivate(userId);
        await fetchUsers();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        }
      }
    }
  };

  if (loading) {
    return <div className="p-6">Loading users...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Create User"}
        </Button>
      </div>

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

      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Create New User</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={formErrors.password ? "border-red-500" : ""}
              />
              {formErrors.password && (
                <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
              {formErrors.role && (
                <p className="text-sm text-red-600 mt-1">{formErrors.role}</p>
              )}
            </div>

            {formErrors.submit && (
              <p className="text-sm text-red-600">{formErrors.submit}</p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreateUser}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Email</th>
              <th className="text-left py-3 px-4 font-semibold">Role</th>
              <th className="text-left py-3 px-4 font-semibold">Applications</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  <Badge
                    variant={user.role === "Admin" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {userAppsMap[user.id]?.length > 0 ? (
                      userAppsMap[user.id].map((app) => (
                        <Badge key={app.id} variant="outline">
                          {app.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No applications</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  {user.isActive && (
                    <Button
                      onClick={() => handleDeactivateUser(user.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3"
                    >
                      Deactivate
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
