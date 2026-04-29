import express from 'express';
import { sendFeedback, getFeedback } from '../controllers/feedbackController.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, sendFeedback);
router.get('/', requireAuth, requireSuperAdmin, getFeedback);

export default router;