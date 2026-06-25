# Backend — Overview

## Struttura Nx

```
apps/api/                     ← NestJS application entry
libs/database/                ← DatabaseModule (TypeORM + PostgreSQL)
libs/server/users/            ← UserEntity base, UsersService, UsersModule
libs/server/auth/             ← JWT + Passport, login/register endpoints
libs/server/security/         ← Guards e decoratori condivisi
libs/server/entities/         ← Dominio core: Teacher, Course, Exam, Session, Degree
libs/server/teacher/          ← TeacherEntity (legacy, ora in entities)
libs/server/books/            ← Modulo esempio (Books, Author, Category)
```

## Flusso richiesta HTTP

```
Client HTTP
  → main.ts (CORS, /api prefix, Swagger)
  → AppModule
  → Feature Module (SessionModule, ExamModule, ...)
  → Guard (JwtAuthGuard → RolesGuard)
  → Controller
  → Service (validazione business logic)
  → Repository (TypeORM query)
  → PostgreSQL
```

## Prefisso rotte

Tutte le rotte sono sotto `/api`. Configurato in `main.ts`:

```typescript
app.setGlobalPrefix('api');
```

Swagger disponibile su `/api/docs` (solo in sviluppo).

## Dipendenze principali

| Pacchetto | Uso |
|-----------|-----|
| `@nestjs/core` | Framework NestJS |
| `@nestjs/jwt` | Firma e verifica JWT |
| `@nestjs/passport` | Integrazione Passport.js |
| `typeorm` | ORM per PostgreSQL |
| `bcrypt` | Hashing password |
| `class-validator` | Validazione DTOs (`@IsString`, `@IsDateString`, ...) |
| `class-transformer` | Trasformazione oggetti DTO |

## Convenzioni codice

- **Repository pattern**: ogni entità ha un repository dedicato che wrappa TypeORM
- **DTOs validati**: tutti gli input passano per DTOs con `class-validator`
- **Eager loading**: le relazioni critiche sono `eager: true` (caricate automaticamente)
- **Single Table Inheritance (STI)**: `UserEntity` base → `TeacherEntity` subtype su colonna `dtype`
- **Guards stratificati**: `JwtAuthGuard` (autenticazione) + `RolesGuard` (autorizzazione) applicati insieme

## Import path aliases (tsconfig.base.json)

```
@org/database       → libs/database/src/index.ts
@server/users       → libs/server/users/src/index.ts
@server/auth        → libs/server/auth/src/index.ts
@server/security    → libs/server/security/src/index.ts
@server/entities    → libs/server/entities/src/index.ts
```
