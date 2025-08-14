// Enhanced SendForm.jsx with Tailwind animations & UI/UX polish
import React, { useState, useEffect } from 'react';
import GoogleLoginBtn from '../components/GoogleLoginBtn';

export default function SendForm() {
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [hrEmails, setHrEmails] = useState('');
  const [resume, setResume] = useState(null);
  const [letterType, setLetterType] = useState('general');
  const [specificPosition, setSpecificPosition] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('google_token');
    if (storedToken) {
      try {
        const parsed = JSON.parse(storedToken);
        setToken(parsed);
      } catch {
        localStorage.removeItem('google_token');
      }
    }
  }, []);

  const refreshAccessToken = async () => {
    const storedToken = JSON.parse(localStorage.getItem('google_token') || '{}');
    if (!storedToken.refresh_token) return null;

    try {
      const res = await fetch('http://localhost:8000/api/auth/google/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: storedToken.refresh_token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Refresh failed');

      const updatedToken = {
        ...storedToken,
        access_token: data.access_token,
        id_token: data.id_token,
        expiry_date: data.expiry_date,
      };
      localStorage.setItem('google_token', JSON.stringify(updatedToken));
      setToken(updatedToken);
      return updatedToken;
    } catch (err) {
      console.error('Token refresh failed:', err);
      alert('Session expired. Please log in again.');
      localStorage.removeItem('google_token');
      setToken(null);
      return null;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResume(file);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!resume) return alert('Please upload your resume first.');
    setIsGenerating(true);
    const formData = new FormData();
    formData.append('accessToken', token?.access_token || '');
    formData.append('companyName', companyName);
    formData.append('hrEmails', hrEmails);
    formData.append('letterType', letterType);
    formData.append('specificPosition', specificPosition);
    formData.append('userName', userName);
    formData.append('resume', resume);
    try {
      const res = await fetch('/api/resume/coverletter/preview', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Error generating cover letter');
      const data = await res.json();
      setCoverLetter(data.coverLetter);
    } catch (err) {
      alert('Error generating cover letter');
    }
    setIsGenerating(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!resume) return alert('Please upload your resume.');
    setIsSending(true);
    const formData = new FormData();
    formData.append('accessToken', token?.access_token || '');
    formData.append('companyName', companyName);
    formData.append('hrEmails', hrEmails);
    formData.append('letterType', letterType);
    formData.append('specificPosition', specificPosition);
    formData.append('userName', userName);
    formData.append('resume', resume);
    formData.append('customCoverLetter', coverLetter);
    try {
      const res = await fetch('/api/resume/coverletter/send', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Error sending email');
      alert('Email(s) sent!');
    } catch (err) {
      alert('Error sending email');
    }
    setIsSending(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 animate-fade-in">
        <div className="p-8 bg-white shadow-lg rounded-xl">
          <GoogleLoginBtn onLoginSuccess={(res) => setToken(res)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-10 animate-fade-in">
      <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-3xl border border-slate-200">
        <h2 className="text-4xl font-bold mb-8 text-center text-blue-900 tracking-tight">📤 Send Cold Mail</h2>

        <form onSubmit={handleSend} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-medium text-slate-700">Your Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-slate-700">Company Name</label>
            <input
              type="text"
              placeholder="Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-slate-700">HR Emails</label>
            <textarea
              placeholder="hr@example.com, hiring@company.com"
              value={hrEmails}
              onChange={(e) => setHrEmails(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none h-24"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-slate-700">Letter Type</label>
            <select
              value={letterType}
              onChange={(e) => setLetterType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="general">General Position</option>
              <option value="internship">Internship</option>
              <option value="specific">Specific Position</option>
            </select>
          </div>

          {letterType === 'specific' && (
            <div className="space-y-2">
              <label className="block font-medium text-slate-700">Specific Position</label>
              <input
                type="text"
                placeholder="Frontend Developer Intern"
                value={specificPosition}
                onChange={(e) => setSpecificPosition(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block font-medium text-slate-700">Upload Resume</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full file:mr-4 file:px-4 file:py-2 file:border-0 file:rounded-xl file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              required
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition duration-200 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
          </button>

          <div className="space-y-2">
            <label className="block font-medium text-slate-700">Cover Letter</label>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              rows={15}
              placeholder="Your cover letter will appear here. You can edit it or write your own."
              className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition duration-200 disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send Email'}
          </button>
        </form>
      </div>
    </div>
  );
}