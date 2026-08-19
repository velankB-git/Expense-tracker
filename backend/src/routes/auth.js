const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { seedDefaultCategories } = require("../utils");
const auth = require("../middleware/auth");

router.post("/register", async(req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existing = await pool.query(
            "SELECT id FROM users WHERE email = $1", [normalizedEmail]
        );

        if (existing.rowCount) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`, [name.trim(), normalizedEmail, hashed]
        );

        await seedDefaultCategories(result.rows[0].id);

        res.status(201).json({
            message: "Registration successful",
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        if (error.code === "23505") {
            return res.status(409).json({ message: "Email already registered" });
        }
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const result = await pool.query(
            "SELECT id, name, email, password FROM users WHERE email = $1", [email.trim().toLowerCase()]
        );

        if (!result.rowCount) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/me", auth, async(req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email FROM users WHERE id = $1", [req.user.id]
        );

        if (!result.rowCount) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("AUTH ME ERROR:", error);
        res.status(500).json({ message: "Unable to load user profile" });
    }
});

module.exports = router;