import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "@/pages/LoginPage";
import UserDashboard from "@/pages/UserDashboard";
import AdminLayout from "@/layouts/AdminLayout";
import UsersPage from "@/admin-layout/UsersPage";
import ApplicationsPage from "@/admin-layout/ApplicationsPage";
import AssignAccessPage from "@/admin-layout/AssignAccessPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(localStorage.getItem("selectedRole"));

  useEffect(() => {
    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
      setUserRole(localStorage.getItem("selectedRole"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    // Poll for token changes (handles login in same tab)
    const interval = setInterval(() => {
      setIsAuthenticated(!!localStorage.getItem("token"));
      setUserRole(localStorage.getItem("selectedRole"));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Redirect authenticated users to appropriate dashboard based on role
  const getDefaultRoute = () => {
    if (!isAuthenticated) return "/login";
    return userRole === "Admin" ? "/admin/users" : "/user/dashboard";
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />}
        />

        {/* User Dashboard Route */}
        <Route
          path="/user/dashboard"
          element={
            isAuthenticated && userRole === "User" ? (
              <UserDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin Routes - Only for Admin role */}
        <Route
          path="/admin/*"
          element={
            isAuthenticated && userRole === "Admin" ? (
              <AdminLayout>
                <Routes>
                  <Route path="users" element={<UsersPage />} />
                  <Route path="applications" element={<ApplicationsPage />} />
                  <Route path="assign" element={<AssignAccessPage />} />
                  <Route path="/" element={<Navigate to="/admin/users" replace />} />
                </Routes>
              </AdminLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
