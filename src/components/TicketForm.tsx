import { useState, type FormEvent } from "react";
import type { Ticket, TicketInput } from "../types/ticket.types";
const empty: TicketInput = { customerName: "", email: "", subject: "", description: "", priority: "Medium", status: "Open", assignedTo: "Taylor Smith" };
export function TicketForm({ ticket, agents, onSave, onCancel }: { ticket?: Ticket; agents: string[]; onSave: (input: TicketInput) => void; onCancel: () => void }) {
  const [form, setForm] = useState<TicketInput>(ticket ? { customerName: ticket.customerName, email: ticket.email, subject: ticket.subject, description: ticket.description, priority: ticket.priority, status: ticket.status, assignedTo: ticket.assignedTo } : empty);
  const [error, setError] = useState("");
  function update<K extends keyof TicketInput>(key: K, value: TicketInput[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.customerName.trim() || !form.email.trim() || !form.subject.trim() || !form.description.trim()) { setError("Please complete all required fields."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Enter a valid email address."); return; }
    setError(""); onSave(form);
  }
  return <form className="ticket-form" onSubmit={submit} noValidate>
    <div className="form-grid">
      <label>Customer name *<input value={form.customerName} onChange={(e) => update("customerName", e.target.value)} required /></label>
      <label>Email *<input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required /></label>
      <label className="full">Subject *<input value={form.subject} onChange={(e) => update("subject", e.target.value)} required /></label>
      <label className="full">Description *<textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} required /></label>
      <label>Priority<select value={form.priority} onChange={(e) => update("priority", e.target.value as TicketInput["priority"])}>{["Low","Medium","High","Critical"].map((v) => <option key={v}>{v}</option>)}</select></label>
      <label>Status<select value={form.status} onChange={(e) => update("status", e.target.value as TicketInput["status"])}>{["Open","Pending","In Progress","Resolved","Closed"].map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="full">Assigned to<select value={form.assignedTo} onChange={(e) => update("assignedTo", e.target.value)}>{agents.map((agent) => <option key={agent}>{agent}</option>)}</select></label>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button><button className="btn btn-primary" type="submit">{ticket ? "Save changes" : "Create ticket"}</button></div>
  </form>;
}
