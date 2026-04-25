import { useEffect, useState } from 'react';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../api/api.js';

const EMPTY_FORM = { name: '' };

export default function Grupos() {
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const fetchGroups = () => {
    getGroups().then(r => setGroups(r.data)).finally(() => setLoading(false));
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
    fetchGroups();
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 14px', color: 'var(--text)',
    fontSize: 14, outline: 'none',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 6 }}>Grupos</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{groups.length} grupos en la congregación</p>
        </div>
        <button
          onClick={openCreate}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 20px', fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
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
            <h2 style={{ fontSize: 20, marginBottom: 24 }}>
              {editing ? 'Editar grupo' : 'Nuevo grupo'}
            </h2>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
              Nombre del grupo
            </label>
            <input
              value={form.name}
              onChange={e => setForm({ name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Ej: Grupo Norte"
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 18px', color: 'var(--text-2)',
                  fontSize: 14, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                style={{
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '10px 20px', fontSize: 14,
                  fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving || !form.name.trim() ? 0.6 : 1,
                }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div style={{ color: 'var(--text-2)', fontSize: 14 }}>Cargando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {groups.map(g => (
            <div key={g.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '20px 24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h2 style={{ fontSize: 18 }}>{g.name}</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => openEdit(g)}
                    style={{
                      background: 'transparent', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '5px 10px', color: 'var(--text-2)',
                      fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    style={{
                      background: 'transparent', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '5px 10px', color: 'var(--danger)',
                      fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                {g.members?.length ?? 0} miembros
              </div>
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {g.members?.slice(0, 5).map(m => (
                  <div key={m.id} style={{
                    fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 4, padding: '3px 8px', color: 'var(--text-2)',
                  }}>
                    {m.name.split(' ')[0]}
                  </div>
                ))}
                {g.members?.length > 5 && (
                  <div style={{ fontSize: 11, color: 'var(--text-2)', padding: '3px 4px' }}>
                    +{g.members.length - 5} más
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}