require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
})
  .then(() => {
    console.log('MongoDB connected...');
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Web server running at: http://localhost:${port}`);
      console.log('Type Ctrl+C to shut down the web server');
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });