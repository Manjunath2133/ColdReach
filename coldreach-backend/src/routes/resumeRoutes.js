//resumeRoutes.js
import express from 'express';
import { upload } from '../middlewares/uploadMiddleware.js';
import { handleResumeAndSend, previewCoverLetter } from '../controllers/resumeController.js';
import { verifyGoogleToken } from '../middlewares/googleAuth.js';

const router = express.Router();

// POST /api/resume/send (original route)
router.post('/send', verifyGoogleToken, upload.single('resume'), handleResumeAndSend);

// POST /api/coverletter/preview (new preview endpoint, no auth required)
router.post('/coverletter/preview', upload.single('resume'), previewCoverLetter);

// POST /api/coverletter/send (new send endpoint, no auth required)
router.post('/coverletter/send', upload.single('resume'), handleResumeAndSend);

export default router;
