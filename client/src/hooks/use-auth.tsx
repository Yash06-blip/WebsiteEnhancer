import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  fullName: string;
  role: 'manager' | 'miner';
  initials: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  fullName: string;
  email?: string;
  contact?: string;
  role?: 'manager' | 'miner';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<User | null>({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest('POST', '/api/login', credentials);
      return res.json();
    },
    onSuccess: () => {
      refetch();
      setLocation('/');
      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest('POST', '/api/register', {
        ...data,
        role_id: data.role === 'manager' ? 1 : 2,
      });
      return res.json();
    },
    onSuccess: () => {
      refetch();
      setLocation('/');
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/logout', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation('/auth');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  useEffect(() => {
    // If user is logged in and at /auth, redirect to /
    if (user && window.location.pathname === '/auth') {
      setLocation('/');
    }
  }, [user, setLocation]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T,>({ on401 }: { on401: UnauthorizedBehavior }) => 
  async ({ queryKey }: { queryKey: unknown[] }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    
    return await res.json() as T;
  };
