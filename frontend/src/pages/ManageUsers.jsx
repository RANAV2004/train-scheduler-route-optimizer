import { useEffect, useState } from "react";
import api from "../api";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/admin/users").then((r) => setUsers(r.data)).catch(() => {});
  }, []);

  return (
    <div className="container">
      <h1 className="page-title">Registered Users</h1>
      <p className="page-sub">
        All accounts with registration timestamps (Use Case 7). Passwords are
        shown as their <strong>bcrypt hash</strong> — plaintext is never stored.
      </p>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>User ID</th><th>Username</th><th>Email</th><th>Role</th>
              <th>Verified</th><th>Password (hashed)</th><th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === "admin" ? "cancelled" : "confirmed"}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.is_verified ? "confirmed" : "cancelled"}`}>
                    {u.is_verified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="mono" title={u.password}>
                  {u.password ? u.password.slice(0, 22) + "…" : "—"}
                </td>
                <td>{new Date(u.registration_time).toLocaleString()}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: "center", color: "#6b7280" }}>No users.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}