// server.js
const mongoose = require('mongoose');
const app = require('./app');

const mongoURI = 'mongodb://localhost:27017/mystikraft';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
}).then(() => {// Connected to MongoDB 
  console.log('MongoDB connected...');
  const port = process.env.PORT || 3000;

  // Start the server
  app.listen(port, () => {
    console.log(`Web server running at: http://localhost:${port}`);
    console.log('Type Ctrl+C to shut down the web server');
  });
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});
