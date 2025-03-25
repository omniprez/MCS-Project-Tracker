import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import TeamMembers from "@/pages/TeamMembers";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Performance from "@/pages/Performance";
import Login from "@/pages/Login";
import AppLayout from "@/components/layout/AppLayout";
import { createContext, useContext, ReactNode } from "react";

// Create an auth context
interface AuthContextType {
  user: any;
  isLoading: boolean;
  isError: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Auth provider component
function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, isError, refetch: refetchUser } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return (
    <AuthContext.Provider value={{ user, isLoading, isError, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected route component
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // If still loading, show nothing
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Redirect to="/login" />;
  }

  // If authenticated, show the children
  return <>{children}</>;
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to="/" /> : <Login />}
      </Route>
      
      <Route>
        <ProtectedRoute>
          <AppLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/projects" component={Projects} />
              <Route path="/team-members" component={TeamMembers} />
              <Route path="/reports" component={Reports} />
              <Route path="/settings" component={Settings} />
              <Route path="/performance" component={Performance} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </ProtectedRoute>
      </Route>
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
