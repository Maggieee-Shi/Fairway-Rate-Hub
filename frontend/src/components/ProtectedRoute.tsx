import React from "react";
import { Navigate } from "react-router-dom";
import type { UserProps } from "../types";

interface ProtectedRouteProps extends UserProps {
  adminOnly?: boolean;
  children: React.ReactNode;
}

function ProtectedRoute({ user, adminOnly = false, children }: ProtectedRouteProps) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default ProtectedRoute;
