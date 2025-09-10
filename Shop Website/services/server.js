const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

require('./db/database'); // initializes tables
const contactRoutes = require('./routes/contact');
const searchRoutes = require('./routes/search');

console.log('contactRoutes:', contactRoutes);
console.log('searchRoutes:', searchRoutes);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public_html'));

app.use('/contact', contactRoutes);     
app.use('/api/search', searchRoutes);   

const port = 3000;

app.listen(port, () => {
  console.log(`Web server running at: http://localhost:${port}`);
  console.log('Type Ctrl+C to shut down the web server');
});
