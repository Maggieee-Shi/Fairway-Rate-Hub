import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, adminOnly = false, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;
