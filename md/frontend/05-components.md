# Frontend — Componenti

## AppLayout

`features/layouts/app-layout.tsx`

Layout condiviso applicato a tutte le rotte protette tramite `<Outlet>` react-router.

**Struttura**:
```
┌─────────────────────────────────────────────┐
│ Header sticky                               │
│  [Logo/Titolo]  [Tab navigazione]  [User ▼] │
├─────────────────────────────────────────────┤
│                                             │
│  <Outlet /> (contenuto pagina corrente)     │
│                                             │
└─────────────────────────────────────────────┘
```

**Tab visibili per ruolo**:
- `SECRETARY`: Sessioni · Corsi · Materie · Docenti
- `TEACHER`: Esami
- `ADMIN`: tutte le tab

**User dropdown** (in alto a destra):
- Mostra nome + ruolo dell'utente
- Voci: Cambia Password, Logout
- Logout apre un `AlertDialog` di conferma prima di navigare a `/logout`

**Dati utente**: caricati da `fetchCurrentUser()` che chiama `GET /api/user/:id` (id estratto dal JWT in localStorage).

---

## Componenti shadcn/ui

`components/ui/`

Componenti prebuilt basati su Radix UI + Tailwind CSS.

| File | Componente | Uso |
|------|-----------|-----|
| `button.tsx` | `Button` | Pulsanti (variant: default, outline, destructive, ghost) |
| `input.tsx` | `Input` | Campi di testo |
| `label.tsx` | `Label` | Label form accessibili |
| `select.tsx` | `Select`, `SelectContent`, `SelectItem`, ... | Dropdown select |
| `dialog.tsx` | `Dialog`, `DialogContent`, `DialogHeader`, ... | Modal dialogs |
| `alert-dialog.tsx` | `AlertDialog`, `AlertDialogAction`, ... | Dialog di conferma (es. logout) |
| `badge.tsx` | `Badge` | Tag/etichette colorate |
| `separator.tsx` | `Separator` | Linea divisoria orizzontale/verticale |
| `date-picker.tsx` | `DatePicker` | Selettore data con calendario (usa `date-fns`) |

### Utilizzo base

```tsx
// Button
<Button variant="outline" onClick={handleClick}>Cancella</Button>

// Select
<Select value={value} onValueChange={setValue}>
  <SelectTrigger><SelectValue placeholder="Scegli..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="LT">Laurea Triennale</SelectItem>
  </SelectContent>
</Select>

// AlertDialog
<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Annulla</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirm}>Conferma</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## ProtectedRoute

`features/auth/components/protected-route.tsx`

```typescript
function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
```

Wrappa le rotte in `app.tsx`. Non decodifica il token — verifica solo la presenza. La validazione reale avviene sul backend ad ogni richiesta.
