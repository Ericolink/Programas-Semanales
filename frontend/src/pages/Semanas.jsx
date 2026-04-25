import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeeks, importWeek, deleteWeek } from '../api/api.js';

export default function Semanas() {
  const [weeks, setWeeks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [docId, setDocId]     = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const fetchWeeks = () => {
    getWeeks().then(r => setWeeks(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWeeks(); }, []);

  const handleImport = async () => {
    if (!docId.trim()) return;
    setImporting(true);
    setError('');
    try {
      await importWeek(docId.trim());
      setDocId('');
      fetchWeeks();
    } catch (e) {
      setError(e.response?.data?.error ?? 'Error al importar');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta semana y sus asignaciones?')) return;
    await deleteWeek(id);
    fetchWeeks();
  };

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>Semanas</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 32 }}>
        Importa y gestiona los programas semanales
      </p>

      {/* Importar */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '24px', marginBottom: 32,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          Importar semana desde wol.jw.org
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>
          Pega el ID del documento. Ej: de la URL <code style={{ color: 'var(--accent)' }}>
          .../202026088</code> el ID es <code style={{ color: 'var(--accent)' }}>202026088</code>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={docId}
            onChange={e => setDocId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleImport()}
            placeholder="Ej: 202026088"
            style={{
              flex: 1, background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 14px', color: 'var(--text)',
              fontSize: 14, outline: 'none',
            }}
          />
          <button
            onClick={handleImport}
            disabled={importing || !docId.trim()}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px 20px', fontSize: 14,
              fontWeight: 600, cursor: importing ? 'not-allowed' : 'pointer',
              opacity: importing || !docId.trim() ? 0.6 : 1,
            }}
          >
            {importing ? 'Importando...' : 'Importar'}
          </button>
        </div>
        {error && (
          <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10 }}>{error}</div>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ color: 'var(--text-2)', fontSize: 14 }}>Cargando...</div>
      ) : weeks.length === 0 ? (
        <div style={{ color: 'var(--text-2)', fontSize: 14 }}>No hay semanas importadas aún.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {weeks.map(w => (
            <div
              key={w.id}
              onClick={() => navigate(`/semanas/${w.id}`)}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '18px 24px',
                cursor: 'pointer', transition: 'background 0.15s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
            >
              <div>
                <div style={{ fontFamily: 'DM Serif Display', fontSize: 17 }}>
                  {new Date(w.startDate).toLocaleDateString('es-MX', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                  {w._count?.assignments ?? 0} asignaciones
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: 'var(--accent)', fontSize: 18 }}>→</span>
                <button
                  onClick={e => handleDelete(e, w.id)}
                  style={{
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '6px 10px', color: 'var(--danger)',
                    cursor: 'pointer', fontSize: 13,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}