import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/api.js';
import { useAuth } from '../hooks/useAuth.js';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [errorType, setErrorType] = useState(''); // 'email' | 'password' | 'general'
  const [loading, setLoading]   = useState(false);

  const { loginUser } = useAuth();
  const navigate      = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setErrorType('');

  // Validación manual
  if (!email.trim()) {
    setError('Ingresa tu correo electrónico');
    setErrorType('email');
    return;
  }

  if (!password.trim()) {
    setError('Ingresa tu contraseña');
    setErrorType('password');
    return;
  }

  setLoading(true);

  try {
    const res = await login(email, password);
    loginUser(res.data.token, res.data.user);
    navigate('/');
  } catch (err) {
    console.log('Error completo:', err);
    console.log('Response:', err.response);

    const msg = err.response?.data?.error ?? 'Error al iniciar sesión';
    setError(msg);

    if (msg.includes('correo')) setErrorType('email');
    else if (msg.includes('Contraseña')) setErrorType('password');
    else setErrorType('general');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '40px 36px',
        width: '100%',
        maxWidth: 400,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontFamily: 'DM Serif Display',
            fontSize: 28,
            color: 'var(--accent)',
            marginBottom: 4
          }}>
            Vida y Ministerio
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            Inicia sesión para continuar
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* EMAIL */}
          <div>
            <label style={{
              fontSize: 12,
              color: 'var(--text-2)',
              marginBottom: 6,
              display: 'block'
            }}>
              Correo electrónico
            </label>

            <input
              type="text" // 👈 cambiado
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 14px',
                color: 'var(--text)',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {errorType === 'email' && (
              <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>
                {error}
              </div>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label style={{
              fontSize: 12,
              color: 'var(--text-2)',
              marginBottom: 6,
              display: 'block'
            }}>
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 14px',
                color: 'var(--text)',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {errorType === 'password' && (
              <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>
                {error}
              </div>
            )}
          </div>

          {/* ERROR GENERAL */}
          {errorType === 'general' && (
            <div style={{ fontSize: 13, color: 'var(--danger)', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

        </form>
      </div>
    </div>
  );
}