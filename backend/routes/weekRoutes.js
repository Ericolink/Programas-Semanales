import express from 'express';
import multer from 'multer';
import { importWeek } from '../controllers/weekController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/import', upload.single('pdf'), importWeek);

export default router;