const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(email, password, done) {
    User.findOne({ email: email }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Email not registered' });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Password incorrect' });
      }
      if (!user.emailVerified) {
        return done(null, false, { message: 'Please verify your email first' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());