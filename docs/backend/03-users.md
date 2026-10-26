# Backend — Users

**Percorso**: `libs/server/users/`
**Import**: `@server/users`

## UserEntity

`src/lib/user.entity.ts`

Entità base per tutti gli utenti. Usa **Single Table Inheritance (STI)**: tutte le sottoclassi vivono nella stessa tabella `users`, discriminate dalla colonna `dtype`.

```typescript
@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'dtype' } })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  surname: string;

  @Column({ length: 320, unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: false })
  mustChangePassword: boolean;
}
```

## UserRole Enum

`src/lib/dto/user-role.enum.ts`

```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  SECRETARY = 'SECRETARY',
}
```

| Ruolo | Accesso |
|-------|---------|
| `ADMIN` | Accesso completo: `RolesGuard` lo fa passare su ogni `@Roles(...)`; unico ruolo che gestisce gli utenti |
| `TEACHER` | Inserisce/modifica i propri esami |
| `SECRETARY` | Configura sessioni, corsi, materie, docenti |

## TeacherEntity (STI subtype)

`libs/server/entities/src/entities/teacher.entity.ts`

```typescript
@ChildEntity(UserRole.TEACHER)
export class TeacherEntity extends UserEntity {
  @OneToMany(() => CourseEntity, course => course.teacher)
  courses: CourseEntity[];

  @OneToMany(() => ExamEntity, exam => exam.teacher)
  exams: ExamEntity[];
}
```

La colonna `dtype` avrà valore `'TEACHER'` per le righe TeacherEntity.

## UsersService

`src/lib/users.service.ts`

| Metodo | Descrizione |
|--------|-------------|
| `seed()` | Crea 3 admin + 4 segreterie, una per area (password hashate con bcrypt) |
| `findByEmail(email)` | Trova utente per email; lancia `NotFoundException` se assente |
| `getOneUser(id)` | Trova per ID |
| `getUsers(role?)` | Lista utenti, filtrabile per ruolo |
| `create(dto)` | Verifica email unica, hasha password, salva |
| `updatePassword(id, newPassword)` | Hasha e aggiorna password; imposta `mustChangePassword: false` |
| `update(id, dto)` | Aggiornamento parziale (verifica unicità email se cambia) |
| `removeUser(id)` | Cancella utente |

## UsersController

`src/lib/users.controller.ts`

| Metodo | Rotta | Auth |
|--------|-------|------|
| `GET` | `/api/users` | JwtAuthGuard + ADMIN |
| `GET` | `/api/users/me` | JwtAuthGuard |
| `GET` | `/api/users/:id` | JwtAuthGuard + ADMIN |
| `POST` | `/api/users` | JwtAuthGuard + ADMIN |
| `POST` | `/api/users/populate` | pubblico (seed iniziale) |
| `PATCH` | `/api/users/:id` | JwtAuthGuard + ADMIN |
| `DELETE` | `/api/users/:id` | JwtAuthGuard + ADMIN |

Anche `POST /api/auth/register` è riservato all'admin: il ruolo arriva dal body,
quindi un endpoint pubblico permetterebbe a chiunque di crearsi un account `ADMIN`.

## DTOs

| DTO | Campi |
|-----|-------|
| `CreateUserDto` | name, surname, email, password, role |
| `UpdateUserDto` | Tutti opzionali (Partial di CreateUserDto) |

## Esportazioni pubbliche (`src/index.ts`)

```typescript
export { UserEntity, UserRole, UsersModule, UsersService }
export { CreateUserDto, UpdateUserDto }
```
