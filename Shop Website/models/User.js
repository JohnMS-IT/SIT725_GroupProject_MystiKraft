const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const crypto = require('crypto'); // Required for token generation

// User Schema for authentication and user management
// Uses passport-local-mongoose for authentication helpers
const UserSchema = new Schema({
  // User's email address (used as username)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'is invalid']
  },
  // User's first name
  firstName: {
    type: String,
    trim: true
  },
  // User's last name
  lastName: {
    type: String,
    trim: true
  },
  // User's phone number
  phone: {
    type: String,
    trim: true
  },
  // User's shipping addresses
  shippingAddresses: [{
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: 'Australia',
      trim: true
    }
  }],
  // User's preferred payment method
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'cash_on_delivery'],
    default: 'credit_card'
  },
  // User's saved credit card information
  creditCard: {
    cardNumber: {
      type: String,
      trim: true
    },
    expiryDate: {
      type: String,
      trim: true
    },
    cardHolderName: {
      type: String,
      trim: true
    }
  },
  // Flag indicating whether the user's email has been verified
  emailVerified: {
    type: Boolean,
    default: false
  },
  // Token used for email verification
  emailVerificationToken: String,
  // Expiration time for the email verification token
  emailVerificationExpires: Date,
  // Token used for password reset functionality
  passwordResetToken: String,
  // Expiration time for the password reset token
  passwordResetExpires: Date,
  // Timestamp of account creation
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Timestamp of last login
  lastLogin: {
    type: Date
  },
  // Timestamp of last profile update
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // User role for access control
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

// Add passport-local-mongoose plugin for authentication support
UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// Method to generate email verification token
UserSchema.methods.generateVerificationToken = function() {
  // Generate a random token
  this.emailVerificationToken = crypto.randomBytes(20).toString('hex');
  // Set expiration time to 24 hours from now
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return this.emailVerificationToken;
};

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', UserSchema);