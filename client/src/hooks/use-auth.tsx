import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  login: UseMutationResult<SelectUser, Error, LoginData>;
  register: UseMutationResult<SelectUser, Error, RegisterData>;
  logout: () => void;
  updateProfileMutation: UseMutationResult<SelectUser, Error, Partial<SelectUser>>;
  changePasswordMutation: UseMutationResult<void, Error, { currentPassword: string; newPassword: string }>;
};

type LoginData = Pick<InsertUser, "email" | "password">;
type RegisterData = Pick<InsertUser, "email" | "password"> & {
  firstName?: string;
  lastName?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) =>
      apiRequest({ url: "/api/login", method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Login successful", description: "Welcome back!" });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) =>
      apiRequest({ url: "/api/register", method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Registration successful", description: "Welcome to Flow!" });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<SelectUser>) =>
      apiRequest({ url: "/api/user/profile", method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Profile updated", description: "Your profile has been updated successfully." });
    },
    onError: (error: any) => {
      toast({
        title: "Profile update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiRequest({ url: "/api/user/password", method: "PUT", body: data }),
    onSuccess: () => {
      toast({ title: "Password changed", description: "Your password has been changed successfully." });
    },
    onError: (error: any) => {
      toast({
        title: "Password change failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const logout = () => {
    apiRequest({ url: "/api/logout", method: "POST" }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Logged out", description: "You have been logged out successfully." });
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        isAuthenticated: !!user,
        login: loginMutation,
        register: registerMutation,
        logout,
        updateProfileMutation,
        changePasswordMutation,
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