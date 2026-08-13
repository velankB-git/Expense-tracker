import React,{ useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import api from "../api";

const money = n => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function Dashboard() {
  const [data, setData] = useState(null);

  const load = () => api.get("/dashboard").then(res => setData(res.data));

  useEffect(() => { load(); }, []);

  if (!data) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p>Here's your financial overview.</p>
        </div>
        <Link className="primary button-link" to="/add">+ Add Transaction</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card balance"><span>Balance</span><strong>{money(data.totals.balance)}</strong></div>
        <div className="stat-card income"><span>Total Income</span><strong>{money(data.totals.income)}</strong></div>
        <div className="stat-card expense"><span>Total Expense</span><strong>{money(data.totals.expense)}</strong></div>
      </div>

      <div className="charts-grid">
        <section className="panel">
          <h2>Monthly Income vs Expense</h2>
          <div className="chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" name="Income" />
                <Bar dataKey="expense" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <h2>Expense by Category</h2>
          <div className="chart">
            {data.categoryExpenses.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.categoryExpenses} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {data.categoryExpenses.map((_, i) => <Cell key={i} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="empty">No expense data yet.</div>}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Recent Transactions</h2>
          <Link to="/transactions">View all</Link>
        </div>

        {data.recent.length === 0 ? (
          <div className="empty">No transactions yet. Add your first transaction.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Type</th><th>Amount</th></tr></thead>
              <tbody>
                {data.recent.map(t => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{t.category_name || "Uncategorized"}</td>
                    <td>{new Date(t.transaction_date).toLocaleDateString("en-IN")}</td>
                    <td><span className={`badge ${t.type}`}>{t.type}</span></td>
                    <td className={t.type === "income" ? "positive" : "negative"}>
                      {t.type === "income" ? "+" : "-"}{money(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
