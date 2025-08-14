// src/middlewares/googleAuth.js
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    req.googleUser = payload;
    next();
  } catch (err) {
    console.error('Google token verification failed:', err);
    return res.status(403).json({ error: 'Invalid or expired ID token' });
  }
};
