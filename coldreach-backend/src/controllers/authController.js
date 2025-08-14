import { google } from 'googleapis';

const handleGoogleCallback = (req, res) => {
  try {
    const { profile, accessToken, refreshToken } = req.user;

    res.status(200).json({
      message: 'Google Authentication successful',
      user: {
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        picture: profile.photos?.[0]?.value,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong during authentication', error });
  }
};

const handleAuthFailure = (req, res) => {
  res.status(401).json({ message: 'Google Authentication failed' });
};

// Exchange authorization code for tokens
export const exchangeCodeForToken = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Missing code' });

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage' // important for client-side code flow
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.id_token || !tokens.access_token) {
      return res.status(400).json({ message: 'Token retrieval failed' });
    }

    res.status(200).json({
      id_token: tokens.id_token,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token, // only returned on first consent
      expiry_date: tokens.expiry_date,
    });
  } catch (err) {
    console.error('Token exchange failed:', err);
    res.status(500).json({ message: 'Failed to exchange code for tokens' });
  }
};

// Refresh access token using refresh_token
export const refreshAccessToken = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ message: 'Missing refresh_token' });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
  );

  oauth2Client.setCredentials({ refresh_token });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    res.status(200).json({
      id_token: credentials.id_token,
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date,
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(401).json({ message: 'Failed to refresh token', error: err.message });
  }
};

export { handleGoogleCallback, handleAuthFailure };
