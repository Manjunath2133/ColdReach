// src/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      // You can store tokens/user info in DB if needed
      console.log('✅ GOOGLE CALLBACK REACHED');
      console.log('🎯 Profile:', profile);
      console.log('🔑 Tokens:', accessToken, refreshToken);
      return done(null, { profile, accessToken, refreshToken });
      
    }
  )
);

// These are required for session (even if you don't use sessions for now)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});
