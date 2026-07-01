import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { changePassword, fetchCurrentUser } from './auth.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PasswordInput } from '../../components/ui/password-input';
import { Label } from '../../components/ui/label';

export function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // forced=true => primo accesso obbligato (impostato dalla login page);
  // assente/false => cambio password volontario dal menu.
  const forced = (useLocation().state as { forced?: boolean } | null)?.forced === true;

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (newPassword !== confirm) { setError('Le password non coincidono'); return; }
    setError(null); setLoading(true);
    try {
      await changePassword(newPassword);
      const user = await fetchCurrentUser();
      if (user.role === 'SECRETARY') navigate('/secretary');
      else if (user.role === 'TEACHER') navigate('/teacher');
      else navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex justify-center items-center p-8">
      <div className="bg-card border border-border w-full max-w-sm p-8 rounded-xl shadow-lg">
        <h1 className="text-center text-foreground text-xl font-semibold m-0">Cambia Password</h1>
        <p className="text-center text-muted-foreground text-sm mt-1 mb-0">
          {forced
            ? 'Primo accesso: imposta una nuova password.'
            : 'Imposta una nuova password per il tuo account.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">Nuova password</Label>
            <PasswordInput id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 caratteri, maiuscola, simbolo" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-password">Conferma password</Label>
            <PasswordInput id="confirm-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Ripeti la password" required />
          </div>
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'Salvataggio…' : 'Imposta password'}
          </Button>
        </form>

        {error && <p className="mt-4 text-center text-destructive font-medium text-sm">{error}</p>}
      </div>
    </main>
  );
}
