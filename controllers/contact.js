const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
// Contact form submission route
router.post('/', async (req, res) => {
  const { name, email, phone, topic, message } = req.body;

  console.log('Received form submission:', { name, email, phone, select, message });

  try {
    // Save message to database
    const newMessage = new Message({ name, email, phone, select, message });
    await newMessage.save();
    res.send("Message received!");
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Error saving message");
  }
});

module.exports = router;
