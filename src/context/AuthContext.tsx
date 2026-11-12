import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { authService } from "../services/authService";
import type { User } from "../types/ticket.types";

type SafeUser = Omit<User, "password">;
interface AuthContextValue { user: SafeUser | null; login: (email: string, password: string) => Promise<void>; logout: () => void }
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(() => authService.currentUser());
  const value = useMemo<AuthContextValue>(() => ({
    user,
    async login(email, password) { setUser(await authService.login(email, password)); },
    logout() { authService.logout(); setUser(null); }
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
