import { useEffect, useState } from 'react';
import { getMembers, getGroups, createMember, updateMember, deleteMember } from '../api/api.js';
import { useNavigate } from 'react-router-dom';



const ROLES = [
  { id: 1, name: 'Anciano' },
  { id: 2, name: 'Publicador' },
  { id: 3, name: 'Ministerial' },
];

const EMPTY_FORM = { name: '', gender: 'H', roleId: '', groupId: '' };

function Badge({ children, color = 'var(--accent)' }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5,
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>
      {children}
    </span>
  );
}

function roleColor(name) {
  if (name === 'Anciano')     return 'var(--warning)';
  if (name === 'Ministerial') return 'var(--accent)';
  if (name === 'Pionero')     return 'var(--success)';
  return 'var(--text-2)';
}

export default function Miembros() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null); // member object
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');

  const fetchAll = () => {
    Promise.all([getMembers(), getGroups()])
      .then(([m, g]) => { setMembers(m.data); setGroups(g.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({ name: m.name, gender: m.gender, roleId: m.roleId ?? '', groupId: m.groupId ?? '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        gender: form.gender,
        roleId: form.roleId ? Number(form.roleId) : null,
        groupId: form.groupId ? Number(form.groupId) : null,
      };
      if (editing) await updateMember(editing.id, data);
      else         await createMember(data);
      setShowForm(false);
      fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este miembro?')) return;
    await deleteMember(id);
    fetchAll();
  };

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 14px', color: 'var(--text)',
    fontSize: 14, outline: 'none',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 6 }}>Miembros</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            {members.filter(m => m.active).length} miembros activos
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 20px', fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          + Agregar miembro
        </button>
      </div>

      {/* Búsqueda */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar miembro..."
        style={{ ...inputStyle, marginBottom: 20, maxWidth: 320 }}
      />

      {/* Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 32, width: '100%', maxWidth: 420,
          }}>
            <h2 style={{ fontSize: 20, marginBottom: 24 }}>
              {editing ? 'Editar miembro' : 'Nuevo miembro'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>Nombre</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre completo"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>Género</label>
                <select
                  value={form.gender}
                  onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="H">Hermano (H)</option>
                  <option value="M">Hermana (M)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>Rol</label>
                <select
                  value={form.roleId}
                  onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Sin rol</option>
                  {ROLES.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>Grupo</label>
                <select
                  value={form.groupId}
                  onChange={e => setForm(f => ({ ...f, groupId: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Sin grupo</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(m => (
            <div key={m.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '14px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: m.gender === 'H' ? 'rgba(79,124,255,0.15)' : 'rgba(124,79,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                  color: m.gender === 'H' ? 'var(--accent)' : 'var(--accent-2)',
                }}>
                  {m.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    {m.group?.name ?? 'Sin grupo'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {m.role && <Badge color={roleColor(m.role.name)}>{m.role.name}</Badge>}
                <Badge color={m.gender === 'H' ? 'var(--accent)' : 'var(--accent-2)'}>
                  {m.gender === 'H' ? 'Hermano' : 'Hermana'}
                </Badge>
                <button
                  onClick={() => openEdit(m)}
                  style={{
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '5px 10px', color: 'var(--text-2)',
                    fontSize: 12, cursor: 'pointer',
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  style={{
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '5px 10px', color: 'var(--danger)',
                    fontSize: 12, cursor: 'pointer',
                  }}
                >
                  ✕
                </button>

                <button
                  onClick={() => navigate(`/miembros/${m.id}/historial`)}
                  style={{
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '5px 10px', color: 'var(--text-2)',
                    fontSize: 12, cursor: 'pointer',
                  }}
                >
                  Historial
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}