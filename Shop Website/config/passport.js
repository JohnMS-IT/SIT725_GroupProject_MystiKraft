const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(new LocalStrategy(
  {
    usernameField: 'email'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email }).exec(); // 使用 async/await

      if (!user) {
        return done(null, false, { message: 'Email not registered' });
      }

      // 假设 user.authenticate 是你模型里定义的方法
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Password incorrect' });
      }

      if (!user.emailVerified) {
        return done(null, false, { message: 'Please verify your email first' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());