const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = require("./db");
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const transactionRoutes = require("./routes/transactions");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Expense Tracker API is running" });
});

app.get("/api/health", async(req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ server: "ok", database: "connected" });
    } catch {
        res.status(500).json({ server: "ok", database: "disconnected" });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Unexpected server error" });
});

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured");
}

async function startServer() {
    try {
        const schemaPath = path.join(__dirname, "../../database/schema.sql");
        const schema = fs.readFileSync(schemaPath, "utf8");
        await pool.query(schema);
        await pool.query("SELECT 1");
        console.log("PostgreSQL connected successfully");
    } catch (error) {
        console.error("Database startup failed:", error.message);
        process.exitCode = 1;
        return;
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();