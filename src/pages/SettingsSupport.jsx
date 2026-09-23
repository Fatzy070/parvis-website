import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleHelp, Clock3, LifeBuoy, MessageSquareText, Plus, Send, X } from "lucide-react";
import { api } from "../api/client";
import { Button, FormError, ErrorState, PageSkeleton } from "../components/UI";

const categories = [
  ["general", "General"], ["account", "Account"],
  ["billing_subscription", "Billing / Subscription"],
  ["course_content", "Course / Learning"],
  ["quiz_certificate", "Quiz / Certificate"],
  ["technical", "Technical Issue"], ["feedback", "Feedback"], ["other", "Other"],
];
const label = (value) => value?.replaceAll("_", " ") || "";
const when = (value) => new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium", timeStyle: "short",
}).format(new Date(value));

function StatusBadge({ status }) {
  return <span className={`ticket-status ticket-status-${status}`}>{label(status)}</span>;
}

function Modal({ title, children, onClose, wide = false }) {
  const panel = useRef();
  const titleId = `support-modal-${title.toLowerCase().replaceAll(" ", "-")}`;
  useEffect(() => {
    const previous = document.activeElement;
    panel.current?.focus();
    const escape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", escape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", escape);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section ref={panel} tabIndex="-1" className={`support-modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header className="support-modal-head"><div><p className="eyebrow">PARVIS HELP DESK</p><h2 id={titleId}>{title}</h2></div>
        <button type="button" className="icon-button" aria-label="Close support dialog" onClick={onClose}><X size={20} /></button>
      </header>
      {children}
    </section>
  </div>;
}

export default function SettingsSupport() {
  const [showCreate, setShowCreate] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTicket = searchParams.get("ticket");
  const query = useQuery({
    queryKey: ["support", "me"],
    queryFn: () => api("/support/me"),
  });
  const setSelectedTicket = (id) => setSearchParams(id ? { ticket: id } : {}, { replace: true });
  if (query.isPending) return <PageSkeleton />;
  if (query.isError) return <ErrorState error={query.error} retry={query.refetch} />;
  const tickets = query.data.items || [];
  const active = tickets.filter((ticket) => ["open", "in_progress"].includes(ticket.status)).length;
  return <section className="settings-card support-desk">
    <div className="support-hero">
      <div className="support-hero-icon"><LifeBuoy aria-hidden="true" /></div>
      <div><p className="eyebrow">SUPPORT</p><h2>How can we help?</h2>
        <p className="muted">Create a ticket and continue the conversation here. Replies from the Parvis team will appear in your ticket and notifications.</p></div>
      <Button onClick={() => setShowCreate(true)}><Plus size={17} />Create Ticket</Button>
    </div>
    <div className="support-summary" aria-label="Ticket summary">
      <div><strong>{tickets.length}</strong><span>Total tickets</span></div>
      <div><strong>{active}</strong><span>Need attention</span></div>
      <div><strong>{tickets.filter((ticket) => ticket.status === "resolved").length}</strong><span>Resolved</span></div>
    </div>
    <div className="support-list-head"><div><h3>My tickets</h3><p className="muted">Track requests and continue active conversations.</p></div></div>
    {tickets.length ? <div className="ticket-list">
      {tickets.map((ticket) => <button className="ticket-card" key={ticket.id} onClick={() => setSelectedTicket(ticket.id)}>
        <span className="ticket-card-icon"><MessageSquareText size={19} /></span>
        <span className="ticket-card-main"><strong>{ticket.subject}</strong>
          <span className="ticket-card-meta"><span>{label(ticket.category)}</span><span><Clock3 size={13} />Updated {when(ticket.updatedAt)}</span></span></span>
        <span className="ticket-card-side"><StatusBadge status={ticket.status} /><small>Created {when(ticket.createdAt)}</small></span>
      </button>)}
    </div> : <div className="support-empty"><CircleHelp size={34} aria-hidden="true" /><h3>No support tickets yet</h3>
      <p>If something isn’t working or you need help, create a ticket and the Parvis support team will get back to you.</p>
      <Button onClick={() => setShowCreate(true)}><Plus size={17} />Create Ticket</Button></div>}
    {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} />}
    {selectedTicket && <TicketDetailsModal id={selectedTicket} onClose={() => setSelectedTicket(null)} />}
  </section>;
}

function CreateTicketModal({ onClose }) {
  const client = useQueryClient();
  const [values, setValues] = useState({ subject: "", category: "general", message: "" });
  const mutation = useMutation({
    mutationFn: () => api("/support", { method: "POST", body: values }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["support", "me"] });
      onClose();
    },
  });
  const field = (key) => ({ value: values[key], onChange: (event) => { setValues({ ...values, [key]: event.target.value }); mutation.reset(); } });
  return <Modal title="Create a support ticket" onClose={onClose}>
    <p className="muted support-modal-intro">Tell us what happened and include the details needed to investigate.</p>
    <form className="form-stack" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
      <label>Subject<input required minLength={3} maxLength={160} placeholder="Briefly describe the issue" disabled={mutation.isPending} {...field("subject")} /></label>
      <label>Category<select disabled={mutation.isPending} {...field("category")}>{categories.map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></label>
      <label>Message<textarea required minLength={10} maxLength={5000} rows={6} placeholder="What happened, and what did you expect?" disabled={mutation.isPending} {...field("message")} /></label>
      <FormError error={mutation.error} />
      <div className="support-actions"><Button type="button" className="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" pending={mutation.isPending} pendingText="Creating…"><Send size={16} />Submit Ticket</Button></div>
    </form>
  </Modal>;
}

function TicketDetailsModal({ id, onClose }) {
  const client = useQueryClient();
  const [reply, setReply] = useState("");
  const query = useQuery({ queryKey: ["support", "me", id], queryFn: () => api(`/support/me/${id}`) });
  const mutation = useMutation({
    mutationFn: () => api(`/support/me/${id}/reply`, { method: "POST", body: { message: reply } }),
    onSuccess: async () => {
      setReply("");
      await Promise.all([
        client.invalidateQueries({ queryKey: ["support", "me", id] }),
        client.invalidateQueries({ queryKey: ["support", "me"], exact: true }),
      ]);
    },
  });
  return <Modal title={query.data?.request?.subject || "Ticket details"} onClose={onClose} wide>
    {query.isPending ? <div className="support-loading" role="status">Loading conversation…</div>
      : query.isError ? <ErrorState error={query.error} retry={query.refetch} />
      : <TicketConversation ticket={query.data.request} reply={reply} setReply={setReply} mutation={mutation} />}
  </Modal>;
}

function TicketConversation({ ticket, reply, setReply, mutation }) {
  const messages = [{ id: "initial", senderType: "USER", body: ticket.message, sentAt: ticket.createdAt }, ...(ticket.responses || [])];
  return <div className="ticket-detail">
    <div className="ticket-detail-meta"><StatusBadge status={ticket.status} /><span><strong>Reference</strong> #{ticket.id}</span>
      <span><strong>Category</strong> {label(ticket.category)}</span><span><strong>Last activity</strong> {when(ticket.updatedAt)}</span></div>
    <div className="conversation" aria-label="Ticket conversation">
      {messages.map((message) => <article key={message.id} className={`conversation-message ${message.senderType === "ADMIN" ? "from-support" : "from-user"}`}>
        <header><strong>{message.senderType === "ADMIN" ? "Parvis Support" : "You"}</strong><time dateTime={message.sentAt}>{when(message.sentAt)}</time></header>
        <p>{message.body}</p>
      </article>)}
    </div>
    {ticket.status === "closed" ? <div className="ticket-closed"><strong>This ticket is closed.</strong><span>Create a new ticket if you need more help.</span></div>
      : <form className="support-reply" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        <label>Reply<textarea required minLength={3} maxLength={10000} rows={4} value={reply} onChange={(event) => { setReply(event.target.value); mutation.reset(); }} placeholder="Add more information or reply to support…" disabled={mutation.isPending} /></label>
        <FormError error={mutation.error} /><Button type="submit" pending={mutation.isPending} pendingText="Sending…"><Send size={16} />Send Reply</Button>
      </form>}
  </div>;
}
