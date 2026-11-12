import { users } from "../data/mockData";
import type { User } from "../types/ticket.types";

const SESSION_KEY = "supportdesk-user";
export const authService = {
  async login(email: string, password: string): Promise<Omit<User, "password">> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
    if (!user) throw new Error("Invalid email or password.");
    const { password: _password, ...safeUser } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser;
  },
  currentUser(): Omit<User, "password"> | null {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as Omit<User, "password"> | null; }
    catch { return null; }
  },
  logout() { localStorage.removeItem(SESSION_KEY); }
};
