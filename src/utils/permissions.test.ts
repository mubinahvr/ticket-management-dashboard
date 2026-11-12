import { describe, expect, it } from "vitest";
import { users, initialTickets } from "../data/mockData";
import { hasPermission, visibleTickets } from "./permissions";
describe("RBAC helpers", () => {
  it("allows only administrators to delete", () => {
    expect(hasPermission(users[0],"ticket:delete")).toBe(true);
    expect(hasPermission(users[1],"ticket:delete")).toBe(false);
    expect(hasPermission(users[2],"ticket:delete")).toBe(false);
  });
  it("allows bulk assignment only for administrators and managers", () => {
    expect(hasPermission(users[0], "ticket:assign")).toBe(true);
    expect(hasPermission(users[1], "ticket:assign")).toBe(true);
    expect(hasPermission(users[2], "ticket:assign")).toBe(false);
  });
  it("limits agents to assigned tickets", () => {
    const visible = visibleTickets(initialTickets,users[2]);
    expect(visible.every((ticket)=>ticket.assignedTo===users[2].name)).toBe(true);
  });
});
