import { useEffect, useState } from "react";
import api, { downloadFile } from "../api";

const CLASSES = ["Sleeper", "AC3", "AC2", "AC1"];

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState(null);
  const [editing, setEditing] = useState(null); 
  const [reForm, setReForm] = useState({ booking_date: "", class_type: "Sleeper" });

  function load() {
    api.get("/user/tickets").then((r) => setTickets(r.data)).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  function startReschedule(t) {
    setEditing(t.ticket_id);
    setReForm({ booking_date: t.booking_date, class_type: t.class_type });
    setMessage(null);
  }

  async function submitReschedule(id) {
    try {
      await api.put(`/user/tickets/${id}/reschedule`, reForm);
      setMessage({ type: "success", text: `Ticket #${id} rescheduled.` });
      setEditing(null);
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Reschedule failed" });
    }
  }

  async function cancel(id) {
    if (!window.confirm("Cancel this ticket? The seat will be released.")) return;
    try {
      await api.delete(`/user/tickets/${id}`);
      setMessage({ type: "success", text: `Ticket #${id} cancelled.` });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Cancel failed" });
    }
  }

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">My Tickets</h1>
          <p className="page-sub">Your booking history — reschedule or cancel any confirmed ticket.</p>
        </div>
        <button
          className="btn ghost small"
          onClick={() => downloadFile("/user/tickets/export.csv", "my_bookings.csv")}
        >
          ⬇ Download CSV
        </button>
      </div>

      {message && <div className={`msg ${message.type}`}>{message.text}</div>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Train</th><th>Route</th><th>Date</th>
              <th>Class</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.ticket_id}>
                <td>#{t.ticket_id}</td>
                <td>{t.train_number}</td>
                <td>{t.source} → {t.destination}</td>
                <td>
                  {editing === t.ticket_id ? (
                    <input
                      type="date"
                      value={reForm.booking_date}
                      onChange={(e) => setReForm((f) => ({ ...f, booking_date: e.target.value }))}
                    />
                  ) : t.booking_date}
                </td>
                <td>
                  {editing === t.ticket_id ? (
                    <select
                      value={reForm.class_type}
                      onChange={(e) => setReForm((f) => ({ ...f, class_type: e.target.value }))}
                    >
                      {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : t.class_type}
                </td>
                <td>
                  <span className={`badge ${t.status === "CONFIRMED" ? "confirmed" : "cancelled"}`}>
                    {t.status}
                  </span>
                </td>
                <td>
                  {editing === t.ticket_id ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn small" onClick={() => submitReschedule(t.ticket_id)}>Save</button>
                      <button className="btn small ghost" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn small ghost"
                        disabled={t.status === "CANCELLED"}
                        onClick={() => startReschedule(t)}
                      >
                        Reschedule
                      </button>
                      <button
                        className="btn small danger"
                        disabled={t.status === "CANCELLED"}
                        onClick={() => cancel(t.ticket_id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: "center", color: "#6b7280" }}>No tickets yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}