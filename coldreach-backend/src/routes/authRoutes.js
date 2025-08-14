// src/routes/authRoutes.js

import express from 'express';
import passport from 'passport';
import {
  handleGoogleCallback,
  handleAuthFailure,
} from '../controllers/authController.js';
import { exchangeCodeForToken, refreshAccessToken } from '../controllers/authController.js';

const router = express.Router();

// Start Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://mail.google.com/'],
    accessType: 'offline',
    prompt: 'consent',
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: 'http://localhost:5173/success',
    failureRedirect: 'http://localhost:5173/login',
    session: false,
  }),
  handleGoogleCallback
);

// Failure route
router.get('/failure', handleAuthFailure);

// Add code exchange endpoint for frontend OAuth2 code flow
router.post('/google/exchange', exchangeCodeForToken);

// Add refresh token endpoint for frontend
router.post('/google/refresh', refreshAccessToken);

export default router;
