import { useEffect, useState } from 'react';
import { getCongregations, createCongregation, toggleCongregation, changePassword, getFeedback } from '../api/api.js';

const TABS = ['Congregaciones', 'Feedback'];

const TYPE_STYLES = {
  bug:       { label: '🐛 Bug',       color: 'var(--danger)' },
  sugerencia:{ label: '💡 Sugerencia', color: 'var(--warning)' },
  otro:      { label: '💬 Otro',       color: 'var(--text-2)' },
};

const EMPTY_FORM = {
  congregationName: '', adminName: '', adminEmail: '', adminPassword: '',
};

export default function Admin() {
  const [tab, setTab]               = useState('Congregaciones');
  const [congregations, setCongregations] = useState([]);
  const [feedbacks, setFeedbacks]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [showPassModal, setShowPassModal] = useState(null); // user object
  const [newPass, setNewPass]       = useState('');
  const [passError, setPassError]   = useState('');
  const [passSaving, setPassSaving] = useState(false);
  const [passSaved, setPassSaved]   = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getCongregations(), getFeedback()])
      .then(([c, f]) => { setCongregations(c.data); setFeedbacks(f.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    const { congregationName, adminName, adminEmail, adminPassword } = form;
    if (!congregationName || !adminName || !adminEmail || !adminPassword) {
      setError('Todos los campos son requeridos');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createCongregation(form);
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al crear');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    await toggleCongregation(id);
    fetchAll();
  };

  const handleChangePassword = async () => {
    if (newPass.length < 6) { setPassError('Mínimo 6 caracteres'); return; }
    setPassSaving(true);
    setPassError('');
    try {
      await changePassword(showPassModal.id, newPass);
      setPassSaved(true);
      setTimeout(() => { setShowPassModal(null); setNewPass(''); setPassSaved(false); }, 1500);
    } catch (err) {
      setPassError(err.response?.data?.error ?? 'Error');
    } finally {
      setPassSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 14px', color: 'var(--text)',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>Panel de administración</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 32 }}>
        Gestiona congregaciones y revisa reportes
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none', padding: '10px 20px',
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
            color: tab === t ? 'var(--accent)' : 'var(--text-2)',
            borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {/* Modal cambiar contraseña */}
      {showPassModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 32, width: '100%', maxWidth: 380,
          }}>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>Cambiar contraseña</h2>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
              {showPassModal.name} — {showPassModal.email}
            </p>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
              Nueva contraseña
            </label>
            <input
              type="password" value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={inputStyle}
            />
            {passError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>{passError}</div>}
            {passSaved && <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 6 }}>✅ Contraseña actualizada</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowPassModal(null); setNewPass(''); setPassError(''); }} style={{
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 18px', color: 'var(--text-2)', fontSize: 14, cursor: 'pointer',
              }}>Cancelar</button>
              <button onClick={handleChangePassword} disabled={passSaving || !newPass} style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600,
                cursor: passSaving || !newPass ? 'not-allowed' : 'pointer',
                opacity: passSaving || !newPass ? 0.6 : 1,
              }}>{passSaving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-2)', fontSize: 14 }}>Cargando...</div>
      ) : (
        <>
          {/* ── Tab Congregaciones ── */}
          {tab === 'Congregaciones' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button onClick={() => { setShowForm(true); setError(''); }} style={{
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>+ Nueva congregación</button>
              </div>

              {/* Formulario */}
              {showForm && (
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: 28, marginBottom: 24,
                }}>
                  <h2 style={{ fontSize: 18, marginBottom: 20 }}>Nueva congregación</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
                        Nombre de la congregación
                      </label>
                      <input
                        value={form.congregationName}
                        onChange={e => setForm(f => ({ ...f, congregationName: e.target.value }))}
                        placeholder="Ej: Congregación Norte"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
                        Nombre del admin
                      </label>
                      <input
                        value={form.adminName}
                        onChange={e => setForm(f => ({ ...f, adminName: e.target.value }))}
                        placeholder="Nombre completo"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
                        Email del admin
                      </label>
                      <input
                        type="text"
                        value={form.adminEmail}
                        onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))}
                        placeholder="correo@ejemplo.com"
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
                        Contraseña inicial
                      </label>
                      <input
                        type="password"
                        value={form.adminPassword}
                        onChange={e => setForm(f => ({ ...f, adminPassword: e.target.value }))}
                        placeholder="Mínimo 6 caracteres"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  {error && <div style={{ fontSize: 13, color: 'var(--danger)', marginTop: 12 }}>{error}</div>}
                  <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                    <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setError(''); }} style={{
                      background: 'transparent', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '10px 18px', color: 'var(--text-2)', fontSize: 14, cursor: 'pointer',
                    }}>Cancelar</button>
                    <button onClick={handleCreate} disabled={saving} style={{
                      background: 'var(--accent)', color: '#fff', border: 'none',
                      borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
                    }}>{saving ? 'Creando...' : 'Crear'}</button>
                  </div>
                </div>
              )}

              {/* Lista de congregaciones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {congregations.map(c => (
                  <div key={c.id} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '20px 24px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontFamily: 'DM Serif Display', fontSize: 17 }}>{c.name}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                            background: c.active ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
                            color: c.active ? 'var(--success)' : 'var(--danger)',
                          }}>
                            {c.active ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                          {c._count.members} miembros · {c._count.users} usuario{c._count.users !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => {
                            const user = c.users?.[0];
                            if (user) setShowPassModal(user);
                          }}
                          style={{
                            background: 'transparent', border: '1px solid var(--border)',
                            borderRadius: 6, padding: '6px 12px', color: 'var(--text-2)',
                            fontSize: 12, cursor: 'pointer',
                          }}
                        >
                          🔑 Contraseña
                        </button>
                        <button onClick={() => handleToggle(c.id)} style={{
                          background: 'transparent',
                          border: `1px solid ${c.active ? 'var(--danger)' : 'var(--success)'}`,
                          borderRadius: 6, padding: '6px 12px',
                          color: c.active ? 'var(--danger)' : 'var(--success)',
                          fontSize: 12, cursor: 'pointer',
                        }}>
                          {c.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab Feedback ── */}
          {tab === 'Feedback' && (
            <div>
              {feedbacks.length === 0 ? (
                <div style={{ color: 'var(--text-2)', fontSize: 14 }}>No hay reportes aún.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {feedbacks.map(f => {
                    const ts = TYPE_STYLES[f.type] ?? TYPE_STYLES.otro;
                    return (
                      <div key={f.id} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)', padding: '18px 24px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                              background: `${ts.color}22`, color: ts.color,
                            }}>{ts.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>
                              {f.user.name}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                              — {f.user.congregation?.name ?? 'N/A'}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
                            {new Date(f.createdAt).toLocaleDateString('es-MX', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                          {f.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}