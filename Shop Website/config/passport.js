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

      user.authenticate(password, function(err, authenticated) {
        if (err) {
          return done(err);
        }
        
        if (!authenticated) {
          return done(null, false, { message: 'Password incorrect' });
        }

        // Authentication successful (email verification disabled for now)
        return done(null, user);
      });
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize user instance to the session
passport.serializeUser(User.serializeUser());

// Deserialize user instance from the session
passport.deserializeUser(User.deserializeUser());