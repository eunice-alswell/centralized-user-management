import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedRole");
    localStorage.removeItem("selectedApp");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: "/admin/users", label: "Users", icon: "👥" },
    { path: "/admin/applications", label: "Applications", icon: "📱" },
    { path: "/admin/assign", label: "Assign Access", icon: "🔐" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold">CentralIAM</h1>
              <p className="text-xs text-slate-400">ADMIN</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-slate-800 rounded"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 px-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all text-left ${
                isActive(item.path)
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
              title={collapsed ? item.label : ""}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-3 justify-center"
            title={collapsed ? "Logout" : ""}
          >
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Admin Console</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {localStorage.getItem("user") && JSON.parse(localStorage.getItem("user") || "{}").name}
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
