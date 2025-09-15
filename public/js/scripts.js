 

router.post('/', async (req, res) => {
  const { name, email, phone, topic, message } = req.body;

  console.log('Received form submission:', { name, email, phone, topic, message });

  try {
    const newMessage = new Message({ name, email, phone, topic, message });
    await newMessage.save();
    res.send("Message received!");
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Error saving message");
  }
});

// Search route
router.get('/', async (req, res) => {
  const query = req.query.q || '';
  try {
    const products = await Product.find({ name: { $regex: query, $options: 'i' } });
    res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database query error' });
  }
});
module.exports = router;
