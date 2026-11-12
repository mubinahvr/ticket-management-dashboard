import { initialTickets } from "../data/mockData";
import type { Ticket, TicketInput, TicketStatus } from "../types/ticket.types";

const STORAGE_KEY = "supportdesk-tickets";
const wait = () => new Promise((resolve) => setTimeout(resolve, 180));
function read(): Ticket[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Ticket[];
  } catch { /* recover with seed data */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTickets));
  return [...initialTickets];
}
function write(tickets: Ticket[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); }

export const ticketService = {
  async getAll(): Promise<Ticket[]> { await wait(); return read(); },
  async getById(id: string): Promise<Ticket | undefined> { await wait(); return read().find((ticket) => ticket.id === id); },
  async create(input: TicketInput): Promise<Ticket> {
    await wait();
    const ticket: Ticket = { ...input, id: `TCK-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) };
    write([ticket, ...read()]);
    return ticket;
  },
  async update(id: string, input: TicketInput): Promise<Ticket> {
    await wait();
    const tickets = read();
    if (!tickets.some((ticket) => ticket.id === id)) throw new Error(`Ticket ${id} was not found.`);
    const updated = tickets.map((ticket) => ticket.id === id ? { ...ticket, ...input } : ticket);
    write(updated);
    return updated.find((ticket) => ticket.id === id)!;
  },
  async remove(id: string): Promise<void> {
    await wait();
    const tickets = read();
    if (!tickets.some((ticket) => ticket.id === id)) throw new Error("Ticket not found.");
    write(tickets.filter((ticket) => ticket.id !== id));
  },
  async bulkUpdateStatus(ids: string[], status: TicketStatus): Promise<Ticket[]> {
    await wait();
    const tickets = read();
    const found = new Set(tickets.filter((ticket) => ids.includes(ticket.id)).map((ticket) => ticket.id));
    if (found.size !== ids.length) throw new Error("One or more selected tickets no longer exist. Refresh and try again.");
    const updated = tickets.map((ticket) => ids.includes(ticket.id) ? { ...ticket, status } : ticket);
    write(updated);
    return updated.filter((ticket) => ids.includes(ticket.id));
  },
  async bulkAssign(ids: string[], assignedTo: string): Promise<Ticket[]> {
    await wait();
    const tickets = read();
    const found = new Set(tickets.filter((ticket) => ids.includes(ticket.id)).map((ticket) => ticket.id));
    if (found.size !== ids.length) throw new Error("One or more selected tickets no longer exist. Refresh and try again.");
    const updated = tickets.map((ticket) => ids.includes(ticket.id) ? { ...ticket, assignedTo } : ticket);
    write(updated);
    return updated.filter((ticket) => ids.includes(ticket.id));
  }
};
