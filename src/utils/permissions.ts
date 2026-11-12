import type { Ticket, User, UserRole } from "../types/ticket.types";
export type Permission = "ticket:create" | "ticket:update" | "ticket:delete" | "ticket:assign" | "admin:access";
const rolePermissions: Record<UserRole, Permission[]> = {
  Administrator: ["ticket:create", "ticket:update", "ticket:delete", "ticket:assign", "admin:access"],
  "Support Manager": ["ticket:update", "ticket:assign"],
  "Support Agent": ["ticket:update"]
};
type PermissionUser = Pick<User, "name" | "role">;
export function hasPermission(user: PermissionUser | null, permission: Permission): boolean {
  return !!user && rolePermissions[user.role].includes(permission);
}
export function visibleTickets(tickets: Ticket[], user: PermissionUser | null): Ticket[] {
  if (!user) return [];
  if (user.role === "Administrator" || user.role === "Support Manager") return tickets;
  return tickets.filter((ticket) => ticket.assignedTo === user.name);
}
