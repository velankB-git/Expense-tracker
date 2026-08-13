const pool = require("./db");

async function seedDefaultCategories(userId) {
  const defaults = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Education",
    "Health",
    "Other"
  ];

  for (const name of defaults) {
    await pool.query(
      `INSERT INTO categories (name, user_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, name) DO NOTHING`,
      [name, userId]
    );
  }
}

module.exports = { seedDefaultCategories };
