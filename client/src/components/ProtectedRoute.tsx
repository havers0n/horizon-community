import { isAuthenticated } from "@/lib/auth";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
