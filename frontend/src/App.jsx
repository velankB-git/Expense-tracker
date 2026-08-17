import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // No token → login
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const getUser = async () => {
      try {
        const response = await api.get("/auth/me");

        console.log("AUTH ME RESPONSE:", response.data);

        setUser(response.data);
      } catch (error) {
        console.error("AUTH ME ERROR:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // While checking token
  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  // User could not be loaded
  if (!user) {
    return null;
  }

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          💰 Expense Tracker
        </div>

        <div className="user-box">

          <div className="avatar">
            {user.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div>
            <strong>{user.name}</strong>

            <small>
              {user.email}
            </small>
          </div>

        </div>

        {/* NAVIGATION */}
        <nav>

          <Link
            className={
              location.pathname === "/dashboard"
                ? "active"
                : ""
            }
            to="/dashboard"
          >
            📊 Dashboard
          </Link>

          <Link
            className={
              location.pathname === "/transactions"
                ? "active"
                : ""
            }
            to="/transactions"
          >
            💳 Transactions
          </Link>

          <Link
            className={
              location.pathname === "/add"
                ? "active"
                : ""
            }
            to="/add"
          >
            ➕ Add Transaction
          </Link>

          <Link
            className={
              location.pathname === "/categories"
                ? "active"
                : ""
            }
            to="/categories"
          >
            🏷️ Categories
          </Link>

        </nav>

        {/* LOGOUT */}
        <button
          className="logout"
          onClick={logout}
        >
          Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        <Routes>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/transactions"
            element={<Transactions />}
          />

          <Route
            path="/add"
            element={<AddTransaction />}
          />

          <Route
            path="/edit/:id"
            element={<AddTransaction />}
          />

          <Route
            path="/categories"
            element={<Categories />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>

      </main>

    </div>
  );
}

export default function App() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* REGISTER */}
      <Route
        path="/register"
        element={<Register />}
      />

      {/* EVERYTHING ELSE */}
      <Route
        path="/*"
        element={<PrivateLayout />}
      />

    </Routes>
  );
}