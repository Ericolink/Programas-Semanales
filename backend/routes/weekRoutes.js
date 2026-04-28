import express from 'express';
import {
  importWeek,
  getWeeks,
  getWeekById,
  generateWeekAssignments,
  deleteWeek,
  updateAssignmentMember,
  updateAssignmentType,
} from '../controllers/weekController.js';

const router = express.Router();

router.get('/', getWeeks);
router.get('/:id', getWeekById);
router.post('/import', importWeek);
router.post('/:id/generate', generateWeekAssignments);
router.delete('/:id', deleteWeek);
router.patch('/assignments/:assignmentId/member', updateAssignmentMember);
router.patch('/assignments/:assignmentId/type', updateAssignmentType);

export default router;
