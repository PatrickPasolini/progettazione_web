# Backend — Database

**Percorso**: `libs/database/src/lib/database.module.ts`
**Import**: `@org/database`

## DatabaseModule

Modulo singleton che configura la connessione TypeORM a PostgreSQL.

```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: +process.env.PG_PORT,
      username: process.env.PG_USER ?? process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      autoLoadEntities: true,   // le entità registrate con forFeature() vengono caricate automaticamente
      synchronize: true,        // schema sincronizzato con le entity ad ogni avvio (solo sviluppo)
    }),
  ],
})
export class DatabaseModule {}
```

## Variabili d'ambiente richieste

| Variabile | Alias | Descrizione |
|-----------|-------|-------------|
| `PG_HOST` | — | Host PostgreSQL (es. `127.0.0.1`) |
| `PG_PORT` | — | Porta PostgreSQL (es. `5433`) |
| `PG_USER` | `PG_USERNAME` | Utente DB |
| `PG_PASSWORD` | — | Password DB |
| `PG_DATABASE` | — | Nome database (es. `appelli_db`) |

## Note importanti

- `synchronize: true` crea/aggiorna automaticamente le tabelle in base alle entity. **Non usare in produzione** — usare migrazioni.
- `autoLoadEntities: true` elimina la necessità di elencare manualmente le entity nel modulo root. Ogni `TypeOrmModule.forFeature([EntityName])` nei feature module registra automaticamente l'entità.
- Il modulo viene importato in `AppModule` (root) e non riesportato — ogni feature module usa `TypeOrmModule.forFeature()` per accedere alle proprie entity.

## Schema PostgreSQL (tabelle principali)

| Tabella | Entità |
|---------|--------|
| `users` | `UserEntity` (STI — contiene anche `TeacherEntity` via colonna `dtype`) |
| `course` | `CourseEntity` |
| `exam` | `ExamEntity` |
| `session` | `SessionEntity` |
| `degree` | `DegreeEntity` |
| `session_degrees` | Join table `SessionEntity ↔ DegreeEntity` (ManyToMany) |
| `book` | `BookEntity` (modulo esempio) |
| `author` | `AuthorEntity` |
| `category` | `CategoryEntity` |
| `address` | `AddressEntity` |
