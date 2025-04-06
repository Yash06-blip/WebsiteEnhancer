import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { getQueryFn } from "@/lib/queryUtils";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  fullName: string;
  role: number; // Numeric role ID from UserRole enum
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
  role?: 'manager' | 'miner' | 'operator' | 'driller' | 'blaster';
  role_id?: number; // Numeric role ID from UserRole enum
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRoleName: string | null;
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
      // Handle role conversions
      const payload: any = { ...data };
      
      // If data contains role_id, use it directly
      if (data.role_id !== undefined) {
        // Keep the role_id as is, it should already be a number
      } 
      // Otherwise, if it contains string role, convert it to a number
      else if (data.role !== undefined) {
        switch(data.role) {
          case 'manager': 
            payload.role_id = 1; // UserRole.MANAGER
            break;
          case 'miner': 
            payload.role_id = 2; // UserRole.MINER
            break;
          case 'operator': 
            payload.role_id = 3; // UserRole.OPERATOR
            break;
          case 'driller': 
            payload.role_id = 4; // UserRole.DRILLER
            break;
          case 'blaster': 
            payload.role_id = 5; // UserRole.BLASTER
            break;
          default:
            payload.role_id = 2; // Default to MINER
        }
      }
      // If neither is present, default to miner (2)
      else {
        payload.role_id = 2; // UserRole.MINER
      }
      
      const res = await apiRequest('POST', '/api/register', payload);
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
      await apiRequest('POST', '/api/logout', {});
      // No need to parse JSON as the endpoint returns a 200 status with no content
      return null;
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

  const userRoleName = user ? getRoleName(user.role) : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
        isAuthenticated: !!user,
        userRoleName,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Helper function to convert numeric role ID to readable string
export function getRoleName(roleId: number): string {
  switch(roleId) {
    case 1: return 'Manager';
    case 2: return 'Miner';
    case 3: return 'Operator';
    case 4: return 'Driller';
    case 5: return 'Blaster';
    default: return 'Unknown Role';
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


