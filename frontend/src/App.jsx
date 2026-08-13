import React ,{ useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import api from "./api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import AddTransaction from "./pages/AddTransaction";
import Categories from "./pages/Categories";

function PrivateLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/auth/me")
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">💰 Expense Tracker</div>
        <div className="user-box">
          <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
        </div>

        <nav>
          <Link className={location.pathname === "/dashboard" ? "active" : ""} to="/dashboard">📊 Dashboard</Link>
          <Link className={location.pathname === "/transactions" ? "active" : ""} to="/transactions">💳 Transactions</Link>
          <Link className={location.pathname === "/add" ? "active" : ""} to="/add">➕ Add Transaction</Link>
          <Link className={location.pathname === "/categories" ? "active" : ""} to="/categories">🏷️ Categories</Link>
        </nav>

        <button className="logout" onClick={logout}>Logout</button>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/edit/:id" element={<AddTransaction />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/*" element={token ? <PrivateLayout /> : <Navigate to="/login" />} />
    </Routes>
  );
}
