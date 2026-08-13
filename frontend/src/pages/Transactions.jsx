import React,{ useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const money = n => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  const load = () => {
    api.get("/transactions", { params: { search, type } }).then(res => setItems(res.data));
  };

  useEffect(() => { load(); }, [type]);

  const remove = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    await api.delete(`/transactions/${id}`);
    load();
  };

  return (
    <div>
      <div className="topbar">
        <div><h1>Transactions</h1><p>Manage your income and expenses.</p></div>
        <Link className="primary button-link" to="/add">+ Add Transaction</Link>
      </div>

      <section className="panel">
        <div className="filters">
          <input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load()} />
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button onClick={load}>Search</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Type</th><th>Amount</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.title}</strong><br/><small>{t.description}</small></td>
                  <td>{t.category_name || "Uncategorized"}</td>
                  <td>{new Date(t.transaction_date).toLocaleDateString("en-IN")}</td>
                  <td><span className={`badge ${t.type}`}>{t.type}</span></td>
                  <td className={t.type === "income" ? "positive" : "negative"}>{t.type === "income" ? "+" : "-"}{money(t.amount)}</td>
                  <td className="actions">
                    <Link to={`/edit/${t.id}`}>Edit</Link>
                    <button className="danger-link" onClick={() => remove(t.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && <div className="empty">No transactions found.</div>}
        </div>
      </section>
    </div>
  );
}
