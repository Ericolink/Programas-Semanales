import express from 'express';
import cors from 'cors';
import memberRoutes from './routes/memberRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import weekRoutes from './routes/weekRoutes.js';
import assignmentTypeRoutes from './routes/assignmentTypeRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

app.use('/api/members', memberRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/weeks', weekRoutes);
app.use('/api/assignment-types', assignmentTypeRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});