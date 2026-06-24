import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useLocation } from "wouter";

export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  role: "student" | "faculty" | "maintenance" | "admin";
  enrollmentNumber?: string | null;
  collegeName?: string | null;
  department?: string | null;
  semester?: number | null;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem("campusflow_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("campusflow_token");
  });

  const [, setLocation] = useLocation();

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem("campusflow_token", newToken);
    localStorage.setItem("campusflow_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("campusflow_token");
    localStorage.removeItem("campusflow_user");
    setToken(null);
    setUser(null);
    setLocation("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function ProtectedRoute({
  component: Component,
  role,
  ...rest
}: {
  component: any;
  role?: string;
  [key: string]: any;
}) {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login/admin");
    } else if (role && user?.role !== role && user?.role !== "admin") {
      setLocation(`/dashboard/${user?.role || "student"}`);
    }
  }, [isAuthenticated, user, role, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  if (role && user?.role !== role && user?.role !== "admin") {
    return null;
  }

  return <Component {...rest} />;
}
