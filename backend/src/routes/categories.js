const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const result = await pool.query(
    "SELECT id, name FROM categories WHERE user_id = $1 ORDER BY name",
    [req.user.id]
  );
  res.json(result.rows);
});

router.post("/", auth, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();

    if (!name) return res.status(400).json({ message: "Category name is required" });

    const result = await pool.query(
      `INSERT INTO categories (name, user_id)
       VALUES ($1, $2)
       RETURNING id, name`,
      [name, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  const result = await pool.query(
    "DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id",
    [req.params.id, req.user.id]
  );

  if (!result.rowCount) return res.status(404).json({ message: "Category not found" });

  res.json({ message: "Category deleted" });
});

module.exports = router;
