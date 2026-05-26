import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './auth.api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{
        background: 'var(--paper)', borderRadius: 14,
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow)',
        padding: '40px 36px', width: 380, maxWidth: '92vw',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--accent)', color: 'var(--paper)',
            display: 'grid', placeItems: 'center',
            fontFamily: "'Instrument Serif', serif", fontSize: 24,
          }}>
            A
          </div>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, lineHeight: 1 }}>
            Appelli<span style={{ color: 'var(--accent)' }}>.</span>
          </span>
        </div>

        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, margin: '0 0 6px' }}>
          Accedi
        </h2>
        <p style={{ color: 'var(--ink-3)', fontSize: 13, margin: '0 0 22px' }}>
          Gestione appelli universitari
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@università.it"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          {error && (
            <div className="banner warn" style={{ margin: '12px 0' }}>
              <span className="pill">Errore</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}
