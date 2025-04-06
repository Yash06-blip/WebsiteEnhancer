import { FC, ComponentType } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  component: ComponentType;
  path: string;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  component: Component,
  path,
}) => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }

  return <Component />;
};
