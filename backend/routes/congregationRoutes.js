import express from 'express';
import { getCongregations, createCongregation, toggleCongregation, changePassword } from '../controllers/congregationController.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, requireSuperAdmin, getCongregations);
router.post('/', requireAuth, requireSuperAdmin, createCongregation);
router.patch('/:id/toggle', requireAuth, requireSuperAdmin, toggleCongregation);
router.patch('/change-password', requireAuth, requireSuperAdmin, changePassword);

export default router;

