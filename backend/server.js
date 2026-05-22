const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());

// ================= DATABASE CONNECTION =================

const pool = mysql.createPool({
    host: "fitness-db.cd9ny2wbkgd9.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "moataz2026",
    database: "fitness_db",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
});

// ================= INITIALIZE DATABASE =================

async function initDB() {
    try {

        console.log("✅ Connected to fitness_db");

        // USERS TABLE
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                password VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // WORKOUTS TABLE
        await pool.query(`
            CREATE TABLE IF NOT EXISTS workouts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                workout VARCHAR(200),
                duration INT,
                date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // WATER TABLE
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

// ================= REGISTER =================

app.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "All fields are required",
            });
        }

        await pool.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, password]
        );

        res.json({
            message: "User Registered Successfully",
        });

    } catch (err) {

        console.error("❌ Register Error:", err.message);

        res.status(500).json({
            error: err.message,
        });
    }
});

// ================= LOGIN =================

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const [rows] = await pool.execute(
            "SELECT * FROM users WHERE email = ? AND password = ?",
            [email, password]
        );

        if (rows.length > 0) {

            res.json({
                success: true,
                user: rows[0],
            });

        } else {

            res.status(401).json({
                success: false,
                message: "Invalid Credentials",
            });
        }

    } catch (err) {

        console.error("❌ Login Error:", err.message);

        res.status(500).json({
            error: err.message,
        });
    }
});

// ================= GET WORKOUTS =================

app.get("/workouts", async (req, res) => {

    try {

        const [rows] = await pool.execute(
            "SELECT * FROM workouts ORDER BY id DESC"
        );

        res.json(rows);

    } catch (err) {

        console.error("❌ Get Workouts Error:", err.message);

        res.status(500).json({
            error: err.message,
        });
    }
});

// ================= ADD WORKOUT =================

app.post("/workouts", async (req, res) => {

    try {

        console.log("📥 Workout Received:", req.body);

        const { workout, duration, date } = req.body;

        if (!workout || !duration || !date) {
            return res.status(400).json({
                error: "Missing fields",
            });
        }

        const [result] = await pool.execute(
            "INSERT INTO workouts (workout, duration, date) VALUES (?, ?, ?)",
            [
                workout,
                parseInt(duration),
                date,
            ]
        );

        console.log("✅ Workout Added");

        res.json({
            message: "Workout Added Successfully",
            id: result.insertId,
        });

    } catch (err) {

        console.error("❌ Add Workout Error:", err.message);

        res.status(500).json({
            error: err.message,
        });
    }
});

// ================= UPDATE WORKOUT =================

app.put("/workouts/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {
            workout,
            duration,
            date,
        } = req.body;

        await pool.execute(
            `UPDATE workouts 
             SET workout = ?, duration = ?, date = ?
             WHERE id = ?`,
            [
                workout,
                duration,
                date,
                id,
            ]
        );

        res.json({
            message: "Workout Updated",
        });

    } catch (err) {

        console.error("❌ Update Error:", err.message);

        res.status(500).json({
            error: err.message,
        });
    }
});

// ================= DELETE WORKOUT =================

app.delete("/workouts/:id", async (req, res) => {

    try {

        const { id } = req.params;

        await pool.execute(
            "DELETE FROM workouts WHERE id = ?",
            [id]
        );

        res.json({
            message: "Workout Deleted",
        });

    } catch (err) {

        console.error("❌ Delete Error:", err.message);

        res.status(500).json({
            error: err.message,
        });
    }
});

// ================= ADD WATER =================

app.post("/water", async (req, res) => {

    try {

        console.log("📥 Water Received:", req.body);

        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({
                error: "Amount is required",
            });
        }

        await pool.execute(
            "INSERT INTO water_intake (amount) VALUES (?)",
            [parseInt(amount)]
        );

        console.log("✅ Water Added");

        res.json({
            message: "Water Added Successfully",
        });

    } catch (err) {

        console.error("❌ Water Error:", err.message);

        res.status(500).json({
            error: err.message,
        });
    }
});

// ================= GET WATER =================

app.get("/water", async (req, res) => {

    try {

        const [result] = await pool.execute(
            "SELECT SUM(amount) AS total FROM water_intake"
        );

        res.json(result[0] || { total: 0 });

    } catch (err) {

        console.error("❌ Get Water Error:", err.message);

        res.status(500).json({
            error: err.message,
        });
    }
});

// ================= GET ALL WATER RECORDS =================

app.get("/water/all", async (req, res) => {

    try {

        const [records] = await pool.execute(
            "SELECT * FROM water_intake ORDER BY date DESC, created_at DESC"
        );

        res.json(records);

    } catch (err) {

        console.error("❌ Get Water Records Error:", err.message);

        res.status(500).json({
            error: err.message,
        });
    }
});

// ================= UPDATE WATER =================

app.put("/water/:id", async (req, res) => {

    try {

        const { id } = req.params;
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({
                error: "Amount is required",
            });
        }

        await pool.execute(
            "UPDATE water_intake SET amount = ? WHERE id = ?",
            [parseInt(amount), id]
        );

        res.json({
            message: "Water updated successfully",
        });

    } catch (err) {

        console.error("❌ Update Water Error:", err.message);

        res.status(500).json({
            error: err.message,
        });
    }
});

// ================= DELETE WATER =================

app.delete("/water/:id", async (req, res) => {

    try {

        const { id } = req.params;

        await pool.execute(
            "DELETE FROM water_intake WHERE id = ?",
            [id]
        );

        res.json({
            message: "Water deleted successfully",
        });

    } catch (err) {

        console.error("❌ Delete Water Error:", err.message);

        res.status(500).json({
            error: err.message,
        });
    }
});

// ================= SERVER =================

app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
});