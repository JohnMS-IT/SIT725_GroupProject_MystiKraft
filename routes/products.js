const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Debug logs
//console.log('Loading /routes/products.js');
//console.log('Product controller loaded:', require.resolve('../controllers/productController'));
//console.log('Auth middleware loaded:', require.resolve('../middleware/authMiddleware'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination:', req.body.category);
    const category = req.body.category;
    const validCategories = ['shoes', 'tops', 'bottoms', 'accessories'];
    if (!validCategories.includes(category)) {
      console.log('Multer error: Invalid category:', category);
      return cb(new Error('Invalid category'));
    }
    cb(null, `public/images/${category}`);
  },
  filename: (req, file, cb) => {
    console.log('Multer filename:', req.body.slug);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.body.slug}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter:', file.mimetype);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      console.log('Multer error: Only images are allowed:', file.mimetype);
      cb(new Error('Only images are allowed'), false);
    }
  }
}).single('image');

router.post('/', (req, res, next) => {
  console.log('POST /api/products route reached');
  upload(req, res, (err) => {
    if (err) {
      console.log('Multer error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, authMiddleware, productController.addProduct);
router.get('/', (req, res, next) => {
  console.log('GET /api/products route reached');
  next();
}, productController.getProducts);

module.exports = router;