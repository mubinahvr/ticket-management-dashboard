import { Pencil, Trash2 } from "lucide-react";
import type { Ticket } from "../types/ticket.types";
export function TicketTable({ tickets, canEdit, canDelete, selectedIds, allVisibleSelected, selectionDisabled, onToggle, onToggleAll, onEdit, onDelete, onStatus }: {
  tickets: Ticket[]; canEdit: boolean; canDelete: boolean; selectedIds: Set<string>; allVisibleSelected: boolean; selectionDisabled: boolean;
  onToggle: (id: string) => void; onToggleAll: () => void;
  onEdit: (ticket: Ticket) => void; onDelete: (ticket: Ticket) => void; onStatus: (ticket: Ticket, status: Ticket["status"]) => void;
}) {
  if (!tickets.length) return <div className="empty-state"><div className="empty-icon">⌕</div><h3>No tickets found</h3><p>Try changing your search or filters.</p></div>;
  return <div className="table-wrap"><table><thead><tr><th><input aria-label="Select all tickets on this page" type="checkbox" checked={allVisibleSelected} disabled={selectionDisabled} onChange={onToggleAll}/></th><th>Ticket</th><th>Customer</th><th>Subject</th><th>Priority</th><th>Status</th><th>Created</th><th>Assignee</th><th>Actions</th></tr></thead>
    <tbody>{tickets.map((ticket) => <tr key={ticket.id} className={selectedIds.has(ticket.id) ? "selected-row" : ""}>
      <td><input aria-label={`Select ${ticket.id}`} type="checkbox" checked={selectedIds.has(ticket.id)} disabled={selectionDisabled} onChange={() => onToggle(ticket.id)}/></td>
      <td className="ticket-id">{ticket.id}</td><td><strong>{ticket.customerName}</strong><small>{ticket.email}</small></td><td className="subject-cell">{ticket.subject}</td>
      <td><span className={`badge priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span></td>
      <td>{canEdit ? <select className="status-select" aria-label={`Status for ${ticket.id}`} value={ticket.status} onChange={(e) => onStatus(ticket, e.target.value as Ticket["status"])}>{["Open","Pending","In Progress","Resolved","Closed"].map((s) => <option key={s}>{s}</option>)}</select> : <span className={`badge status-${ticket.status.toLowerCase().replace(" ","-")}`}>{ticket.status}</span>}</td>
      <td>{new Date(`${ticket.createdAt}T00:00:00`).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td><td>{ticket.assignedTo}</td>
      <td><div className="row-actions">{canEdit && <button className="icon-button" onClick={() => onEdit(ticket)} aria-label={`Edit ${ticket.id}`}><Pencil size={16}/></button>}{canDelete && <button className="icon-button danger" onClick={() => onDelete(ticket)} aria-label={`Delete ${ticket.id}`}><Trash2 size={16}/></button>}</div></td>
    </tr>)}</tbody></table></div>;
}
