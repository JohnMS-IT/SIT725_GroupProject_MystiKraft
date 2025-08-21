const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/', (req, res) => {
  const { name, email, phone, topic, message } = req.body;

  console.log('Received form submission:', { name, email, phone, topic, message });

  db.run(
    `INSERT INTO Messages (name, email, phone, topic, message)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, phone, topic, message],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send("Error saving message");
      }
      res.send("Message received!");
    }
  );
});

module.exports = router;
