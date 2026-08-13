const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const totals = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) AS income,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) AS expense
       FROM transactions
       WHERE user_id=$1`,
      [req.user.id]
    );

    const category = await pool.query(
      `SELECT c.name, COALESCE(SUM(t.amount),0) AS amount
       FROM transactions t
       LEFT JOIN categories c ON c.id=t.category_id
       WHERE t.user_id=$1 AND t.type='expense'
       GROUP BY c.name
       ORDER BY amount DESC`,
      [req.user.id]
    );

    const monthly = await pool.query(
      `SELECT
        TO_CHAR(DATE_TRUNC('month', transaction_date), 'Mon YYYY') AS month,
        DATE_TRUNC('month', transaction_date) AS month_date,
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) AS income,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) AS expense
       FROM transactions
       WHERE user_id=$1
         AND transaction_date >= CURRENT_DATE - INTERVAL '11 months'
       GROUP BY DATE_TRUNC('month', transaction_date)
       ORDER BY month_date`,
      [req.user.id]
    );

    const recent = await pool.query(
      `SELECT t.*, c.name AS category_name
       FROM transactions t
       LEFT JOIN categories c ON c.id=t.category_id
       WHERE t.user_id=$1
       ORDER BY t.transaction_date DESC, t.id DESC
       LIMIT 5`,
      [req.user.id]
    );

    const income = Number(totals.rows[0].income);
    const expense = Number(totals.rows[0].expense);

    res.json({
      totals: { income, expense, balance: income - expense },
      categoryExpenses: category.rows.map(x => ({
        name: x.name || "Uncategorized",
        amount: Number(x.amount)
      })),
      monthly: monthly.rows.map(x => ({
        month: x.month,
        income: Number(x.income),
        expense: Number(x.expense)
      })),
      recent: recent.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
