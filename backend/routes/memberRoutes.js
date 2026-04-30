import express from 'express';
import { createMember, getMembers, getMemberById, updateMember, deleteMember, getMemberHistory } from '../controllers/memberController.js';

const router = express.Router();

router.get('/', getMembers);
router.get('/:id', getMemberById);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);
router.get('/:id/history', getMemberHistory);

export default router;
