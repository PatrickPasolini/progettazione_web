import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword, fetchCurrentUser } from './auth.api';
import book_styles from '../css/books.module.css';

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
    <main className={book_styles.page}>
      <div className={`${book_styles.card} ${book_styles.cardSmall}`}>
        <h1 className={book_styles.title}>Cambia Password</h1>
        <p className={book_styles.subtitle}>
          Primo accesso: imposta una nuova password.
        </p>

        <form onSubmit={handleSubmit} className={book_styles.form}>
          <div className={book_styles.field}>
            <label>Nuova password</label>
            <input
              type="password"
              className={book_styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 caratteri, maiuscola, simbolo"
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Conferma password</label>
            <input
              type="password"
              className={book_styles.input}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ripeti la password"
              required
            />
          </div>

          <button className={book_styles.button} type="submit" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Imposta password'}
          </button>
        </form>

        {error && <p className={book_styles.error}>{error}</p>}
      </div>
    </main>
  );
}
