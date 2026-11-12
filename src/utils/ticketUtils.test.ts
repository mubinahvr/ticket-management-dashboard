import { describe, expect, it } from "vitest";
import { filterTickets, ticketStats } from "./ticketUtils";
import { initialTickets } from "../data/mockData";
describe("ticket utilities", () => {
  it("searches by customer, subject or id", () => {
    expect(filterTickets(initialTickets,{search:"Olivia",status:"All",priority:"All",sort:"newest"})).toHaveLength(1);
    expect(filterTickets(initialTickets,{search:"TCK-1003",status:"All",priority:"All",sort:"newest"})[0].customerName).toBe("Ava Davis");
  });
  it("combines status and priority filters", () => {
    expect(filterTickets(initialTickets,{search:"",status:"Open",priority:"Critical",sort:"newest"})).toHaveLength(1);
  });
  it("calculates summary statistics", () => {
    expect(ticketStats(initialTickets)).toEqual({total:6,open:2,inProgress:2,resolved:2});
  });
});
