import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, fetchCurrentUser } from './auth.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const { mustChangePassword } = await login(email, password);
      if (mustChangePassword) { navigate('/cambia-password'); return; }
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
    <main className="min-h-screen bg-background flex justify-center items-center p-8">
      <div className="bg-card border border-border w-full max-w-sm p-8 rounded-xl shadow-lg">
        <h1 className="text-center text-foreground text-xl font-semibold m-0">Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Inserisci email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Inserisci password" required />
          </div>
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'Accesso in corso…' : 'Login'}
          </Button>
        </form>

        {error && <p className="mt-4 text-center text-destructive font-medium text-sm">{error}</p>}
      </div>
    </main>
  );
}
