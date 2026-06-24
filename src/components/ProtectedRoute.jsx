import { Navigate, Outlet } from "react-router-dom";
import { ADMIN_AUTH_KEY, getAdminCookieToken } from "../services/apiClient";

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem(ADMIN_AUTH_KEY) === "true";

  return isAuthenticated || getAdminCookieToken() ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

export default ProtectedRoute;
