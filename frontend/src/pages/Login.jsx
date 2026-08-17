import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending login request...");

      const response = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      console.log("Login response:", response.data);

      const token = response.data?.token;

      if (!token) {
        setError("Login successful, but token was not received.");
        return;
      }

      // Save JWT token
      localStorage.setItem("token", token);

      // Optional: save user details
      if (response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      console.log(
        "Token saved:",
        localStorage.getItem("token")
      );

      // Go to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Data:", err.response.data);

        setError(
          err.response.data?.message ||
            `Login failed (${err.response.status})`
        );
      } else if (err.request) {
        setError(
          "Cannot connect to server. Make sure the backend is running on port 5000."
        );
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>💰 Expense Tracker</h1>

        <p>Sign in to manage your money</p>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <label htmlFor="email">Email</label>

        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>

        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          className="primary"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="center">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}