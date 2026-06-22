# Documentazione Progetto — Appelli DB

Sistema di gestione appelli universitari. Nx monorepo con NestJS (API) + React 19 (UI).

## Struttura documentazione

### Backend
| File | Contenuto |
|------|-----------|
| [backend/01-overview.md](backend/01-overview.md) | Architettura generale, setup, comandi |
| [backend/02-database.md](backend/02-database.md) | DatabaseModule, TypeORM, configurazione PostgreSQL |
| [backend/03-users.md](backend/03-users.md) | UserEntity, STI, UsersService, ruoli |
| [backend/04-auth.md](backend/04-auth.md) | JWT, Passport, login/register/change-password |
| [backend/05-security.md](backend/05-security.md) | Guards, decoratori, protezione rotte |
| [backend/06-entities.md](backend/06-entities.md) | Entità dominio: Teacher, Course, Exam, Session, Degree |
| [backend/07-api-app.md](backend/07-api-app.md) | AppModule root, Swagger, entry point |

### Frontend
| File | Contenuto |
|------|-----------|
| [frontend/01-overview.md](frontend/01-overview.md) | Architettura UI, routing, setup |
| [frontend/02-auth.md](frontend/02-auth.md) | Login, logout, cambio password, protezione rotte |
| [frontend/03-teacher.md](frontend/03-teacher.md) | Portale docente: calendario, prenotazione esami |
| [frontend/04-segreteria.md](frontend/04-segreteria.md) | Portale segreteria: sessioni, corsi, materie, docenti |
| [frontend/05-components.md](frontend/05-components.md) | Componenti shadcn UI, componenti shared |
| [frontend/06-utils.md](frontend/06-utils.md) | Utility date, calendario, holidays |

## Stack tecnologico

- **Runtime**: Node.js, TypeScript 5.9
- **Backend**: NestJS 11, TypeORM, PostgreSQL
- **Frontend**: React 19, Vite, react-router-dom v6, Tailwind CSS, shadcn/ui
- **Monorepo**: Nx
- **Auth**: JWT (24h), Passport (local + jwt strategy), bcrypt
- **Testing**: Jest (unit/integration), Playwright (e2e)

## Comandi principali

```bash
npm run start:api          # API NestJS su porta 3333
npm exec nx serve ui       # UI React (Vite dev server)
npm exec nx build api
npm exec nx build ui
npm exec nx test api
npm exec nx e2e api-e2e
npm exec nx e2e ui-e2e
```

## Variabili d'ambiente (`.env` nella root)

```
PORT=3333
PG_HOST=127.0.0.1
PG_PORT=5433
PG_USER=postgres
PG_PASSWORD=...
PG_DATABASE=appelli_db
SECRET_KEY=...
```
