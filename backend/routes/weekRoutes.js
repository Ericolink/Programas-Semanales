import express from 'express';
import { generateWeekAssignments } from '../controllers/weekController.js';

import {
  importWeek,
  getWeeks,
  getWeekById,
  updateAssignment,
  deleteWeek,
} from '../controllers/weekController.js';

const router = express.Router();

router.get('/', getWeeks);
router.get('/:id', getWeekById);
router.post('/import', importWeek);
router.put('/:id/assignments', updateAssignment);
router.delete('/:id', deleteWeek);
router.post('/:id/generate', generateWeekAssignments);

export default router;