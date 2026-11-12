import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ticketApi } from "./ticketApi";
import { initialTickets } from "../../../data/mockData";
import type { Ticket, TicketStatus } from "../../../types/ticket.types";

const service = vi.hoisted(() => ({
  getAll: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn(),
  remove: vi.fn(), bulkUpdateStatus: vi.fn(), bulkAssign: vi.fn()
}));
vi.mock("../../../services/ticketService", () => ({ ticketService: service }));

function makeStore() {
  return configureStore({
    reducer: { [ticketApi.reducerPath]: ticketApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(ticketApi.middleware)
  });
}

describe("ticketApi RTK Query", () => {
  let serverTickets: Ticket[];
  beforeEach(() => {
    vi.clearAllMocks();
    serverTickets = initialTickets.map((ticket) => ({ ...ticket }));
    service.getAll.mockImplementation(async () => serverTickets);
    service.getById.mockImplementation(async (id: string) => serverTickets.find((ticket) => ticket.id === id));
    service.bulkUpdateStatus.mockImplementation(async (ids: string[], status: TicketStatus) => {
      serverTickets = serverTickets.map((ticket) => ids.includes(ticket.id) ? { ...ticket, status } : ticket);
      return serverTickets.filter((ticket) => ids.includes(ticket.id));
    });
  });

  it("caches ticket list data and reuses it for a second subscriber", async () => {
    const store = makeStore();
    await store.dispatch(ticketApi.endpoints.getTickets.initiate()).unwrap();
    await store.dispatch(ticketApi.endpoints.getTickets.initiate()).unwrap();
    expect(service.getAll).toHaveBeenCalledTimes(1);
    store.dispatch(ticketApi.util.resetApiState());
  });

  it("optimistically updates the list and retains it after success", async () => {
    const store = makeStore();
    await store.dispatch(ticketApi.endpoints.getTickets.initiate()).unwrap();
    const mutation = store.dispatch(ticketApi.endpoints.bulkUpdateStatus.initiate({ ids: ["TCK-1001"], status: "Resolved" }));
    expect(ticketApi.endpoints.getTickets.select()(store.getState()).data?.[0].status).toBe("Resolved");
    await mutation.unwrap();
    expect(ticketApi.endpoints.getTickets.select()(store.getState()).data?.[0].status).toBe("Resolved");
    store.dispatch(ticketApi.util.resetApiState());
  });


  it("bulk-assigns selected tickets and refreshes the cached list", async () => {
    const store = makeStore();
    await store.dispatch(ticketApi.endpoints.getTickets.initiate()).unwrap();
    service.bulkAssign.mockImplementation(async (ids: string[], assignedTo: string) => {
      serverTickets = serverTickets.map((ticket) => ids.includes(ticket.id) ? { ...ticket, assignedTo } : ticket);
      return serverTickets.filter((ticket) => ids.includes(ticket.id));
    });
    await store.dispatch(ticketApi.endpoints.bulkAssignTickets.initiate({ ids: ["TCK-1001"], assignedTo: "Morgan Chen" })).unwrap();
    expect(ticketApi.endpoints.getTickets.select()(store.getState()).data?.[0].assignedTo).toBe("Taylor Smith");
    expect(service.getAll).toHaveBeenCalledTimes(2);
    store.dispatch(ticketApi.util.resetApiState());
  });

  it("rolls back optimistic changes when the bulk request fails", async () => {
    const store = makeStore();
    await store.dispatch(ticketApi.endpoints.getTickets.initiate()).unwrap();
    service.bulkUpdateStatus.mockRejectedValueOnce(new Error("Network unavailable"));
    await expect(store.dispatch(ticketApi.endpoints.bulkUpdateStatus.initiate({ ids: ["TCK-1001"], status: "Resolved" })).unwrap()).rejects.toBeTruthy();
    expect(ticketApi.endpoints.getTickets.select()(store.getState()).data?.[0].status).toBe("Open");
    store.dispatch(ticketApi.util.resetApiState());
  });
});
