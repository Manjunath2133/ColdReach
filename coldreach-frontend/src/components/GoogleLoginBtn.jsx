import React from 'react';

export default function GoogleLoginBtn({ onLoginSuccess }) {
  React.useEffect(() => {
    /* global google */
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) return;

    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'openid email profile https://www.googleapis.com/auth/gmail.send',
      ux_mode: 'popup',
      access_type: 'offline',
      prompt: 'consent',
      callback: async (response) => {
        try {
          const res = await fetch('http://localhost:8000/api/auth/google/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: response.code }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Exchange failed');
          localStorage.setItem('google_token', JSON.stringify(data));
          onLoginSuccess(data);
        } catch (err) {
          console.error('Login failed:', err);
          alert('Google login failed.');
        }
      },
    });

    const btn = document.getElementById('google-signin-btn');
    if (btn) btn.onclick = () => client.requestCode();
  }, [onLoginSuccess]);

  return <button id="google-signin-btn">Sign in with Google</button>;
}