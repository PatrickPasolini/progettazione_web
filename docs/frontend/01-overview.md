# Frontend — Overview

## Stack

| Tecnologia | Versione | Ruolo |
|------------|----------|-------|
| React | 19 | UI framework |
| Vite | — | Build tool + dev server |
| react-router-dom | v6 | Routing client-side |
| Tailwind CSS | — | Utility-first styling |
| shadcn/ui | — | Componenti UI prebuilt |
| date-fns | — | Manipolazione date |
| TypeScript | 5.9 | Tipizzazione |

## Struttura cartelle

```
apps/ui/src/
  main.tsx                          ← Entry point React
  app/
    app.tsx                         ← Router principale
  features/
    auth/                           ← Login, logout, cambio password
      pages/
      components/
      auth.api.ts
    teacher/                        ← Portale docente
      pages/
      components/
    segreteria/                     ← Portale segreteria
      pages/
      components/
      segreteria.api.ts
    layouts/
      app-layout.tsx                ← Layout condiviso con header/nav
  components/
    ui/                             ← Componenti shadcn/ui
  utils/
    calendar.utils.ts
    date.utils.ts
```

## Routing

Definito in `app/app.tsx`. Struttura ad albero con layout annidati e protezione rotte.

```
/login                    → LoginPage (pubblica)
/logout                   → LogoutPage (pubblica)
/cambia-password          → ChangePasswordPage (protetta)
/segreteria               → SegreteriaPage (layout + protetta)
  /sessioni               → SessioniPage
  /corsi                  → CorsiPage
  /materie                → MateriePage
  /docenti                → DocentiPage
/docente                  → TeacherPage (layout + protetta)
  /esami                  → EsamiPage
/                         → redirect a /segreteria
```

## Autenticazione frontend

- Token JWT salvato in `localStorage.access_token`
- `ProtectedRoute` controlla presenza token; redirect a `/login` se assente
- Ogni API client aggiunge header `Authorization: Bearer <token>`
- Al login, se `mustChangePassword === true` → redirect a `/cambia-password`

## API clients

Ogni sezione feature ha il proprio file `*.api.ts` con funzioni fetch tipizzate:

| File | Dominio |
|------|---------|
| `features/auth/auth.api.ts` | Login, change-password |
| `features/teacher/teacher.api.ts` | Sessioni, corsi, esami (portale docente) |
| `features/segreteria/segreteria.api.ts` | Teacher, Degree, Course, Session CRUD |

Tutti usano `localStorage.access_token` per l'header Authorization.

## Ruoli e navigazione

Il layout (`AppLayout`) mostra tab diverse in base al ruolo dell'utente:

| Ruolo | Tab visibili |
|-------|-------------|
| `SECRETARY` | Sessioni, Corsi, Materie, Docenti |
| `TEACHER` | Esami |
| `ADMIN` | Tutte |
