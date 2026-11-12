import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BulkActionToolbar } from "./BulkActionToolbar";

describe("BulkActionToolbar", () => {
  it("disables bulk operations when no tickets are selected", () => {
    render(<BulkActionToolbar count={0} agents={["Taylor Smith"]} busy={false} canAssign canUpdate onStatus={vi.fn()} onAssign={vi.fn()} onClear={vi.fn()} onSelectAllFiltered={vi.fn()} allFilteredSelected={false}/>);
    expect(screen.getByRole("button", { name: /update status/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /assign/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /clear/i })).toBeDisabled();
  });

  it("does not render assignment controls for a role without assignment permission", () => {
    render(<BulkActionToolbar count={2} agents={["Taylor Smith"]} busy={false} canAssign={false} canUpdate onStatus={vi.fn()} onAssign={vi.fn()} onClear={vi.fn()} onSelectAllFiltered={vi.fn()} allFilteredSelected={false}/>);
    expect(screen.queryByRole("button", { name: /assign/i })).not.toBeInTheDocument();
  });
});
