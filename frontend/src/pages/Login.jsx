import React,{ useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>💰 Expense Tracker</h1>
        <p>Sign in to manage your money</p>

        {error && <div className="error">{error}</div>}

        <label>Email</label>
        <input type="email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} required />

        <label>Password</label>
        <input type="password" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})} required />

        <button className="primary" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="center">Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}
