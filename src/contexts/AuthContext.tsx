import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Role } from "@/lib/types";

interface AuthContextType {
  token: string | null;
  userId: number | null;
  role: Role | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: number, role: Role, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [userId, setUserId] = useState<number | null>(() => {
    const id = localStorage.getItem("userId");
    return id ? Number(id) : null;
  });
  const [role, setRole] = useState<Role | null>(() => localStorage.getItem("role") as Role | null);
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("username"));

  const login = useCallback((token: string, userId: number, role: Role, username: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", String(userId));
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
    setToken(token);
    setUserId(userId);
    setRole(role);
    setUsername(username);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setToken(null);
    setUserId(null);
    setRole(null);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, userId, role, username, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
