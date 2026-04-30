import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import memberRoutes from './routes/memberRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import weekRoutes from './routes/weekRoutes.js';
import assignmentTypeRoutes from './routes/assignmentTypeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import congregationRoutes from './routes/congregationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://vida-ministerio.vercel.app', // lo actualizamos después con la URL real
  ],
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => res.send('API funcionando 🚀'));

// Rutas públicas
app.use('/api/auth', authRoutes);

// Rutas protegidas
app.use('/api/members',          requireAuth, memberRoutes);
app.use('/api/groups',           requireAuth, groupRoutes);
app.use('/api/weeks',            requireAuth, weekRoutes);
app.use('/api/assignment-types', requireAuth, assignmentTypeRoutes);
app.use('/api/congregations',    requireAuth, congregationRoutes);
app.use('/api/feedback',         requireAuth, feedbackRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));