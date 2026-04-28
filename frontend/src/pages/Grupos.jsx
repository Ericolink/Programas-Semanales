import { useEffect, useState } from 'react';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../api/api.js';

const EMPTY_FORM = { name: '' };

const ROLE_COLORS = {
  'Anciano':     { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', label: 'ANC' },
  'Ministerial': { bg: 'rgba(79,124,255,0.15)',  color: '#4f7cff', label: 'MIN' },
  'Pionero':     { bg: 'rgba(52,211,153,0.15)',  color: '#34d399', label: 'PR'  },
  'Publicador':  { bg: 'rgba(139,144,167,0.15)', color: '#8b90a7', label: 'PUB' },
};

function RoleBadge({ role }) {
  if (!role) return null;
  const style = ROLE_COLORS[role.name] ?? ROLE_COLORS['Publicador'];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
      background: style.bg, color: style.color, letterSpacing: '0.05em',
    }}>
      {style.label}
    </span>
  );
}

export default function Grupos() {
  const [groups, setGroups]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  const fetchGroups = () => {
    getGroups()
      .then(r => {
        setGroups(r.data);
        if (r.data.length > 0 && !activeGroup) setActiveGroup(r.data[0].id);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchGroups(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit   = (g) => { setEditing(g); setForm({ name: g.name }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) await updateGroup(editing.id, { name: form.name.trim() });
      else         await createGroup({ name: form.name.trim() });
      setShowForm(false);
      fetchGroups();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este grupo? Los miembros quedarán sin grupo.')) return;
    await deleteGroup(id);
    if (activeGroup === id) setActiveGroup(groups.find(g => g.id !== id)?.id ?? null);
    fetchGroups();
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 14px', color: 'var(--text)',
    fontSize: 14, outline: 'none',
  };

  const currentGroup = groups.find(g => g.id === activeGroup);
  const hombres = currentGroup?.members?.filter(m => m.gender === 'H') ?? [];
  const mujeres = currentGroup?.members?.filter(m => m.gender === 'M') ?? [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 6 }}>Grupos</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{groups.length} grupos en la congregación</p>
        </div>
        <button onClick={openCreate} style={{
          background: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          + Nuevo grupo
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 32, width: '100%', maxWidth: 380,
          }}>
            <h2 style={{ fontSize: 20, marginBottom: 24 }}>{editing ? 'Editar grupo' : 'Nuevo grupo'}</h2>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>Nombre del grupo</label>
            <input
              value={form.name}
              onChange={e => setForm({ name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Ej: Grupo Norte"
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 18px', color: 'var(--text-2)', fontSize: 14, cursor: 'pointer',
              }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()} style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving || !form.name.trim() ? 0.6 : 1,
              }}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-2)', fontSize: 14 }}>Cargando...</div>
      ) : (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

          {/* Tabs de grupos */}
          <div style={{ width: '100%', display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g.id)}
                style={{
                  padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.15s',
                  background: activeGroup === g.id ? 'var(--accent)' : 'var(--bg-card)',
                  color: activeGroup === g.id ? '#fff' : 'var(--text-2)',
                }}
              >
                {g.name}
                <span style={{ marginLeft: 6, fontSize: 12, opacity: 0.7 }}>
                  ({g.members?.length ?? 0})
                </span>
              </button>
            ))}
          </div>

          {/* Tabla del grupo activo */}
          {currentGroup && (
            <div style={{
              width: '100%', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden',
            }}>
              {/* Header del grupo */}
              <div style={{
                padding: '16px 24px', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ fontFamily: 'DM Serif Display', fontSize: 20 }}>
                  {currentGroup.name}
                  <span style={{ fontSize: 14, color: 'var(--text-2)', marginLeft: 10, fontFamily: 'DM Sans' }}>
                    {currentGroup.members?.length ?? 0} miembros
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(currentGroup)} style={{
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '6px 12px', color: 'var(--text-2)', fontSize: 12, cursor: 'pointer',
                  }}>Editar</button>
                  <button onClick={() => handleDelete(currentGroup.id)} style={{
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '6px 12px', color: 'var(--danger)', fontSize: 12, cursor: 'pointer',
                  }}>Eliminar</button>
                </div>
              </div>

              {/* Dos columnas: Hombres y Mujeres */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

                {/* Hombres */}
                <div style={{ borderRight: '1px solid var(--border)' }}>
                  <div style={{
                    padding: '10px 20px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    color: 'var(--accent)', borderBottom: '1px solid var(--border)',
                    background: 'rgba(79,124,255,0.05)',
                  }}>
                    HERMANOS — {hombres.length}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '8px 20px', fontSize: 11, color: 'var(--text-2)', textAlign: 'left', fontWeight: 500 }}>#</th>
                        <th style={{ padding: '8px 20px', fontSize: 11, color: 'var(--text-2)', textAlign: 'left', fontWeight: 500 }}>Nombre</th>
                        <th style={{ padding: '8px 20px', fontSize: 11, color: 'var(--text-2)', textAlign: 'right', fontWeight: 500 }}>Rol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hombres.map((m, i) => (
                        <tr key={m.id} style={{
                          borderBottom: i < hombres.length - 1 ? '1px solid var(--border)' : 'none',
                          transition: 'background 0.1s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '10px 20px', fontSize: 12, color: 'var(--text-2)' }}>{i + 1}</td>
                          <td style={{ padding: '10px 20px', fontSize: 13 }}>{m.name}</td>
                          <td style={{ padding: '10px 20px', textAlign: 'right' }}>
                            <RoleBadge role={m.role} />
                          </td>
                        </tr>
                      ))}
                      {hombres.length === 0 && (
                        <tr><td colSpan={3} style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-2)' }}>Sin hermanos</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mujeres */}
                <div>
                  <div style={{
                    padding: '10px 20px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    color: 'var(--accent-2)', borderBottom: '1px solid var(--border)',
                    background: 'rgba(124,79,255,0.05)',
                  }}>
                    HERMANAS — {mujeres.length}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '8px 20px', fontSize: 11, color: 'var(--text-2)', textAlign: 'left', fontWeight: 500 }}>#</th>
                        <th style={{ padding: '8px 20px', fontSize: 11, color: 'var(--text-2)', textAlign: 'left', fontWeight: 500 }}>Nombre</th>
                        <th style={{ padding: '8px 20px', fontSize: 11, color: 'var(--text-2)', textAlign: 'right', fontWeight: 500 }}>Rol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mujeres.map((m, i) => (
                        <tr key={m.id} style={{
                          borderBottom: i < mujeres.length - 1 ? '1px solid var(--border)' : 'none',
                          transition: 'background 0.1s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '10px 20px', fontSize: 12, color: 'var(--text-2)' }}>{i + 1}</td>
                          <td style={{ padding: '10px 20px', fontSize: 13 }}>{m.name}</td>
                          <td style={{ padding: '10px 20px', textAlign: 'right' }}>
                            <RoleBadge role={m.role} />
                          </td>
                        </tr>
                      ))}
                      {mujeres.length === 0 && (
                        <tr><td colSpan={3} style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-2)' }}>Sin hermanas</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}