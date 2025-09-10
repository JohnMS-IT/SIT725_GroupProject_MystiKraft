const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

// MongoDB Connection
const mongoURI = 'mongodb://localhost:27017/mystikraft';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected...');
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});

const contactRoutes = require('../controllers/contact');
const searchRoutes = require('../controllers/search');


console.log('contactRoutes:', contactRoutes);
console.log('searchRoutes:', searchRoutes);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/contact', contactRoutes);     
app.use('/api/search', searchRoutes);   

const port = 3000;

app.listen(port, () => {
  console.log(`Web server running at: http://localhost:${port}`);
  console.log('Type Ctrl+C to shut down the web server');
});
