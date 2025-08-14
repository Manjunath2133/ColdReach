//openaiService.js
import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config();

export const generateCoverLetter = async (companyName, letterType = 'general', specificPosition = '', userInfo = {}) => {
  try {
    // Compose intro from userInfo
    let intro = '';
    if (userInfo.name) intro += `Applicant Name: ${userInfo.name}. `;
    if (userInfo.degree && userInfo.field) {
      intro += `Education: ${userInfo.degree} in ${userInfo.field}. `;
    } else if (userInfo.degree) {
      intro += `Education: ${userInfo.degree}. `;
    } else if (userInfo.field) {
      intro += `Field: ${userInfo.field}. `;
    }

    let positionText = '';
    if (letterType === 'specific' && specificPosition) {
      positionText = ` for the position of ${specificPosition}`;
    } else if (letterType === 'internship') {
      positionText = ' for an internship';
    }

    // Prompt instructs Groq to use the provided name as the signature, never a placeholder
    const prompt = `\n${intro}\nWrite a professional, concise, and enthusiastic cover letter${positionText} at ${companyName}.\n- Personalize the letter using the applicant's background.\n- End the letter with: Best regards, ${userInfo.name || '[Applicant Name]'}.\n- Do NOT use any placeholder or generic name. Always use the provided name as the signature.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that writes cold email cover letters for job applications.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Groq API Error: ' + errorText);
    }

    const data = await response.json();
    let letter = data.choices[0].message.content.trim();
    // Remove any AI-generated signature or lines after 'Best regards,'
    letter = letter.replace(/Best regards[\s\S]*$/i, '').trim();
    // Always append the correct signature
    if (userInfo.name) {
      letter += `\n\nBest regards,\n${userInfo.name}`;
    }
    return letter;
  } catch (error) {
    console.error('GPT Error:', error);
    throw new Error('Failed to generate cover letter');
  }
};
