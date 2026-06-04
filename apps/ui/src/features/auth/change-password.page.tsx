import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword, fetchCurrentUser } from './auth.api';

export function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError('Le password non coincidono');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await changePassword(newPassword);
      const user = await fetchCurrentUser();
      if (user.role === 'SECRETARY') navigate('/segreteria');
      else if (user.role === 'TEACHER') navigate('/docente');
      else navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg flex justify-center items-center p-8">
      <div className="bg-paper w-full max-w-sm p-8 rounded-xl shadow-lg">
        <h1 className="text-center text-ink text-xl font-semibold m-0">Cambia Password</h1>
        <p className="text-center text-ink-3 text-sm mt-1 mb-0">
          Primo accesso: imposta una nuova password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <div className="flex flex-col text-sm">
            <label className="text-ink-2 font-medium mb-1">Nuova password</label>
            <input
              type="password"
              className="px-3 py-2 rounded-md border border-line focus:outline-none focus:border-accent text-ink"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 caratteri, maiuscola, simbolo"
              required
            />
          </div>

          <div className="flex flex-col text-sm">
            <label className="text-ink-2 font-medium mb-1">Conferma password</label>
            <input
              type="password"
              className="px-3 py-2 rounded-md border border-line focus:outline-none focus:border-accent text-ink"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ripeti la password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 rounded-md bg-accent text-white font-semibold hover:bg-accent-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Salvataggio...' : 'Imposta password'}
          </button>
        </form>

        {error && <p className="mt-4 text-center text-red-500 font-medium text-sm">{error}</p>}
      </div>
    </main>
  );
}
