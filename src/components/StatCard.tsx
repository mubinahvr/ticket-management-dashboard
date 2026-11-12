import type { ReactNode } from "react";
export function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return <article className="stat-card"><div><span className="stat-label">{label}</span><strong>{value}</strong></div><span className="stat-icon">{icon}</span></article>;
}
