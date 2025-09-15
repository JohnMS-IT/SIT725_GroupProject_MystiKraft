const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Product = require('./models/Product');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mystikraft', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/shop', async (req, res) => {
  try {
    const { category, price, sort } = req.query;

    // Build MongoDB query
    let query = {};
    
    // Category filter
    if (category && category !== 'all') {
      query.category = { $regex: category, $options: 'i' }; // Case-insensitive match
    }

    // Price filter
    if (price && price !== 'all') {
      if (price === '0-50') {
        query.price = { $gte: 0, $lte: 50 };
      } else if (price === '50-100') {
        query.price = { $gte: 50, $lte: 100 };
      } else if (price === '100+') {
        query.price = { $gte: 100 };
      }
    }

    // Sort option
    let sortOption = {};
    if (sort === 'newest') {
      sortOption.createdAt = -1; // Newest first
    } else if (sort === 'oldest') {
      sortOption.createdAt = 1; // Oldest first
    }

    // Fetch products from MongoDB
    const products = await Product.find(query).sort(sortOption);
    
    // Pass current filter values to maintain dropdown state
    res.render('shop', {
      products,
      selectedCategory: category || 'all',
      selectedPrice: price || 'all',
      selectedSort: sort || 'newest'
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));