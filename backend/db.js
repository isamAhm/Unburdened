const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

// Create SQLite database connection
const dbPath = path.join(__dirname, "unburdened.db");
const db = new sqlite3.Database(dbPath);

// Initialize the database with posts table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      hearts INTEGER DEFAULT 0,
      wow INTEGER DEFAULT 0,
      laugh INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = {
  query: (text, params = []) => {
    return new Promise((resolve, reject) => {
      if (text.trim().toUpperCase().startsWith("SELECT")) {
        db.all(text, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      } else {
        db.run(text, params, function (err) {
          if (err) reject(err);
          else resolve({ rows: [{ ...this }] });
        });
      }
    });
  },
};
