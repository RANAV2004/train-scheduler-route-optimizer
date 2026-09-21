import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";

const CLASSES = ["Sleeper", "AC3", "AC2", "AC1"];

export default function BookTicket() {
  const location = useLocation();
  const navigate = useNavigate();
  const preselected = location.state?.train;

  const [trains, setTrains] = useState([]);
  const [form, setForm] = useState({
    train_number: preselected?.train_number || "",
    source: preselected?.source || "",
    destination: preselected?.destination || "",
    booking_date: "",
    class_type: "Sleeper",
  });
  const [message, setMessage] = useState(null); 
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/user/trains").then((r) => setTrains(r.data)).catch(() => {});
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  
  function onTrainChange(num) {
    const t = trains.find((x) => String(x.train_number) === String(num));
    setForm((f) => ({
      ...f,
      train_number: num,
      source: t ? t.source : f.source,
      destination: t ? t.destination : f.destination,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      await api.post("/user/tickets", {
        ...form,
        train_number: Number(form.train_number),
      });
      setMessage({ type: "success", text: "Ticket booked successfully!" });
      setTimeout(() => navigate("/tickets"), 900);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Booking failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">Book Ticket</h1>
      <p className="page-sub">Select a train, travel date, and class.</p>

      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        {message && <div className={`msg ${message.type}`}>{message.text}</div>}

        <div className="form-row">
          <label>Train</label>
          <select value={form.train_number} onChange={(e) => onTrainChange(e.target.value)} required>
            <option value="">— Select a train —</option>
            {trains.map((t) => (
              <option key={t.train_number} value={t.train_number} disabled={t.available_seats <= 0}>
                {t.train_number} · {t.train_name} ({t.source} → {t.destination}) · {t.available_seats} seats
              </option>
            ))}
          </select>
        </div>

        <div className="grid cols-2">
          <div className="form-row">
            <label>Source</label>
            <input value={form.source} onChange={(e) => update("source", e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Destination</label>
            <input value={form.destination} onChange={(e) => update("destination", e.target.value)} required />
          </div>
        </div>

        <div className="grid cols-2">
          <div className="form-row">
            <label>Travel Date</label>
            <input type="date" value={form.booking_date} onChange={(e) => update("booking_date", e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Class</label>
            <select value={form.class_type} onChange={(e) => update("class_type", e.target.value)}>
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button className="btn accent" disabled={busy}>
          {busy ? "Booking…" : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}
