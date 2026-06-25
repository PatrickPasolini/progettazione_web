<div align="center">
  <img src="apps/ui/public/examflow-logo.png" alt="ExamFlow" width="400">

  Sistema di gestione e pianificazione degli appelli d'esame universitari.
</div>

---

I docenti di un corso di laurea coordinano la prenotazione delle date d'esame all'interno di una sessione configurata dalla segreteria.

Monorepo [Nx](https://nx.dev) con backend **NestJS** + **PostgreSQL** (TypeORM) e frontend **React 19** + **Vite**.

## Funzionalità

- **Segreteria** — configura la sessione: inizio/fine sessione, finestra di inserimento, corsi di laurea e anni di corso.
- **Docente** — sceglie corso di laurea + anno, vede tutte le date del periodo con gli appelli già prenotati dai colleghi, inserisce il proprio appello su una data libera e può modificarlo/cancellarlo finché la finestra di inserimento è aperta.

### Vincoli

- Massimo 1 appello al giorno per combinazione (corso di laurea + anno).
- Inserimento/modifica consentiti solo nella finestra di pianificazione (`insertion_start` → `insertion_end`).
- Il docente vede tutti gli appelli ma modifica solo i propri.
- Giorni disponibili escludono sabato e domenica.

## Stack

| Livello | Tecnologia |
|---------|-----------|
| API | NestJS + Webpack — rotte sotto `/api`, Swagger su `/api/docs` |
| UI | React 19 + Vite + react-router-dom v6 |
| Database | PostgreSQL + TypeORM (`autoLoadEntities`, `synchronize`) |
| Auth | JWT + Passport (strategie local + jwt) |
| Test | Jest (API), Playwright (UI e2e) |

### Ruoli

Due ruoli, gestiti via Single Table Inheritance su `UserEntity` (colonna `role`):

- `SECRETARY` — configura sessioni, corsi di laurea, corsi, docenti.
- `TEACHER` — inserisce/modifica i propri appelli.

## Struttura

```
apps/
  api        @org/api        NestJS API
  ui         @org/ui         React frontend
  api-e2e    @org/api-e2e    test integrazione API (Jest)
  ui-e2e     @org/ui-e2e     test e2e UI (Playwright)
libs/
  database          @org/database     setup TypeORM/PostgreSQL
  server/users      @server/users     UserEntity, UserRole
  server/auth       @server/auth      login/register, JWT
  server/security   @server/security  guard e decorator condivisi
  server/entities   @server/entities  entità di dominio (course, degree, exam, session, teacher) + moduli, controller, service, repository
```

## Setup

Richiede Node.js, npm e Docker (per il database).

### 1. Variabili d'ambiente

Crea un file `.env` nella root del workspace:

```env
PORT=3333
PG_HOST=127.0.0.1
PG_PORT=5433
PG_USER=postgres
PG_PASSWORD=PWS
PG_DATABASE=appelli_db
SECRET_KEY=...
```

### 2. Dipendenze

```bash
npm install
```

### 3. Database in Docker

Lo script `db_appelli.sh` crea (o ricrea) un container PostgreSQL chiamato
`postgres_appelli`, esposto sulla porta `5433`, con il database `appelli_db`:

```bash
./db_appelli.sh
```

Lo script ferma ed elimina un eventuale container omonimo già attivo, avvia un
nuovo container `postgres` e crea il database `appelli_db`. Le credenziali
(`postgres` / `PWS`) coincidono con quelle del file `.env`.

### 4. Avvio e popolamento

Avvia il backend:

```bash
npm run start:api
```

Apri Swagger su **http://localhost:3333/api/docs** ed esegui il popolamento
nell'ordine seguente (necessario per rispettare le dipendenze tra entità):

1. **`POST /api/users/populate`** — endpoint pubblico, crea le segreterie
   (una per area: Economia, Giurisprudenza, Ingegneria, Medicina).
   Tutte con password `Password1!`.
2. **`POST /api/auth/login`** — accedi come segreteria
   (es. `segreteria.ingegneria@unibs.it` / `Password1!`), copia il token JWT e
   premi **Authorize** in Swagger. I populate successivi richiedono il ruolo
   `SECRETARY`.
3. Esegui i populate delle altre entità **in quest'ordine**:

   | # | Endpoint | Dipende da |
   |---|----------|-----------|
   | 1 | `POST /api/teacher/populate` | — |
   | 2 | `POST /api/degree/populate`  | — |
   | 3 | `POST /api/course/populate`  | docenti + corsi di laurea |
   | 4 | `POST /api/session/populate` | corsi di laurea |
   | 5 | `POST /api/exam/populate`    | sessioni + docenti + corsi + corsi di laurea |

A questo punto il database è popolato e l'app è pronta. Avvia il frontend con:

```bash
npm run start:ui
```

## Comandi

```bash
# Dev server
npm run start:api          # API NestJS su porta 3333 (npx nx serve api)
npm run start:ui           # UI React/Vite          (npx nx serve ui)

# Build
npx nx build api
npx nx build ui

# Test
npx nx test api
npx nx test @server/users

# Lint
npx nx lint api

# E2E
npx nx e2e api-e2e
npx nx e2e ui-e2e

# Typecheck
npx nx typecheck api
```

Esplora il grafo delle dipendenze del workspace:

```bash
npx nx graph
```

## Grafo del progetto (understand-anything)

Per ottenere una mappa interattiva dell'intero progetto (architettura,
componenti e relazioni) si usa il plugin **understand-anything** di Claude Code.
Dalla sessione Claude Code nella root del workspace:

```
/understand            # analizza il codebase e genera il knowledge graph
/understand-dashboard  # apre la dashboard web interattiva del grafo
```

Comandi utili correlati:

- `/understand-explain <file|modulo>` — spiegazione approfondita di un file o modulo
- `/understand-diff` — analizza un diff/PR (cosa è cambiato, rischi, componenti toccati)
- `/understand-onboard` — guida di onboarding per nuovi membri del team
