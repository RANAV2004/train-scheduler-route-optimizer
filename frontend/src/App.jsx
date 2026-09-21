import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import Trains from "./pages/Trains.jsx";
import BookTicket from "./pages/BookTicket.jsx";
import MyTickets from "./pages/MyTickets.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManageUsers from "./pages/ManageUsers.jsx";
import RouteOptimizer from "./pages/RouteOptimizer.jsx";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyOtp />} />
      <Route path="/forgot" element={<ForgotPassword />} />

      {/* User area */}
      <Route path="/" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/trains" element={<ProtectedRoute role="user"><Trains /></ProtectedRoute>} />
      <Route path="/book" element={<ProtectedRoute role="user"><BookTicket /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute role="user"><MyTickets /></ProtectedRoute>} />

      {/* Admin area */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/optimizer" element={<ProtectedRoute role="admin"><RouteOptimizer /></ProtectedRoute>} />

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={user ? (user.role === "admin" ? "/admin" : "/") : "/login"} replace />}
      />
    </Routes>
  );
}