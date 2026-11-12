import { useState } from "react";
import { RotateCcw, UserRound, CheckCircle2 } from "lucide-react";
import type { TicketStatus } from "../../../types/ticket.types";

interface Props {
  count: number; agents: string[]; busy: boolean; canAssign: boolean; canUpdate: boolean;
  onStatus: (status: TicketStatus) => void; onAssign: (agent: string) => void; onClear: () => void;
  onSelectAllFiltered: () => void; allFilteredSelected: boolean;
}
export function BulkActionToolbar({ count, agents, busy, canAssign, canUpdate, onStatus, onAssign, onClear, onSelectAllFiltered, allFilteredSelected }: Props) {
  const [status, setStatus] = useState<TicketStatus>("In Progress");
  const [agent, setAgent] = useState(agents[0] ?? "");
  return <div className="bulk-toolbar" aria-label="Bulk ticket actions">
    <div className="bulk-selection"><strong>{count}</strong> ticket{count === 1 ? "" : "s"} selected <button className="text-button" disabled={busy || allFilteredSelected} onClick={onSelectAllFiltered}>Select all filtered</button></div>
    <div className="bulk-controls">
      {canUpdate && <div className="bulk-control"><select aria-label="Bulk status" value={status} onChange={(event) => setStatus(event.target.value as TicketStatus)}><option>Open</option><option>Pending</option><option>In Progress</option><option>Resolved</option><option>Closed</option></select><button className="btn btn-secondary btn-small" disabled={!count || busy} onClick={() => onStatus(status)}><CheckCircle2 size={14}/> Update status</button></div>}
      {canAssign && <div className="bulk-control"><select aria-label="Assign selected tickets" value={agent} onChange={(event) => setAgent(event.target.value)}>{agents.map((name) => <option key={name}>{name}</option>)}</select><button className="btn btn-secondary btn-small" disabled={!count || busy || !agent} onClick={() => onAssign(agent)}><UserRound size={14}/> Assign</button></div>}
      <button className="text-button clear-selection" disabled={!count || busy} onClick={onClear}><RotateCcw size={13}/> Clear</button>
    </div>
  </div>;
}
