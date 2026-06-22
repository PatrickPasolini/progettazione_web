# Frontend — Autenticazione

**Percorso**: `apps/ui/src/features/auth/`

## LoginPage

`pages/login.page.tsx`

Form email + password con componenti shadcn/ui (`Input`, `Button`, `Label`).

**Flusso**:
1. Submit form → chiama `login(email, password)` da `auth.api.ts`
2. Risposta: `{ access_token, user, mustChangePassword }`
3. Salva `access_token` in `localStorage`
4. Se `mustChangePassword === true` → redirect a `/cambia-password`
5. Altrimenti → redirect basato su `user.role`:
   - `SECRETARY` → `/segreteria`
   - `TEACHER` → `/docente/esami`
   - `ADMIN` → `/segreteria`

## LogoutPage

`pages/logout.page.tsx`

- Rimuove `access_token` da `localStorage`
- Redirect immediato a `/login`
- Mostrata come destinazione del pulsante logout nel layout

## ChangePasswordPage

`pages/change-password.page.tsx`

- Rotta protetta: richiede token valido
- Form con campo `newPassword`
- Chiama `PATCH /api/auth/change-password`
- Dopo successo → redirect al portale appropriato

## ProtectedRoute

`components/protected-route.tsx`

Guard per rotte autenticate:

```typescript
function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
```

Wrappa tutte le rotte private in `app.tsx`.

## auth.api.ts

`auth.api.ts`

```typescript
// Login
async function login(email: string, password: string): Promise<AuthResponse>
// POST /api/auth/login → { access_token, user, mustChangePassword }

// Cambio password
async function changePassword(newPassword: string): Promise<void>
// PATCH /api/auth/change-password (richiede Bearer token)
```

## AppLayout — logout con alert

`features/layouts/app-layout.tsx`

Il bottone logout è protetto da un `AlertDialog` (shadcn/ui):
- Click → apre dialogo di conferma "Sei sicuro di voler uscire?"
- Conferma → naviga a `/logout`
- Annulla → chiude dialogo

Il layout legge anche `fetchCurrentUser()` per mostrare nome e ruolo dell'utente nella UI.
