const mongoose = require('mongoose');
// Define the User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: false, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'seller'], default: 'customer' },
  createdAt: { type: Date, default: Date.now }
});
// Export the User model
module.exports = mongoose.model('User', userSchema);