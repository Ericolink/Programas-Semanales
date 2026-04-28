import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const NAV = [
  { to: '/',         label: 'Dashboard',  icon: '⬡' },
  { to: '/semanas',  label: 'Semanas',    icon: '📅' },
  { to: '/miembros', label: 'Miembros',   icon: '👥' },
  { to: '/grupos',   label: 'Grupos',     icon: '🏷️' },
];

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
      }}>
        <div style={{ padding: '0 24px 32px' }}>
          <div style={{ fontFamily: 'DM Serif Display', fontSize: 20, color: 'var(--accent)' }}>
            Vida y
          </div>
          <div style={{ fontFamily: 'DM Serif Display', fontSize: 20 }}>
            Ministerio
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.15s',
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-2)',
              })}
            >
              <span>{icon}</span> {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer del sidebar (usuario + logout) */}
        <div style={{ marginTop: 'auto', padding: '0 12px 12px' }}>
          <div style={{
            fontSize: 12,
            color: 'var(--text-2)',
            padding: '0 12px',
            marginBottom: 8
          }}>
            {user?.congregation?.name}
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'var(--text-2)',
              fontSize: 13,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px 32px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}