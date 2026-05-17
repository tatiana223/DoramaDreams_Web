import { ReactNode } from "react";
import { Navigate } from "react-router";
import { isAuthenticated } from "@/api/authStorage";

export function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
