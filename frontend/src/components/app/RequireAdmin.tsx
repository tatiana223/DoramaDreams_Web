import { ReactNode } from "react";
import { Navigate } from "react-router";
import { getCurrentUser, isAuthenticated } from "@/api/authStorage";

export function RequireAdmin({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();

  if (user?.role !== "ADMIN") {
    return <Navigate to="/profile" replace />;
  }

  return children;
}