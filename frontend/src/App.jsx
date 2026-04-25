import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Miembros from './pages/Miembros.jsx';
import Grupos from './pages/Grupos.jsx';
import Semanas from './pages/Semanas.jsx';
import Semana from './pages/Semana.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="miembros" element={<Miembros />} />
        <Route path="grupos" element={<Grupos />} />
        <Route path="semanas" element={<Semanas />} />
        <Route path="semanas/:id" element={<Semana />} />
      </Route>
    </Routes>
  );
}