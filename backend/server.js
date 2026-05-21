const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());

// Database Pool
const pool = mysql.createPool({
    host: "fitness-db.cd9ny2wbkgd9.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "moataz2026",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
});

// Initialize Database
async function initDB() {
    try {
        await pool.query("CREATE DATABASE IF NOT EXISTS fitness_db");
        await pool.query("USE fitness_db");

        console.log("✅ Connected to fitness_db");

        // Create Tables with safe types
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                password VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS workouts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                workout VARCHAR(200),
                duration INT,
                calories INT,
                date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS water_intake (
                id INT AUTO_INCREMENT PRIMARY KEY,
                amount INT,
                date DATE DEFAULT (CURRENT_DATE),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("✅ All tables are ready");
    } catch (e) {
        console.error("❌ DB Init Error:", e.message);
    }
}

initDB();

// ====================== ROUTES ======================

app.post("/workouts", async (req, res) => {
    try {
        console.log("📥 Workout Received:", req.body);

        const { workout, duration, calories, date } = req.body;

        if (!workout || !duration || !calories || !date) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const [result] = await pool.execute(
            "INSERT INTO workouts (workout, duration, calories, date) VALUES (?, ?, ?, ?)",
            [workout, parseInt(duration), parseInt(calories), date]
        );

        console.log("✅ Workout Saved Successfully");
        res.json({ message: "Workout Added", id: result.insertId });
    } catch (err) {
        console.error("❌ Workout Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/water", async (req, res) => {
    try {
        console.log("📥 Water Received:", req.body);

        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }

        const [result] = await pool.execute(
            "INSERT INTO water_intake (amount) VALUES (?)",
            [parseInt(amount)]
        );

        console.log("✅ Water Saved Successfully");
        res.json({ message: "Water Added" });
    } catch (err) {
        console.error("❌ Water Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Other routes (GETs, register, login, etc.)
app.get("/workouts", async (req, res) => {
    const [rows] = await pool.execute("SELECT * FROM workouts ORDER BY id DESC");
    res.json(rows);
});

app.get("/water", async (req, res) => {
    const [result] = await pool.execute("SELECT SUM(amount) AS total FROM water_intake");
    res.json(result[0] || { total: 0 });
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        await pool.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, password]
        );
        res.json({ message: "User Registered" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.execute(
            "SELECT * FROM users WHERE email = ? AND password = ?", 
            [email, password]
        );
        res.json(rows.length > 0 ? rows[0] : { message: "Invalid" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
});