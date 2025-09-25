const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

// Configure Passport to use LocalStrategy for authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email' 
  },
  async (email, password, done) => {
    try {
      // Find user by email
      const user = await User.findOne({ email: email }).exec();

      // If user not found
      if (!user) {
        return done(null, false, { message: 'Email not registered' });
      }

      // Check if password is correct
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Password incorrect' });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return done(null, false, { message: 'Please verify your email first' });
      }

      // Authentication successful
      return done(null, user);
    } catch (err) {
      // Handle errors
      return done(err);
    }
  }
));

// Serialize user instance to the session
passport.serializeUser(User.serializeUser());

// Deserialize user instance from the session
passport.deserializeUser(User.deserializeUser());