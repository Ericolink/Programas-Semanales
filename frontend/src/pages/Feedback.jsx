import { useState } from 'react';
import { sendFeedback } from '../api/api.js';

const TIPOS = [
  { value: 'bug',       label: '🐛 Reporte de bug',     desc: 'Algo no funciona como debería' },
  { value: 'sugerencia', label: '💡 Sugerencia',         desc: 'Idea para mejorar la app' },
  { value: 'otro',      label: '💬 Otro',                desc: 'Cualquier otro comentario' },
];

export default function Feedback() {
  const [type, setType]       = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (!type || !message.trim()) return;
    setSending(true);
    setError('');
    try {
      await sendFeedback(type, message.trim());
      setSent(true);
      setType('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al enviar');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>Feedback</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 32 }}>
        Reporta un problema o comparte una sugerencia para mejorar la app.
      </p>

      {sent && (
        <div style={{
          background: 'rgba(52,211,153,0.1)', border: '1px solid var(--success)',
          borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>
              ¡Mensaje enviado!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
              Gracias por tu reporte. Lo revisaré pronto.
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 28,
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* Tipo */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10, display: 'block', fontWeight: 600, letterSpacing: '0.05em' }}>
            TIPO DE REPORTE
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TIPOS.map(t => (
              <div
                key={t.value}
                onClick={() => setType(t.value)}
                style={{
                  padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${type === t.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: type === t.value ? 'rgba(79,124,255,0.08)' : 'var(--bg)',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${type === t.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: type === t.value ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {type === t.value && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mensaje */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block', fontWeight: 600, letterSpacing: '0.05em' }}>
            MENSAJE
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Describe el problema o sugerencia con el mayor detalle posible..."
            rows={5}
            style={{
              width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 14px', color: 'var(--text)',
              fontSize: 14, outline: 'none', resize: 'vertical',
              fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
            }}
          />
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, textAlign: 'right' }}>
            {message.length} caracteres
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={sending || !type || !message.trim()}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 600,
            cursor: sending || !type || !message.trim() ? 'not-allowed' : 'pointer',
            opacity: sending || !type || !message.trim() ? 0.6 : 1,
          }}
        >
          {sending ? 'Enviando...' : 'Enviar reporte'}
        </button>
      </div>
    </div>
  );
}