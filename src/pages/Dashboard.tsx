import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, CheckCircle2, CircleHelp, LogOut, Plus, Search, Ticket as TicketIcon, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { hasPermission, visibleTickets } from "../utils/permissions";
import { filterTickets, ticketStats } from "../utils/ticketUtils";
import type { Ticket, TicketInput, TicketStatus } from "../types/ticket.types";
import { StatCard } from "../components/StatCard";
import { TicketTable } from "../components/TicketTable";
import { TicketForm } from "../components/TicketForm";
import { Modal } from "../components/Modal";
import { useDebounce } from "../hooks/useDebounce";
import { users } from "../data/mockData";
import { useTicketSelection } from "../hooks/useTicketSelection";
import { BulkActionToolbar } from "../features/tickets/components/BulkActionToolbar";
import {
  useGetTicketsQuery, useCreateTicketMutation, useUpdateTicketMutation,
  useDeleteTicketMutation, useBulkUpdateStatusMutation, useBulkAssignTicketsMutation
} from "../features/tickets/services/ticketApi";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "error" in error) return String(error.error);
  return fallback;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: allTickets = [], isLoading, isError, error, refetch } = useGetTicketsQuery();
  const [createTicket] = useCreateTicketMutation();
  const [updateTicket] = useUpdateTicketMutation();
  const [deleteTicket, deleteState] = useDeleteTicketMutation();
  const [bulkUpdateStatus, statusState] = useBulkUpdateStatusMutation();
  const [bulkAssignTickets, assignState] = useBulkAssignTicketsMutation();
  const [query, setQuery] = useState(""); const debouncedQuery = useDebounce(query);
  const [status, setStatus] = useState("All"); const [priority, setPriority] = useState("All"); const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1); const [editing, setEditing] = useState<Ticket | undefined>(); const [creating, setCreating] = useState(false); const [deleting, setDeleting] = useState<Ticket | undefined>();
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const selection = useTicketSelection();
  const bulkSubmissionLock = useRef(false);
  const pageSize = 5;
  const tickets = useMemo(() => visibleTickets(allTickets, user), [allTickets, user]);
  const filtered = useMemo(() => filterTickets(tickets, { search: debouncedQuery, status, priority, sort }), [tickets, debouncedQuery, status, priority, sort]);
  const stats = useMemo(() => ticketStats(tickets), [tickets]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageTickets = filtered.slice((page - 1) * pageSize, page * pageSize);
  const canEdit = hasPermission(user, "ticket:update"); const canDelete = hasPermission(user, "ticket:delete");
  const canAssign = hasPermission(user, "ticket:assign");
  const agents = users.filter((u) => u.role === "Support Agent").map((u) => u.name);
  const busy = statusState.isLoading || assignState.isLoading;
  const selectedCount = selection.selectedIds.length;

  useEffect(() => { selection.prune(allTickets.map((ticket) => ticket.id)); }, [allTickets, selection.prune]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

  const closeModal = useCallback(() => { setCreating(false); setEditing(undefined); }, []);
  async function save(input: TicketInput) {
    try {
      if (editing) await updateTicket({ id: editing.id, input }).unwrap();
      else await createTicket(input).unwrap();
      closeModal(); setFeedback({ kind: "success", message: editing ? "Ticket updated." : "Ticket created." });
    } catch (e) { setFeedback({ kind: "error", message: getErrorMessage(e, "Unable to save ticket.") }); }
  }
  async function changeStatus(ticket: Ticket, statusValue: TicketStatus) {
    try {
      const input: TicketInput = { customerName: ticket.customerName, email: ticket.email, subject: ticket.subject, description: ticket.description, priority: ticket.priority, status: statusValue, assignedTo: ticket.assignedTo };
      await updateTicket({ id: ticket.id, input }).unwrap();
      setFeedback({ kind: "success", message: `${ticket.id} status updated.` });
    } catch (e) { setFeedback({ kind: "error", message: getErrorMessage(e, "Unable to update status.") }); }
  }
  async function confirmDelete() {
    if (!deleting || deleteState.isLoading) return;
    try { await deleteTicket(deleting.id).unwrap(); setDeleting(undefined); setFeedback({ kind: "success", message: "Ticket deleted." }); }
    catch (e) { setFeedback({ kind: "error", message: getErrorMessage(e, "Unable to delete ticket.") }); }
  }
  async function handleBulkStatus(nextStatus: TicketStatus) {
    if (!canEdit || !selectedCount || busy || bulkSubmissionLock.current) return;
    if (!window.confirm(`Update ${selectedCount} selected ticket(s) to "${nextStatus}"?`)) return;
    bulkSubmissionLock.current = true;
    try {
      await bulkUpdateStatus({ ids: selection.selectedIds, status: nextStatus }).unwrap();
      selection.clear(); setFeedback({ kind: "success", message: `${selectedCount} ticket(s) updated to ${nextStatus}.` });
    } catch (e) { setFeedback({ kind: "error", message: getErrorMessage(e, "Bulk status update failed. Changes were rolled back.") }); }
    finally { bulkSubmissionLock.current = false; }
  }
  async function handleBulkAssign(agent: string) {
    if (!canAssign || !selectedCount || busy || bulkSubmissionLock.current) return;
    if (!window.confirm(`Assign ${selectedCount} selected ticket(s) to ${agent}?`)) return;
    bulkSubmissionLock.current = true;
    try {
      await bulkAssignTickets({ ids: selection.selectedIds, assignedTo: agent }).unwrap();
      selection.clear(); setFeedback({ kind: "success", message: `${selectedCount} ticket(s) assigned to ${agent}.` });
    } catch (e) { setFeedback({ kind: "error", message: getErrorMessage(e, "Bulk assignment failed.") }); }
    finally { bulkSubmissionLock.current = false; }
  }
  function changeFilter(setter: (value: string) => void, value: string) { setter(value); setPage(1); }
  const visiblePageIds = pageTickets.map((ticket) => ticket.id);
  const allPageSelected = visiblePageIds.length > 0 && visiblePageIds.every((id) => selection.selectedSet.has(id));
  const apiError = error && "error" in error ? String(error.error) : error && "message" in error ? String(error.message) : "Unable to load tickets.";

  return <div className="app-shell">
    <aside className="sidebar"><div className="sidebar-brand"><span className="brand-mark small"><TicketIcon size={19}/></span><span>SupportDesk</span></div><div className="nav-label">WORKSPACE</div><a className="nav-link active"><Activity size={18}/> Ticket dashboard</a><div className="sidebar-bottom"><div className="avatar">{user?.name.split(" ").map((n) => n[0]).join("")}</div><div className="user-meta"><strong>{user?.name}</strong><span>{user?.role}</span></div><button className="icon-button logout" aria-label="Sign out" onClick={logout}><LogOut size={17}/></button></div></aside>
    <main className="main-content"><header className="topbar"><div><p className="eyebrow">CUSTOMER SUPPORT / OVERVIEW</p><h1>Ticket dashboard</h1></div><div className="top-actions"><span className="role-chip">{user?.role}</span>{hasPermission(user, "ticket:create") && <button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={17}/> New ticket</button>}</div></header>
      <section className="welcome-row"><div><h2>Good day, {user?.name.split(" ")[0]}</h2><p>Here’s what’s happening with your support queue.</p></div><span className="date-label">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span></section>
      <section className="stats-grid"><StatCard label="Total tickets" value={stats.total} icon={<TicketIcon size={20}/>}/><StatCard label="Open" value={stats.open} icon={<CircleHelp size={20}/>}/><StatCard label="In progress" value={stats.inProgress} icon={<Activity size={20}/>}/><StatCard label="Resolved / closed" value={stats.resolved} icon={<CheckCircle2 size={20}/>}/></section>
      <section className="panel"><div className="panel-heading"><div><h2>All tickets</h2><p>{filtered.length} matching tickets</p></div><div className="search-box"><Search size={17}/><input aria-label="Search tickets" placeholder="Search ID, customer or subject…" value={query} onChange={(e) => changeFilter(setQuery, e.target.value)}/></div></div>
        <div className="filter-row"><label>Status<select value={status} onChange={(e) => changeFilter(setStatus, e.target.value)}>{["All", "Open", "Pending", "In Progress", "Resolved", "Closed"].map((v) => <option key={v}>{v}</option>)}</select></label><label>Priority<select value={priority} onChange={(e) => changeFilter(setPriority, e.target.value)}>{["All", "Critical", "High", "Medium", "Low"].map((v) => <option key={v}>{v}</option>)}</select></label><label>Sort by<select value={sort} onChange={(e) => changeFilter(setSort, e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="priority">Priority</option></select></label><span className="filter-spacer"/><span className="result-count"><Users size={15}/> {tickets.length} visible to your role</span></div>
        {feedback && <div className={`feedback ${feedback.kind}`} role="status">{feedback.message}<button className="text-button" onClick={() => setFeedback(null)}>Dismiss</button></div>}
        <BulkActionToolbar count={selectedCount} agents={agents} busy={busy} canAssign={canAssign} canUpdate={canEdit} onStatus={handleBulkStatus} onAssign={handleBulkAssign} onClear={selection.clear} onSelectAllFiltered={() => selection.toggleMany(filtered.map((ticket) => ticket.id).filter((id) => !selection.selectedSet.has(id)))} allFilteredSelected={filtered.length === 0 || filtered.every((ticket) => selection.selectedSet.has(ticket.id))}/>
        {isLoading ? <div className="loading-state">Loading tickets…</div> : isError ? <div className="error-state" role="alert">{apiError} <button className="text-button" onClick={() => refetch()}>Retry</button></div> : <TicketTable tickets={pageTickets} canEdit={canEdit} canDelete={canDelete} selectedIds={selection.selectedSet} allVisibleSelected={allPageSelected} selectionDisabled={busy} onToggle={selection.toggle} onToggleAll={() => selection.toggleMany(visiblePageIds)} onEdit={setEditing} onDelete={setDeleting} onStatus={changeStatus}/>}
        {!isLoading && !isError && filtered.length > 0 && <div className="pagination"><span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div><button className="btn btn-secondary btn-small" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button><span className="page-number">{page} / {pageCount}</span><button className="btn btn-secondary btn-small" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>Next</button></div></div>}
      </section>
      <footer className="footer-note">SupportDesk · Demo application · Mock authentication and local persistence</footer>
    </main>
    {(creating || editing) && <Modal title={editing ? `Edit ${editing.id}` : "Create new ticket"} onClose={closeModal}><TicketForm ticket={editing} agents={agents} onSave={save} onCancel={closeModal}/></Modal>}
    {deleting && <Modal title="Delete ticket?" onClose={() => setDeleting(undefined)}><div className="confirm-content"><p>Are you sure you want to delete <strong>{deleting.id}</strong> for {deleting.customerName}? This action cannot be undone.</p><div className="form-actions"><button className="btn btn-secondary" onClick={() => setDeleting(undefined)}>Cancel</button><button className="btn btn-danger" disabled={deleteState.isLoading} onClick={confirmDelete}>Delete ticket</button></div></div></Modal>}
  </div>;
}
