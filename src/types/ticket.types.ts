export type TicketStatus = "Open" | "Pending" | "In Progress" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Critical";
export type UserRole = "Administrator" | "Support Manager" | "Support Agent";

export interface Ticket {
  id: string;
  customerName: string;
  email: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  assignedTo: string;
}
export interface TicketInput extends Omit<Ticket, "id" | "createdAt"> {}
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
