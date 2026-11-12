import type { Ticket, TicketPriority, TicketStatus } from "../types/ticket.types";
export interface TicketFilters { search: string; status: string; priority: string; sort: string }
const priorityRank: Record<TicketPriority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
export function filterTickets(tickets: Ticket[], filters: TicketFilters): Ticket[] {
  const term = filters.search.trim().toLowerCase();
  return tickets.filter((ticket) => {
    const matchesSearch = !term || [ticket.id, ticket.customerName, ticket.subject].some((value) => value.toLowerCase().includes(term));
    return matchesSearch && (filters.status === "All" || ticket.status === filters.status) && (filters.priority === "All" || ticket.priority === filters.priority);
  }).sort((a, b) => {
    if (filters.sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
    if (filters.sort === "priority") return priorityRank[b.priority] - priorityRank[a.priority];
    return b.createdAt.localeCompare(a.createdAt);
  });
}
export function ticketStats(tickets: Ticket[]) {
  return {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === ("Open" satisfies TicketStatus)).length,
    inProgress: tickets.filter((ticket) => ticket.status === "In Progress").length,
    resolved: tickets.filter((ticket) => ticket.status === "Resolved" || ticket.status === "Closed").length
  };
}
