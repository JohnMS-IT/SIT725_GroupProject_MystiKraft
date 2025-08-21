const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('shoehouse.db');

// Initialize tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS Products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      category TEXT,
      image TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      topic TEXT,
      message TEXT
    )
  `);

  
  db.all(`SELECT COUNT(*) AS count FROM Products`, (err, rows) => {
    if (rows[0].count === 0) {
      const stmt = db.prepare(`INSERT INTO Products (name, price, category, image) VALUES (?, ?, ?, ?)`);
      stmt.run('Nike Air Max', 120, 'Running', 'NikeAir.jpg');
      stmt.run('Ultraboost', 220, 'Running', 'ultraboost.jpg');
      stmt.run('Jordans', 100, 'Basketball', 'Jordans.webp');
      stmt.run('Vans', 90, 'Casual', 'vans.webp');
      stmt.finalize();
    }
  });
});

module.exports = db;
