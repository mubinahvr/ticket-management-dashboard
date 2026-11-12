import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTicketSelection } from "./useTicketSelection";

describe("useTicketSelection", () => {
  it("selects, toggles, selects many and clears ticket IDs", () => {
    const { result } = renderHook(() => useTicketSelection());
    act(() => result.current.toggle("T1"));
    expect(result.current.selectedIds).toEqual(["T1"]);
    act(() => result.current.toggleMany(["T1", "T2"]));
    expect(result.current.selectedIds).toEqual(["T1", "T2"]);
    act(() => result.current.toggleMany(["T1", "T2"]));
    expect(result.current.selectedIds).toEqual([]);
    act(() => result.current.clear());
    expect(result.current.selectedIds).toEqual([]);
  });
  it("prunes deleted ticket IDs", () => {
    const { result } = renderHook(() => useTicketSelection());
    act(() => result.current.toggleMany(["T1", "T2"]));
    act(() => result.current.prune(["T2"]));
    expect(result.current.selectedIds).toEqual(["T2"]);
  });
});
