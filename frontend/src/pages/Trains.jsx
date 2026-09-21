import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Trains() {
  const [trains, setTrains] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();

  function load(params = {}) {
    api.get("/user/trains", { params }).then((r) => setTrains(r.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  function search(e) {
    e.preventDefault();
    load({ source: source || undefined, destination: destination || undefined });
  }

  return (
    <div className="container">
      <h1 className="page-title">Running Trains</h1>
      <p className="page-sub">Available trains and live seat counts.</p>

      <form className="card" onSubmit={search} style={{ marginBottom: 18 }}>
        <div className="grid cols-3">
          <div className="form-row">
            <label>Source</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Delhi" />
          </div>
          <div className="form-row">
            <label>Destination</label>
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Mumbai" />
          </div>
          <div className="form-row" style={{ justifyContent: "flex-end" }}>
            <label>&nbsp;</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn">Search</button>
              <button type="button" className="btn ghost" onClick={() => { setSource(""); setDestination(""); load(); }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Train No.</th><th>Name</th><th>From</th><th>To</th>
              <th>Dep</th><th>Arr</th><th>Seats</th><th>Fare</th><th></th>
            </tr>
          </thead>
          <tbody>
            {trains.map((t) => (
              <tr key={t.train_number}>
                <td>{t.train_number}</td>
                <td>{t.train_name}</td>
                <td>{t.source}</td>
                <td>{t.destination}</td>
                <td>{t.departure}</td>
                <td>{t.arrival}</td>
                <td>{t.available_seats}/{t.total_seats}</td>
                <td>₹{t.fare}</td>
                <td>
                  <button
                    className="btn small"
                    disabled={t.available_seats <= 0}
                    onClick={() => navigate("/book", { state: { train: t } })}
                  >
                    Book
                  </button>
                </td>
              </tr>
            ))}
            {trains.length === 0 && (
              <tr><td colSpan="9" style={{ textAlign: "center", color: "#6b7280" }}>No trains found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
