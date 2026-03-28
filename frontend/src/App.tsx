import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "@/pages/LoginPage";
import AdminLayout from "@/layouts/AdminLayout";
import UsersPage from "@/admin-layout/UsersPage";
import ApplicationsPage from "@/admin-layout/ApplicationsPage";
import AssignAccessPage from "@/admin-layout/AssignAccessPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    // Poll for token changes (handles login in same tab)
    const interval = setInterval(() => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/admin/users" replace /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/admin/users" replace /> : <LoginPage />}
        />

        {/* Admin Routes - Accessible to both Admin and User roles (for testing) */}
        <Route
          path="/admin/*"
          element={
            isAuthenticated ? (
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
