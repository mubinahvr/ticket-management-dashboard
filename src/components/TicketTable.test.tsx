import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TicketTable } from "./TicketTable";
import { initialTickets } from "../data/mockData";
const props = {
  canEdit: false, canDelete: false, selectedIds: new Set<string>(), allVisibleSelected: false, selectionDisabled: false,
  onToggle: vi.fn(), onToggleAll: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), onStatus: vi.fn()
};
describe("TicketTable", () => {
  it("renders ticket rows and selection checkbox", () => {
    render(<TicketTable {...props} tickets={initialTickets.slice(0, 1)} />);
    expect(screen.getByText("TCK-1001")).toBeInTheDocument();
    expect(screen.getByText("Olivia Brown")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Select TCK-1001" })).toBeInTheDocument();
  });
  it("shows an empty state", () => {
    render(<TicketTable {...props} tickets={[]} />);
    expect(screen.getByText("No tickets found")).toBeInTheDocument();
  });
});
