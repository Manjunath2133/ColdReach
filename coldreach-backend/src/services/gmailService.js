// src/services/gmailService.js

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { fileURLToPath } from 'url';

// Needed for ES6 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

/**
 * Sends an email with resume attachment and cover letter using Gmail API
 * @param {Object} options
 * @param {string} options.accessToken - User's Gmail access token
 * @param {string} options.to - HR email
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Cover letter body
 * @param {string} options.resumePath - Full path to resume file
 * @returns {Promise<Object>}
 */
export const sendMailWithGmail = async ({ accessToken, to, subject, body, resumePath }) => {
  try {
    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const fileData = fs.readFileSync(resumePath).toString('base64');
    const fileName = path.basename(resumePath);
    const mimeType = mime.lookup(resumePath) || 'application/pdf';

    const messageParts = [
      `To: ${to}`,
      'Subject: ' + subject,
      'Content-Type: multipart/mixed; boundary="boundary"',
      '',
      '--boundary',
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      body,
      '',
      '--boundary',
      `Content-Type: ${mimeType}; name="${fileName}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${fileName}"`,
      '',
      fileData,
      '--boundary--',
    ];

    const rawMessage = Buffer.from(messageParts.join('\r\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Failed to send Gmail:', error);
    throw error;
  }
};

export const sendColdEmail = async ({ accessToken, to, subject, message, resumePath }) => {
  try {
    // Set up OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oAuth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const resumeContent = fs.readFileSync(resumePath).toString('base64');

    const boundary = '__myapp__boundary__';

    const rawMessage = [
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      `To: ${to}`,
      `Subject: ${subject}`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      ``,
      `${message}`,
      ``,
      `--${boundary}`,
      `Content-Type: application/pdf`,
      `Content-Disposition: attachment; filename="resume.pdf"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      `${resumeContent}`,
      `--${boundary}--`
    ].join('\n');

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to send email to:', to);
    console.error('🪵 Error details:', error.response?.data || error.message || error);
    throw new Error('Failed to send email');
  }
};