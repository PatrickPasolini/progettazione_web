import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, fetchCurrentUser } from './auth.api';
import book_styles from '../css/books.module.css';

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
      navigate(user.role === 'SECRETARY' ? '/segreteria' : '/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={book_styles.page}>
      <div className={`${book_styles.card} ${book_styles.cardSmall}`}>
        <h1 className={book_styles.title}>Login</h1>

        <form onSubmit={handleSubmit} className={book_styles.form}>
          <div className={book_styles.field}>
            <label>Email</label>
            <input
              type="email"
              className={book_styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Inserisci email"
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Password</label>
            <input
              type="password"
              className={book_styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci password"
              required
            />
          </div>

          <button className={book_styles.button} type="submit" disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Login'}
          </button>
        </form>

        {error && <p className={book_styles.error}>{error}</p>}
      </div>
    </main>
  );
}
