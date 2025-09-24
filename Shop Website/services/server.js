// server.js
const mongoose = require('mongoose');
<<<<<<< HEAD
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('combined'));

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mystikraft';

mongoose.connect(mongoURI).then(() => {
=======
const app = require('./app');

const mongoURI = 'mongodb://localhost:27017/mystikraft';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
}).then(() => {// Connected to MongoDB 
>>>>>>> 3cd66255b635bc04aedf089202ad0d958fc62b80
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
<<<<<<< HEAD

const contactRoutes = require('../controllers/contact');
const searchRoutes = require('../controllers/search');
const productRoutes = require('../routes/products');
const cartRoutes = require('../routes/cart');
const orderRoutes = require('../routes/orders');

console.log('contactRoutes:', contactRoutes);
console.log('searchRoutes:', searchRoutes);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use('/contact', contactRoutes);     
app.use('/api/search', searchRoutes);   
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Web server running at: http://localhost:${port}`);
  console.log('Type Ctrl+C to shut down the web server');
});
=======
>>>>>>> 3cd66255b635bc04aedf089202ad0d958fc62b80
