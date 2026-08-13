import React, { useEffect, useState } from "react";
import api from "../api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const load = () => api.get("/categories").then(res => setCategories(res.data));

  useEffect(() => { load(); }, []);

  const add = async e => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/categories", { name });
      setName("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add category");
    }
  };

  const remove = async id => {
    if (!confirm("Delete this category? Existing transactions will become Uncategorized.")) return;
    await api.delete(`/categories/${id}`);
    load();
  };

  return (
    <div>
      <div className="topbar">
        <div><h1>Categories</h1><p>Organize your spending.</p></div>
      </div>

      <section className="panel">
        <h2>Add Category</h2>
        {error && <div className="error">{error}</div>}
        <form className="inline-form" onSubmit={add}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" required />
          <button className="primary">Add</button>
        </form>
      </section>

      <section className="panel">
        <h2>Your Categories</h2>
        <div className="category-grid">
          {categories.map(c => (
            <div className="category-item" key={c.id}>
              <span>🏷️ {c.name}</span>
              <button className="danger-link" onClick={() => remove(c.id)}>Delete</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
