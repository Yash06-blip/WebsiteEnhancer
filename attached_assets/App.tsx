import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import ShiftLogs from "@/pages/shift-logs";
import Templates from "@/pages/templates";
import Incidents from "@/pages/incidents";
import Reports from "@/pages/reports";
import Team from "@/pages/team";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/shift-logs" component={ShiftLogs} />
      <ProtectedRoute path="/templates" component={Templates} />
      <ProtectedRoute path="/incidents" component={Incidents} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/team" component={Team} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
