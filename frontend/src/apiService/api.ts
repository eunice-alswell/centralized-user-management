import type { User, Application, LoginResponse } from "@/types/index";

// Error class for API errors
export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(
    status: number,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5249/api";

// Helper to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(response.status, errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return { message: "Success" } as T;
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError(response.status, "Invalid response format from server");
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse<LoginResponse>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Network error occurred. Please try again.", error);
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

// Users API
export const usersApi = {
  getAll: async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new ApiError(401, "No authentication token found");

      const response = await fetch(`${API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return handleResponse<User[]>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to fetch users", error);
    }
  },

  getById: async (userId: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new ApiError(401, "No authentication token found");

      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return handleResponse<User>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to fetch user", error);
    }
  },

  create: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(userData),
      });
      return handleResponse<{ message: string; data: User }>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to create user", error);
    }
  },

  update: async (
    userId: string,
    userData: {
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    }
  ) => {
    try {
      const token = getAuthToken();
      if (!token) throw new ApiError(401, "No authentication token found");

      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      return handleResponse<{ message: string }>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to update user", error);
    }
  },

  deactivate: async (userId: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new ApiError(401, "No authentication token found");

      const response = await fetch(`${API_BASE_URL}/user/${userId}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      return handleResponse<{ message: string }>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to deactivate user", error);
    }
  },

  delete: async (userId: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new ApiError(401, "No authentication token found");

      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 204 || !response.ok) {
        return { message: "User deleted" };
      }
      return handleResponse<{ message: string }>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to delete user", error);
    }
  },
};

// Applications API
export const applicationsApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/application`);
      return handleResponse<Application[]>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to fetch applications", error);
    }
  },
};

// User-Application Assignment API
export const userApplicationApi = {
  getForUser: async (userId: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new ApiError(401, "No authentication token found");

      const response = await fetch(`${API_BASE_URL}/userapplication/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await handleResponse<{ message: string; data: Application[] }>(response);
      return result.data || [];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to fetch user applications", error);
    }
  },

  assign: async (userId: string, applicationId: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new ApiError(401, "No authentication token found");

      const response = await fetch(`${API_BASE_URL}/userapplication/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, applicationId }),
      });
      return handleResponse<{ message: string }>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to assign user to application", error);
    }
  },

  remove: async (userId: string, applicationId: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new ApiError(401, "No authentication token found");

      const response = await fetch(
        `${API_BASE_URL}/userapplication/user/${userId}/application/${applicationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 204) return { message: "Assignment removed" };
      return handleResponse<{ message: string }>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to remove user from application", error);
    }
  },
};
