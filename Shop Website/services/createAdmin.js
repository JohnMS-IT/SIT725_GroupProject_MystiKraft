const mongoose = require('mongoose');
const User = require('../models/User');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mystikraft';

async function createAdmin() {
  try {
    await mongoose.connect(mongoURI);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@mystikraft.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }
    
    // Create admin user
    const admin = new User({
      email: 'admin@mystikraft.com',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    });
    
    // Register with password (using passport-local-mongoose)
    await User.register(admin, 'admin123');
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@mystikraft.com');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
