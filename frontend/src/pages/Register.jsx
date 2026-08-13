import React,{ useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create Account</h1>
        <p>Start tracking your income and expenses</p>

        {error && <div className="error">{error}</div>}

        <label>Name</label>
        <input value={form.name}
          onChange={e => setForm({...form, name: e.target.value})} required />

        <label>Email</label>
        <input type="email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} required />

        <label>Password</label>
        <input type="password" minLength="6" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})} required />

        <button className="primary" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="center">Already registered? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
