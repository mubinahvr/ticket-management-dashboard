import { useCallback, useMemo, useState } from "react";

export function useTicketSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const toggle = useCallback((id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }, []);
  const toggleMany = useCallback((ids: string[]) => {
    setSelectedIds((current) => {
      const allSelected = ids.length > 0 && ids.every((id) => current.includes(id));
      return allSelected ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])];
    });
  }, []);
  const clear = useCallback(() => setSelectedIds([]), []);
  const prune = useCallback((validIds: string[]) => {
    const valid = new Set(validIds);
    setSelectedIds((current) => current.filter((id) => valid.has(id)));
  }, []);
  return { selectedIds, selectedSet, toggle, toggleMany, clear, prune };
}
