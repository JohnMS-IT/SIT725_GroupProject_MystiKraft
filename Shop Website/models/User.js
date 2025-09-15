const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const crypto = require('crypto'); // 确保引入crypto模块

/**
 * User Schema for authentication and user management
 * Uses passport-local-mongoose for authentication helpers
 */
const UserSchema = new Schema({
  // User's email address (used as username)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'is invalid']
  },
  // Flag indicating if email has been verified
  emailVerified: {
    type: Boolean,
    default: false
  },
  // Token for email verification
  emailVerificationToken: String,
  // Expiration date for email verification token
  emailVerificationExpires: Date,
  // Token for password reset functionality
  passwordResetToken: String,
  // Expiration date for password reset token
  passwordResetExpires: Date,
  // Account creation timestamp
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Last login timestamp
  lastLogin: {
    type: Date
  }
});

// Add passport-local-mongoose plugin to handle authentication
UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// 添加生成验证token的方法
UserSchema.methods.generateVerificationToken = function() {
  // 生成token
  this.emailVerificationToken = crypto.randomBytes(20).toString('hex');
  // 设置过期时间（24小时后）
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return this.emailVerificationToken;
};

module.exports = mongoose.model('User', UserSchema);