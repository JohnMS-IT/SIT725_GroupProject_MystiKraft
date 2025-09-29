// server.js
const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();
const env = process.env;// Load environment variables
const port = process.env.PORT;// Port number from environment variables

mongoose.connect(env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
}).then(() => {// Connected to MongoDB 
  console.log('MongoDB connected...');
  
  // Starting the server
  app.listen(port, () => {
    console.log(`Web server running at: http://localhost:${port}`);
    console.log('Type Ctrl+C to shut down the web server');
  });
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});
