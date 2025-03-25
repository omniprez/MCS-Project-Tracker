import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

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
export function AuthProvider({ children }: { children: ReactNode }) {
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