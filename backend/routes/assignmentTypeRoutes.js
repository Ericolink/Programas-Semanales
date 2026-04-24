import express from 'express';
import {
  getAssignmentTypes,
  getAssignmentTypeById,
  createAssignmentType,
  updateAssignmentType,
  deleteAssignmentType,
} from '../controllers/assignmentTypeController.js';

const router = express.Router();

router.get('/', getAssignmentTypes);
router.get('/:id', getAssignmentTypeById);
router.post('/', createAssignmentType);
router.put('/:id', updateAssignmentType);
router.delete('/:id', deleteAssignmentType);

export default router;