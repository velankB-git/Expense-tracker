const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const { type, category, from, to, search } = req.query;

    const conditions = ["t.user_id = $1"];
    const values = [req.user.id];
    let n = 2;

    if (type && ["income", "expense"].includes(type)) {
      conditions.push(`t.type = $${n++}`);
      values.push(type);
    }

    if (category) {
      conditions.push(`t.category_id = $${n++}`);
      values.push(category);
    }

    if (from) {
      conditions.push(`t.transaction_date >= $${n++}`);
      values.push(from);
    }

    if (to) {
      conditions.push(`t.transaction_date <= $${n++}`);
      values.push(to);
    }

    if (search) {
      conditions.push(`(LOWER(t.title) LIKE $${n} OR LOWER(t.description) LIKE $${n})`);
      values.push(`%${String(search).toLowerCase()}%`);
      n++;
    }

    const result = await pool.query(
      `SELECT
         t.id, t.title, t.amount, t.type, t.description,
         t.transaction_date, t.category_id,
         c.name AS category_name
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY t.transaction_date DESC, t.id DESC`,
      values
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      amount,
      type,
      category_id,
      description = "",
      transaction_date
    } = req.body;

    if (!title || !amount || !type || !transaction_date) {
      return res.status(400).json({
        message: "Title, amount, type and date are required"
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    const categoryCheck = category_id
      ? await pool.query(
          "SELECT id FROM categories WHERE id = $1 AND user_id = $2",
          [category_id, req.user.id]
        )
      : { rowCount: 1 };

    if (category_id && !categoryCheck.rowCount) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const result = await pool.query(
      `INSERT INTO transactions
       (user_id, category_id, title, amount, type, description, transaction_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        req.user.id,
        category_id || null,
        title.trim(),
        Number(amount),
        type,
        description,
        transaction_date
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const {
      title,
      amount,
      type,
      category_id,
      description = "",
      transaction_date
    } = req.body;

    const result = await pool.query(
      `UPDATE transactions
       SET title=$1, amount=$2, type=$3, category_id=$4,
           description=$5, transaction_date=$6
       WHERE id=$7 AND user_id=$8
       RETURNING *`,
      [
        title.trim(),
        Number(amount),
        type,
        category_id || null,
        description,
        transaction_date,
        req.params.id,
        req.user.id
      ]
    );

    if (!result.rowCount) return res.status(404).json({ message: "Transaction not found" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  const result = await pool.query(
    "DELETE FROM transactions WHERE id=$1 AND user_id=$2 RETURNING id",
    [req.params.id, req.user.id]
  );

  if (!result.rowCount) return res.status(404).json({ message: "Transaction not found" });

  res.json({ message: "Transaction deleted" });
});

module.exports = router;
