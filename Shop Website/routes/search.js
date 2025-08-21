// routes/search.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Search route
router.get('/', (req, res) => {
  const query = req.query.q || '';
  const sql = `
    SELECT name, price, image
    FROM Products
    WHERE name LIKE ?
  `;
  db.all(sql, [`%${query}%`], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(rows);
  });
});

module.exports = router;
