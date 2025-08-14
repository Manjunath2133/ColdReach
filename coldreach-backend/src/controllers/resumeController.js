//resumeController.js

// Preview endpoint: generate cover letter for review, do not send email
export const previewCoverLetter = async (req, res) => {
  try {
    const { companyName, letterType, specificPosition, userName } = req.body;
    const resumeFile = req.file;

    if (!companyName || !resumeFile) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const subject = `Application for Opportunity at ${companyName}`;

    // Extract user info from resume
    let userInfo = await extractUserInfoFromResume(resumeFile.path);
    if (userName && userName.trim()) {
      userInfo.name = userName.trim();
    }

    let coverLetter = await generateCoverLetter(
      companyName,
      letterType,
      specificPosition,
      userInfo
    );

    // Add subject line at the top of the cover letter
    coverLetter = `Subject: ${subject}\n\n${coverLetter}`;

    // Replace any placeholder/fallback names in the cover letter with the correct name everywhere
    if (userInfo.name) {
      coverLetter = coverLetter.replace(/Motivated Computer|Motivated [A-Za-z]+/gi, userInfo.name);
    }

    // Remove unwanted intro lines (e.g., lines starting with "Here" or "Here's")
    coverLetter = coverLetter
      .split('\n')
      .filter(line => !/^here/i.test(line.trim()))
      .join('\n');

    // Remove all [bracketed] placeholders
    coverLetter = coverLetter.replace(/\[[^\]]+\]/g, '');

    return res.status(200).json({ coverLetter });
  } catch (err) {
    console.error('Preview Cover Letter Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

import { sendMailWithGmail } from '../services/gmailService.js';
import { generateCoverLetter } from '../services/openaiService.js';
import { sendColdEmail } from '../services/gmailService.js';
// import path from 'path'; (removed duplicate)
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
const { GlobalWorkerOptions } = pdfjsLib;
import path from 'path';
import mammoth from 'mammoth';
import fs from 'fs';

// Helper to extract info from PDF or DOCX
async function extractUserInfoFromResume(filePath) {
  let text = '';
  if (filePath.endsWith('.pdf')) {
    // Use pdfjs-dist to extract text from PDF
    const dataBuffer = fs.readFileSync(filePath);
    // Set workerSrc for pdfjs-dist (ESM compatible)
    // Use absolute path to pdf.worker.js from project root
    const workerPath = path.resolve(
      process.cwd(),
      'node_modules/pdfjs-dist/legacy/build/pdf.worker.js'
    );
    GlobalWorkerOptions.workerSrc = workerPath;
    const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
    const pdf = await loadingTask.promise;
    let pageTexts = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      pageTexts.push(pageText);
    }
    text = pageTexts.join('\n');
  } else if (filePath.endsWith('.docx')) {
    const data = await mammoth.extractRawText({ path: filePath });
    text = data.value;
  }
  // Simple regex-based extraction (customize as needed)
  const nameMatch = text.match(/Name[:\s]+([A-Za-z .]+)/i) || text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
  const degreeMatch = text.match(/(Bachelor|Master|B\.?Tech|M\.?Tech|BSc|MSc|PhD)[^\n]*/i);
  const fieldMatch = text.match(/in ([A-Za-z &]+)/i);

  return {
    name: nameMatch ? nameMatch[1].trim() : '',
    degree: degreeMatch ? degreeMatch[0].trim() : '',
    field: fieldMatch ? fieldMatch[1].trim() : '',
  };
}

  export const sendResumeMail = async (req, res) => {
    try {
      const { hrEmail, companyName } = req.body;
      const resumePath = req.file.path;

      // In real app, you get this from the session or token
      const accessToken = req.user?.accessToken || req.body.accessToken;

      if (!accessToken) {
        return res.status(401).json({ message: 'Access token missing' });
      }

      // Generate cover letter
      const coverLetter = await generateCoverLetter(companyName);

      // Send email via Gmail
      const response = await sendMailWithGmail({
        accessToken,
        to: hrEmail,
        subject: `Application for Opportunities at ${companyName}`,
        body: coverLetter,
        resumePath
      });

      res.status(200).json({ message: 'Email sent', response });
    } catch (error) {
      console.error('Error sending resume email:', error);
      res.status(500).json({ message: 'Something went wrong', error });
    }
  };

  export const handleResumeAndSend = async (req, res) => {
    try {
      const { accessToken, companyName, hrEmails, letterType, specificPosition, userName, customCoverLetter } = req.body;
      const resumeFile = req.file;

      if (!accessToken || !companyName || !hrEmails || !resumeFile) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const resumePath = path.resolve(resumeFile.path);
      const subject = `Application for Opportunity at ${companyName}`;

      // Extract user info from resume
      let userInfo = await extractUserInfoFromResume(resumeFile.path);
      if (userName && userName.trim()) {
        userInfo.name = userName.trim();
      }

      let coverLetter;
      if (customCoverLetter && customCoverLetter.trim()) {
        // Use the user-provided cover letter, but ensure subject and name are correct
        coverLetter = `Subject: ${subject}\n\n${customCoverLetter.trim()}`;
        if (userInfo.name) {
          coverLetter = coverLetter.replace(/Motivated Computer|Motivated [A-Za-z]+/gi, userInfo.name);
        }
      } else {
        // Generate cover letter as before
        coverLetter = await generateCoverLetter(
          companyName,
          letterType,
          specificPosition,
          userInfo
        );
        coverLetter = `Subject: ${subject}\n\n${coverLetter}`;
        if (userInfo.name) {
          coverLetter = coverLetter.replace(/Motivated Computer|Motivated [A-Za-z]+/gi, userInfo.name);
        }
      }

      // Remove unwanted intro lines and [bracketed] placeholders
      coverLetter = coverLetter
        .split('\n')
        .filter(line => !/^here/i.test(line.trim()))
        .join('\n')
        .replace(/\[[^\]]+\]/g, '');

      const hrEmailList = hrEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      const emailResults = [];

      for (const hrEmail of hrEmailList) {
        try {
          const result = await sendColdEmail({
            accessToken,
            to: hrEmail,
            subject,
            message: coverLetter,
            resumePath
          });

          emailResults.push({ hrEmail, status: 'sent', messageId: result.id });
        } catch (err) {
          emailResults.push({ hrEmail, status: 'failed', error: err.message });
        }
      }

      return res.status(200).json({
        message: 'Process completed',
        results: emailResults
      });
    } catch (err) {
      console.error('Send Controller Error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
