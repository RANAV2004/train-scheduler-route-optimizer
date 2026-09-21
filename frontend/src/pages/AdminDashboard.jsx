import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { downloadFile } from "../api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get("/admin/dashboard").then((r) => setStats(r.data)).catch(() => {});
    api.get("/admin/tickets").then((r) => setTickets(r.data)).catch(() => {});
  }, []);

  return (
    <div className="container watermark">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-sub">Monitor users, bookings, and optimize train routes.</p>

      <div className="grid cols-3" style={{ marginBottom: 22 }}>
        <div className="card stat">
          <div className="num">{stats?.total_users ?? "—"}</div>
          <div className="label">Registered Users</div>
        </div>
        <div className="card stat">
          <div className="num">{stats?.total_trains ?? "—"}</div>
          <div className="label">Trains</div>
        </div>
        <div className="card stat">
          <div className="num">{stats?.total_tickets ?? "—"}</div>
          <div className="label">Tickets Booked</div>
        </div>
      </div>

      <div className="grid cols-2" style={{ marginBottom: 22 }}>
        <div className="card">
          <h3>Manage Registered Users</h3>
          <p style={{ color: "#6b7280", fontSize: 14 }}>Review sign-ups with timestamps.</p>
          <Link className="btn" to="/admin/users">View users</Link>
        </div>
        <div className="card">
          <h3>Optimize Train Route</h3>
          <p style={{ color: "#6b7280", fontSize: 14 }}>Run Dijkstra and view optimization charts.</p>
          <Link className="btn accent" to="/admin/optimizer">Open optimizer</Link>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Recent Bookings (all users)</h3>
          <button
            className="btn ghost small"
            onClick={() => downloadFile("/admin/tickets/export.csv", "all_bookings.csv")}
          >
            ⬇ Export all bookings (CSV)
          </button>
        </div>
        <table style={{ marginTop: 12 }}>
          <thead>
            <tr><th>ID</th><th>User</th><th>Train</th><th>Route</th><th>Date</th><th>Class</th><th>Status</th></tr>
          </thead>
          <tbody>
            {tickets.slice(0, 10).map((t) => (
              <tr key={t.ticket_id}>
                <td>#{t.ticket_id}</td>
                <td>{t.user_id}</td>
                <td>{t.train_number}</td>
                <td>{t.source} → {t.destination}</td>
                <td>{t.booking_date}</td>
                <td>{t.class_type}</td>
                <td>
                  <span className={`badge ${t.status === "CONFIRMED" ? "confirmed" : "cancelled"}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: "center", color: "#6b7280" }}>No bookings yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}