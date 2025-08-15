# ColdReach 🚀

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-FF6F61?style=for-the-badge&logo=groq&logoColor=white)](https://www.groq.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## Overview

ColdReach is a **full-stack web application** designed to streamline the job application process by sending **personalized cold emails** with resume attachments and AI-generated cover letters. It integrates Google OAuth for secure login and leverages **Groq’s LLaMA3 model** to generate tailored cover letters based on the company name.

---

## Features

- 🔐 **Google OAuth 2.0** for secure login  
- 📄 **Resume Upload & Send** to multiple recipients  
- 🤖 **AI-Powered Cover Letters** generated via Groq LLaMA3  
- ⚡ **Email Queueing** using Bull + Redis for efficiency  
- 💻 **Responsive Frontend** built with React + TailwindCSS  

---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Vite  
- **Backend:** Node.js, Express.js 
- **Authentication:** Google OAuth 2.0  
- **Email Service:** Gmail API  
- **AI Integration:** Groq LLaMA3  
- **Queue Management:** Bull + Redis  

---

## Demo

Here’s a demo of ColdReach in action:

[ColdReach Demo](https://www.youtube.com/watch?v=gyxDWs7C_Wc)

---

## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/coldreach.git
cd coldreach
```

2. **Install backend dependencies:**

``` bash
cd backend
npm install
```

3. **Install frontend dependencies:**

```bash
cd ../frontend
npm install
```

4. **Set up environment variables in backend/.env:**
```bash
PORT=8000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GROQ_API_KEY=your_groq_api_key
REDIS_URL=your_redis_url
```
---

## Running the Application

**Backend:**
```bash
cd backend
nodemon server
```

**Frontend:**
```bash
cd frontend
npm run dev
```
--- 
## Usage
1. Open the app in your browser (usually http://localhost:5173).
2. Login with Google OAuth.
3. Upload your resume and enter recipient email addresses.
4. Input the company name to generate a personalized cover letter via Groq.
5. Send emails and track queue status.

---
## Contributing
Contributions are welcome!

1. Fork the repository
2. Create your feature branch (git checkout -b feature-name)
3. Commit your changes (git commit -m "Add feature")
4. Push to the branch (git push origin feature-name)
5. Open a pull request

---

[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
