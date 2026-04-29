import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Miembros from './pages/Miembros.jsx';
import Grupos from './pages/Grupos.jsx';
import Semanas from './pages/Semanas.jsx';
import Semana from './pages/Semana.jsx';
import Feedback from './pages/Feedback.jsx';
import Admin from './pages/Admin.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: 'var(--text-2)', padding: 40 }}>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: 'var(--text-2)', padding: 40 }}>Cargando...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="miembros" element={<Miembros />} />
        <Route path="grupos" element={<Grupos />} />
        <Route path="semanas" element={<Semanas />} />
        <Route path="semanas/:id" element={<Semana />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
