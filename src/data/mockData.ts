import type { Ticket, User } from "../types/ticket.types";

export const users: User[] = [
  { id: "u1", name: "Alex Morgan", email: "admin@demo.com", password: "admin123", role: "Administrator" },
  { id: "u2", name: "Jordan Lee", email: "manager@demo.com", password: "manager123", role: "Support Manager" },
  { id: "u3", name: "Taylor Smith", email: "agent@demo.com", password: "agent123", role: "Support Agent" },
  { id: "u4", name: "Morgan Chen", email: "agent2@demo.com", password: "agent123", role: "Support Agent" }
];

export const initialTickets: Ticket[] = [
  { id: "TCK-1001", customerName: "Olivia Brown", email: "olivia@example.com", subject: "Unable to access account", description: "Login fails after password reset.", priority: "High", status: "Open", createdAt: "2026-11-01", assignedTo: "Taylor Smith" },
  { id: "TCK-1002", customerName: "Noah Wilson", email: "noah@example.com", subject: "Invoice correction", description: "The latest invoice has an incorrect address.", priority: "Medium", status: "In Progress", createdAt: "2026-11-02", assignedTo: "Taylor Smith" },
  { id: "TCK-1003", customerName: "Ava Davis", email: "ava@example.com", subject: "App crashes on launch", description: "Application closes immediately on startup.", priority: "Critical", status: "Open", createdAt: "2026-11-03", assignedTo: "Jordan Lee" },
  { id: "TCK-1004", customerName: "Liam Miller", email: "liam@example.com", subject: "Feature request", description: "Please add CSV export.", priority: "Low", status: "Resolved", createdAt: "2026-11-04", assignedTo: "Jordan Lee" },
  { id: "TCK-1005", customerName: "Sophia Garcia", email: "sophia@example.com", subject: "Payment not reflected", description: "Payment completed but account is unchanged.", priority: "High", status: "In Progress", createdAt: "2026-11-05", assignedTo: "Taylor Smith" },
  { id: "TCK-1006", customerName: "Ethan Martinez", email: "ethan@example.com", subject: "Update contact details", description: "Need help changing phone number.", priority: "Low", status: "Closed", createdAt: "2026-11-06", assignedTo: "Jordan Lee" }
];
