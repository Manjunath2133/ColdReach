import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import resumeRoutes from '../src/routes/resumeRoutes.js';

import './config/passport.js'; // Import strategy
import authRoutes from '../src/routes/authRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// ✅ Initialize Passport BEFORE routes
app.use(
  session({
    secret: 'coldreach-session',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Log and Mount Routes AFTER middleware
app.use('/api/auth', (req, res, next) => {
  console.log('🔥 /api/auth route accessed');
  next();
});
app.use('/api/auth', authRoutes);

app.use('/api/resume', resumeRoutes);

export default app;
