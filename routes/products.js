const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category;
    const validCategories = ['shoes', 'tops', 'bottoms', 'accessories'];
    if (!validCategories.includes(category)) {
      return cb(new Error('Invalid category'));
    }
    cb(null, `public/images/${category}`);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.body.slug}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

router.post('/', authMiddleware, upload.single('image'), productController.addProduct);
router.get('/', productController.getProducts);

module.exports = router;