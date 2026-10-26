// Decodifica il ruolo dal payload del JWT salvato in localStorage.
// Evita una dipendenza esterna: il payload è il segmento centrale del token.
export function getRoleFromToken(): string | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}
