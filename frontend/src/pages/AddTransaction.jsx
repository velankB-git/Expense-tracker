import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

const today = new Date().toISOString().slice(0, 10);

export default function AddTransaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category_id: "",
    description: "",
    transaction_date: today
  });
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/categories").then(res => setCategories(res.data));
    if (editing) {
      api.get("/transactions").then(res => {
        const item = res.data.find(x => String(x.id) === String(id));
        if (item) setForm({
          title: item.title,
          amount: item.amount,
          type: item.type,
          category_id: item.category_id || "",
          description: item.description || "",
          transaction_date: String(item.transaction_date).slice(0, 10)
        });
      });
    }
  }, [id, editing]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editing) await api.put(`/transactions/${id}`, form);
      else await api.post("/transactions", form);
      navigate("/transactions");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save transaction");
    }
  };

  return (
    <div>
      <div className="topbar">
        <div><h1>{editing ? "Edit Transaction" : "Add Transaction"}</h1><p>Enter your transaction details.</p></div>
      </div>

      <form className="panel form-card" onSubmit={submit}>
        {error && <div className="error">{error}</div>}

        <label>Type</label>
        <div className="type-buttons">
          <button type="button" className={form.type === "expense" ? "selected" : ""} onClick={() => setForm({...form, type:"expense"})}>Expense</button>
          <button type="button" className={form.type === "income" ? "selected income-selected" : ""} onClick={() => setForm({...form, type:"income"})}>Income</button>
        </div>

        <label>Title</label>
        <input value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="e.g. Grocery shopping" required />

        <div className="two-col">
          <div>
            <label>Amount (₹)</label>
            <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} required />
          </div>
          <div>
            <label>Date</label>
            <input type="date" value={form.transaction_date} onChange={e => setForm({...form, transaction_date:e.target.value})} required />
          </div>
        </div>

        <label>Category</label>
        <select value={form.category_id} onChange={e => setForm({...form, category_id:e.target.value})}>
          <option value="">Uncategorized</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label>Description</label>
        <textarea rows="4" value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Optional notes" />

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/transactions")}>Cancel</button>
          <button className="primary">{editing ? "Update Transaction" : "Save Transaction"}</button>
        </div>
      </form>
    </div>
  );
}
