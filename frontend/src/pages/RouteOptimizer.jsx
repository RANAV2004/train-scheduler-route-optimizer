import { useEffect, useState } from "react";
import api from "../api";
import {
 ScatterChart, Scatter, LineChart, Line,
   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";


const INK = "#111827";      
const GRID = "#d1d5db";     
const AXIS = "#374151";     
const INK_SOFT = "#9ca3af"; 

const AVG_SPEED_KMPH = 65;  

function routeSeries(result) {
  if (!result || !result.path.length) return [];
  const series = [{ stop: result.path[0], cum_distance: 0, cum_time: 0 }];
  let cum = 0;
  result.hops.forEach((h) => {
    cum += h.distance;
    series.push({
      stop: h.to,
      cum_distance: Math.round(cum),
      cum_time: Math.round((cum / AVG_SPEED_KMPH) * 100) / 100,
    });
  });
  return series;
}

export default function RouteOptimizer() {
  const [cities, setCities] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState(null);
  const [chart, setChart] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/cities").then((r) => {
      setCities(r.data.cities);
      if (r.data.cities.length) {
        setSource(r.data.cities[0]);
        setDestination(r.data.cities[r.data.cities.length - 1]);
      }
    }).catch(() => {});
  }, []);

  
  useEffect(() => {
    if (!source) return;
    api.get("/admin/optimization-chart", { params: { source } })
      .then((r) => setChart(r.data.points))
      .catch(() => setChart([]));
  }, [source]);

  async function optimize(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const r = await api.post("/admin/shortest-route", { source, destination });
      if (!r.data.path.length) {
        setError("No route found between the selected cities.");
      } else {
        setResult(r.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Optimization failed");
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">Route Optimizer</h1>
      <p className="page-sub">
        Dijkstra shortest-path over the city network, with black-on-white
        distance &amp; time charts.
      </p>

      <form className="card" onSubmit={optimize} style={{ marginBottom: 18 }}>
        <div className="grid cols-3">
          <div className="form-row">
            <label>Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Destination</label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)}>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>&nbsp;</label>
            <button className="btn accent">Optimize Route</button>
          </div>
        </div>
      </form>

      {error && <div className="msg error">{error}</div>}

      {result && (
        <div className="route-viz" style={{ marginBottom: 18 }}>
          <h3>Optimized Route</h3>
          <div className="route-path">
            {result.path.map((city, i) => (
              <span key={i}>
                {city}
                {i < result.path.length - 1 && <span className="arrow">→</span>}
              </span>
            ))}
          </div>
          <div className="route-metrics">
            <div className="m">
              <div className="v">{result.total_distance} km</div>
              <div className="k">Total Distance</div>
            </div>
            <div className="m">
              <div className="v">{result.estimated_time} h</div>
              <div className="k">Estimated Time</div>
            </div>
            <div className="m">
              <div className="v">{result.hops.length}</div>
              <div className="k">Hops</div>
            </div>
          </div>

          
          <h3 style={{ marginTop: 8 }}>Distance &amp; Time Along the Route</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={routeSeries(result)} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid stroke={GRID} />
              <XAxis dataKey="stop" stroke={AXIS} tick={{ fill: AXIS, fontSize: 12 }} />
              <YAxis yAxisId="d" stroke={AXIS} tick={{ fill: AXIS, fontSize: 11 }} />
              <YAxis yAxisId="t" orientation="right" stroke={INK_SOFT} tick={{ fill: INK_SOFT, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#ffffff", border: `1px solid ${AXIS}`, color: INK }} />
              <Legend wrapperStyle={{ color: INK }} />
              <Line yAxisId="d" type="monotone" dataKey="cum_distance" name="Cumulative distance (km)"
                    stroke={INK} strokeWidth={2} dot={{ fill: INK, r: 4 }} />
              <Line yAxisId="t" type="monotone" dataKey="cum_time" name="Cumulative time (h)"
                    stroke={INK_SOFT} strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid cols-2">
        
        <div className="route-viz">
          <h3>Distance vs Time — Scatter (from {source})</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid stroke={GRID} />
              <XAxis
                type="number" dataKey="distance" name="Distance" unit="km"
                stroke={AXIS} tick={{ fill: AXIS, fontSize: 11 }}
                label={{ value: "Distance (km)", fill: AXIS, position: "insideBottom", offset: -8 }}
              />
              <YAxis
                type="number" dataKey="time" name="Time" unit="h"
                stroke={AXIS} tick={{ fill: AXIS, fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ background: "#ffffff", border: `1px solid ${AXIS}`, color: INK }}
                cursor={{ stroke: INK }}
              />
              <Scatter name="Cities" data={chart} fill={INK} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        
        <div className="route-viz">
          <h3>Distance to Each City — Line (from {source})</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chart} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid stroke={GRID} />
              <XAxis dataKey="city" stroke={AXIS} tick={{ fill: AXIS, fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis stroke={AXIS} tick={{ fill: AXIS, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#ffffff", border: `1px solid ${AXIS}`, color: INK }} />
              <Legend wrapperStyle={{ color: INK }} />
              <Line type="monotone" dataKey="distance" name="Distance (km)" stroke={INK} strokeWidth={2} dot={{ fill: INK, r: 3 }} />
              <Line type="monotone" dataKey="time" name="Time (h)" stroke={INK_SOFT} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}