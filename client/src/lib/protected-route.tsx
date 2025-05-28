import { Redirect, Route, RouteComponentProps } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  component: React.ComponentType<RouteComponentProps>;
  path: string;
}

export function ProtectedRoute({
  component: Component,
  path,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
