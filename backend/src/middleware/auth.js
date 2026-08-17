const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../db");
const auth = require("../middleware/auth");
const { seedDefaultCategories } = require("../utils");

// REGISTER
router.post("/register", async(req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existing = await pool.query(
            "SELECT id FROM users WHERE email = $1", [normalizedEmail]
        );

        if (existing.rowCount > 0) {
            return res.status(409).json({
                message: "Email already registered",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email
      `, [
                name.trim(),
                normalizedEmail,
                hashedPassword,
            ]
        );

        const user = result.rows[0];

        await seedDefaultCategories(user.id);

        return res.status(201).json({
            message: "Registration successful",
            user,
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
});

// LOGIN
router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        console.log("LOGIN REQUEST:", email);

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query(
            `
      SELECT id, name, email, password
      FROM users
      WHERE email = $1
      `, [normalizedEmail]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const user = result.rows[0];

        const passwordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing");

            return res.status(500).json({
                message: "JWT secret is not configured",
            });
        }

        const token = jwt.sign({
                id: user.id,
                name: user.name,
                email: user.email,
            },
            process.env.JWT_SECRET, {
                expiresIn: "7d",
            }
        );

        console.log("LOGIN SUCCESS:", user.email);

        return res.status(200).json({
            message: "Login successful",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
});

// CURRENT USER
router.get("/me", auth, async(req, res) => {
    try {
        const result = await pool.query(
            `
      SELECT id, name, email, created_at
      FROM users
      WHERE id = $1
      `, [req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("ME ERROR:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
});

module.exports = router;