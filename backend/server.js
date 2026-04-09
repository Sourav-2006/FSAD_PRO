import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "fsad_db",
});

db.connect((error) => {
  if (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  }
  console.log("MySQL connected ✅");
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.get("/api/items", (req, res) => {
  db.query("SELECT * FROM users", (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message || "Failed to fetch items" });
    }
    res.json(results);
  });
});

app.get("/api/items/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM users WHERE id = ?", [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message || "Failed to fetch item" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(results[0]);
  });
});

app.post("/api/items", (req, res) => {
  const { name, email } = req.body;

  db.query(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email],
    (error, result) => {
      if (error) {
        return res.status(500).json({ error: error.message || "Failed to create item" });
      }

      res.status(201).json({
        id: result.insertId,
        name,
        email,
      });
    }
  );
});

app.put("/api/items/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  db.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, id],
    (error, result) => {
      if (error) {
        return res.status(500).json({ error: error.message || "Failed to update item" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json({ message: "Item updated successfully" });
    }
  );
});

app.delete("/api/items/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM users WHERE id = ?", [id], (error, result) => {
    if (error) {
      return res.status(500).json({ error: error.message || "Failed to delete item" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(204).send();
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});