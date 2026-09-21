import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../auth.jsx";

export default function UserDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    api.get("/user/tickets").then((r) => setTickets(r.data)).catch(() => {});
    api.get("/user/trains").then((r) => setTrains(r.data)).catch(() => {});
  }, []);

  const confirmed = tickets.filter((t) => t.status === "CONFIRMED").length;

  return (
    <div className="container watermark">
      <h1 className="page-title">Welcome back, {user?.username}</h1>
      <p className="page-sub">Book tickets, view running trains, and manage your journeys.</p>

      <div className="grid cols-3" style={{ marginBottom: 22 }}>
        <div className="card stat">
          <div className="num">{trains.length}</div>
          <div className="label">Running Trains</div>
        </div>
        <div className="card stat">
          <div className="num">{confirmed}</div>
          <div className="label">Confirmed Tickets</div>
        </div>
        <div className="card stat">
          <div className="num">{tickets.length}</div>
          <div className="label">Total Bookings</div>
        </div>
      </div>

      <div className="grid cols-3">
        <div className="card">
          <h3>Book a Ticket</h3>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Select source, destination, date, and class.
          </p>
          <Link className="btn" to="/book">Book now</Link>
        </div>
        <div className="card">
          <h3>View Running Trains</h3>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Browse schedules and seat availability.
          </p>
          <Link className="btn ghost" to="/trains">View trains</Link>
        </div>
        <div className="card">
          <h3>My Tickets</h3>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Reschedule or cancel existing bookings.
          </p>
          <Link className="btn ghost" to="/tickets">My tickets</Link>
        </div>
      </div>
    </div>
  );
}