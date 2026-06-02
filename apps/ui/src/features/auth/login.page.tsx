import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, fetchCurrentUser } from './auth.api';

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
        <h1 className="text-center text-ink text-xl font-semibold m-0">Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <div className="flex flex-col text-sm">
            <label className="text-ink-2 font-medium mb-1">Email</label>
            <input
              type="email"
              className="px-3 py-2 rounded-md border border-line focus:outline-none focus:border-accent text-ink"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Inserisci email"
              required
            />
          </div>

          <div className="flex flex-col text-sm">
            <label className="text-ink-2 font-medium mb-1">Password</label>
            <input
              type="password"
              className="px-3 py-2 rounded-md border border-line focus:outline-none focus:border-accent text-ink"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 rounded-md bg-accent text-white font-semibold hover:bg-accent-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Accesso in corso...' : 'Login'}
          </button>
        </form>

        {error && <p className="mt-4 text-center text-red-500 font-medium text-sm">{error}</p>}
      </div>
    </main>
  );
}
