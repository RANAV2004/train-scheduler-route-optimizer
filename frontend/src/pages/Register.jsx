import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await register(form);
      
      navigate("/verify", {
        state: { email: res.data.email, devOtp: res.data.dev_otp },
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        <p className="sub">Sign up as a passenger or an admin</p>

        {error && <div className="msg error">{error}</div>}

        <div className="form-row">
          <label>Username</label>
          <input value={form.username} onChange={(e) => update("username", e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <label>Role</label>
          <select value={form.role} onChange={(e) => update("role", e.target.value)}>
            <option value="user">Passenger (User)</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button className="btn" style={{ width: "100%" }} disabled={busy}>
          {busy ? "Creating…" : "Sign Up"}
        </button>

        <div className="switch">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}