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

module.exports = mongoose.model('User', UserSchema);