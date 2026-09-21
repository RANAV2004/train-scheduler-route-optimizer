import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="navbar">
      <div className="brand">
        <span className="logo" role="img" aria-label="Train Scheduler logo"></span>
        Train Scheduler &amp; Route Optimizer
      </div>
      <nav>
        {user?.role === "admin" ? (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/optimizer">Route Optimizer</Link>
          </>
        ) : (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/trains">Trains</Link>
            <Link to="/book">Book</Link>
            <Link to="/tickets">My Tickets</Link>
          </>
        )}
        <span className="pill">
          {user?.username} · {user?.role}
        </span>
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  );
}