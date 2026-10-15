import React from "react";
import { Navigate } from "react-router-dom";
import { Loader } from "lucide-react";

const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const isAuth = typeof window !== "undefined" && !!localStorage.getItem("restau_admin_web_token");
  const isAdmin =
    isAuth && typeof window !== "undefined" && localStorage.getItem("restau_admin_web_user")
      ? JSON.parse(localStorage.getItem("restau_admin_web_user")).role === "ADMIN"
      : false;

  if (!isAuth) {
    return <Navigate to={redirectTo} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
