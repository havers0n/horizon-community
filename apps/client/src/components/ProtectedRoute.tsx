import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
