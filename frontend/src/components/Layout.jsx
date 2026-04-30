import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV = [
    { to: '/',          label: 'Dashboard',  icon: '⬡' },
    { to: '/semanas',   label: 'Semanas',    icon: '📅' },
    { to: '/miembros',  label: 'Publicadores',   icon: '👥' },
    { to: '/grupos',    label: 'Grupos',     icon: '🏷️' },
    { to: '/feedback',  label: 'Feedback',   icon: '💬' },
    ...(user?.role === 'SUPERADMIN' ? [{ to: '/admin', label: 'Admin', icon: '⚙️' }] : []),
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleNavClick = () => setMenuOpen(false);

  const navLinkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
    fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
    background: isActive ? 'var(--accent)' : 'transparent',
    color: isActive ? '#fff' : 'var(--text-2)',
  });

  const sidebarContent = (
    <>
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{ fontFamily: 'DM Serif Display', fontSize: 20, color: 'var(--accent)' }}>
          Vida y
        </div>
        <div style={{ fontFamily: 'DM Serif Display', fontSize: 20 }}>
          Ministerio
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px', flex: 1 }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            onClick={handleNavClick}
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <span>{icon}</span> {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-2)', padding: '0 12px', marginBottom: 8 }}>
          {user?.congregation?.name}
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', background: 'transparent', border: '1px solid var(--border)',
          borderRadius: 8, padding: '8px 12px', color: 'var(--text-2)',
          fontSize: 13, cursor: 'pointer', textAlign: 'left',
        }}>
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar desktop (≥768px) ── */}
      <aside style={{
        width: 220, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '32px 0',
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
      }}
        className="sidebar-desktop"
      >
        {sidebarContent}
      </aside>

      {/* ── Overlay móvil ── */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 98, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      {/* ── Drawer móvil ── */}
      <aside
        style={{
          position: 'fixed', top: 0, left: menuOpen ? 0 : -260,
          width: 240, height: '100vh', background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)', zIndex: 99,
          display: 'flex', flexDirection: 'column', padding: '32px 0',
          transition: 'left 0.25s ease', boxShadow: menuOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
        }}
        className="sidebar-mobile"
      >
        {sidebarContent}
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>

        {/* Topbar móvil */}
        <div
          style={{
            display: 'none', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 97,
          }}
          className="topbar-mobile"
        >
          <div style={{ fontFamily: 'DM Serif Display', fontSize: 18, color: 'var(--accent)' }}>
            Vida y Ministerio
          </div>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 10px', color: 'var(--text)',
              fontSize: 18, cursor: 'pointer', lineHeight: 1,
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <div style={{ padding: '40px 32px' }} className="main-content">
          <Outlet />
        </div>
      </main>

      {/* ── CSS responsive ── */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile  { display: flex !important; }
          .mobile-overlay  { display: block !important; }
          .topbar-mobile   { display: flex !important; }
          .main-content    { padding: 20px 16px !important; }
        }
        @media (min-width: 769px) {
          .sidebar-mobile  { display: none !important; }
          .mobile-overlay  { display: none !important; }
          .topbar-mobile   { display: none !important; }
        }
      `}</style>
    </div>
  );
}