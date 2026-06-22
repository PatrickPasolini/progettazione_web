# Backend — Entità Dominio

**Percorso**: `libs/server/entities/`
**Import**: `@server/entities`

Contiene tutto il dominio core: Teacher, Course, Exam, Session, Degree.
Ogni entità ha: Entity, Repository, Service, Controller, Module, DTOs, Interface.

---

## Enum

`src/entities/dto/degree.enum.ts`

```typescript
enum DegreeType {
  BACHELOR = 'LT',        // Laurea Triennale
  MASTER = 'LM',          // Laurea Magistrale
  SINGLE_CYCLE = 'LMCU',  // Laurea Magistrale Ciclo Unico
}

enum DegreeYear {
  FIRST = 'I', SECOND = 'II', THIRD = 'III',
  FOURTH = 'IV', FIFTH = 'V', SIXTH = 'VI', SEVENTH = 'VII',
}

enum MacroArea {
  ENGINEERING = 'Ingegneria',
  MEDICINE = 'Medicina',
  // ... 9 aree totali
}
```

---

## DegreeEntity

`src/entities/degree.entity.ts`

Rappresenta un corso di laurea (es. "Informatica LT I anno").

```typescript
@Entity()
@Unique(['degreeName', 'degreeType', 'degreeYear'])
export class DegreeEntity {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 255 }) degreeName: string;
  @Column({ type: 'enum', enum: DegreeType }) degreeType: DegreeType;
  @Column({ type: 'enum', enum: DegreeYear }) degreeYear: DegreeYear;
  @Column({ type: 'enum', enum: MacroArea }) macroArea: MacroArea;

  @ManyToMany(() => SessionEntity, session => session.degrees)
  sessions: SessionEntity[];
}
```

**Vincolo unicità**: non possono esistere due degree con stesso nome + tipo + anno.

### DegreeController — Rotte

| Metodo | Rotta | Auth |
|--------|-------|------|
| `GET` | `/api/degree` | JwtAuthGuard |
| `GET` | `/api/degree/:id` | JwtAuthGuard |
| `POST` | `/api/degree` | ADMIN, SECRETARY |
| `PATCH` | `/api/degree/:id` | ADMIN, SECRETARY |
| `DELETE` | `/api/degree/:id` | ADMIN, SECRETARY |
| `POST` | `/api/degree/populate` | ADMIN |

---

## SessionEntity

`src/entities/session.entity.ts`

Definisce una sessione d'esame con finestre temporali.

```typescript
@Entity()
export class SessionEntity {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'date' }) startDate: string;       // inizio periodo esami
  @Column({ type: 'date' }) endDate: string;         // fine periodo esami
  @Column({ type: 'date' }) startInsertDate: string; // apertura inserimento
  @Column({ type: 'date' }) endInsertDate: string;   // chiusura inserimento
  @Column({ type: 'enum', enum: MacroArea }) macroArea: MacroArea;
  @Column({ default: 1 }) examLimit: number;         // max esami per docente nella sessione

  @ManyToMany(() => DegreeEntity, degree => degree.sessions, { eager: true })
  @JoinTable({ name: 'session_degrees' })
  degrees: DegreeEntity[];

  @OneToMany(() => ExamEntity, exam => exam.session)
  exams: ExamEntity[];
}
```

**Validazioni service**:
- `startDate < endDate`
- `startInsertDate < endInsertDate`
- `endInsertDate <= startDate` (la finestra inserimento chiude prima che inizi la sessione)

### SessionService — Metodi notevoli

| Metodo | Descrizione |
|--------|-------------|
| `findActiveByTeacher(teacherId)` | Sessioni in cui il docente ha corsi assegnati (query su degrees → sessions) |
| `seed()` | Crea 2 sessioni esempio (Giugno e Settembre 2026, MacroArea ENGINEERING) |

### SessionController — Rotte

| Metodo | Rotta | Auth |
|--------|-------|------|
| `GET` | `/api/session` | JwtAuthGuard |
| `GET` | `/api/session/:id` | JwtAuthGuard |
| `GET` | `/api/session/teacher/:id` | JwtAuthGuard |
| `POST` | `/api/session` | ADMIN, SECRETARY |
| `PATCH` | `/api/session/:id` | ADMIN, SECRETARY |
| `DELETE` | `/api/session/:id` | ADMIN, SECRETARY |
| `POST` | `/api/session/populate` | ADMIN |

---

## TeacherEntity

`src/entities/teacher.entity.ts`

STI subtype di `UserEntity`. Non aggiunge colonne extra — usa il meccanismo `@ChildEntity`.

```typescript
@ChildEntity(UserRole.TEACHER)
export class TeacherEntity extends UserEntity {
  @OneToMany(() => CourseEntity, course => course.teacher)
  courses: CourseEntity[];

  @OneToMany(() => ExamEntity, exam => exam.teacher)
  exams: ExamEntity[];
}
```

### TeacherController — Rotte

| Metodo | Rotta | Auth |
|--------|-------|------|
| `GET` | `/api/teacher` | JwtAuthGuard |
| `GET` | `/api/teacher/:id` | JwtAuthGuard |
| `POST` | `/api/teacher` | ADMIN, SECRETARY |
| `PATCH` | `/api/teacher/:id` | ADMIN, SECRETARY |
| `DELETE` | `/api/teacher/:id` | ADMIN, SECRETARY |
| `POST` | `/api/teacher/populate` | ADMIN |

---

## CourseEntity

`src/entities/course.entity.ts`

Rappresenta un corso (materia) insegnata da un docente in un corso di laurea.

```typescript
@Entity()
@Unique(['courseName', 'degree'])
export class CourseEntity {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 255 }) courseName: string;

  @ManyToOne(() => TeacherEntity, { eager: true, onDelete: 'RESTRICT' })
  teacher: TeacherEntity;

  @ManyToOne(() => DegreeEntity, { eager: true, onDelete: 'RESTRICT' })
  degree: DegreeEntity;

  @OneToMany(() => ExamEntity, exam => exam.course)
  exams: ExamEntity[];
}
```

**Vincolo unicità**: stesso corso non può essere assegnato due volte allo stesso degree.

### CourseController — Rotte

| Metodo | Rotta | Auth |
|--------|-------|------|
| `GET` | `/api/course` | JwtAuthGuard |
| `GET` | `/api/course/:id` | JwtAuthGuard |
| `GET` | `/api/course/teacher/:teacherId/session/:sessionId` | JwtAuthGuard |
| `GET` | `/api/course/teacher/:teacherId/degrees` | JwtAuthGuard |
| `POST` | `/api/course` | ADMIN, SECRETARY |
| `PATCH` | `/api/course/:id` | ADMIN, SECRETARY |
| `DELETE` | `/api/course/:id` | ADMIN, SECRETARY |
| `POST` | `/api/course/populate` | ADMIN |

La rotta `GET /course/teacher/:teacherId/session/:sessionId` è la principale usata dal portale docente per caricare i corsi disponibili in una sessione.

---

## ExamEntity

`src/entities/exam.entity.ts`

Rappresenta una prenotazione esame. Nucleo del sistema.

```typescript
@Entity()
@Unique(['session', 'degree', 'examDate'])   // 1 esame per giorno per (sessione + degree)
export class ExamEntity {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'date' }) examDate: string;
  @Column({ type: 'timestamp', nullable: true }) startTime: string;
  @Column({ type: 'timestamp', nullable: true }) endTime: string;

  @ManyToOne(() => CourseEntity, { eager: true, onDelete: 'RESTRICT' })
  course: CourseEntity;

  @ManyToOne(() => SessionEntity, { eager: true, onDelete: 'RESTRICT' })
  session: SessionEntity;

  @ManyToOne(() => TeacherEntity, { eager: true, onDelete: 'RESTRICT' })
  teacher: TeacherEntity;

  @ManyToOne(() => DegreeEntity, { eager: true, onDelete: 'RESTRICT' })
  degree: DegreeEntity;
}
```

### ExamService — Logica di validazione (`create` e `update`)

`src/services/exam.service.ts`

Il cuore del sistema. La validazione in `create()` applica tutte le regole di business:

1. **Sessione valida** — la sessione esiste
2. **Corso valido** — il corso esiste ed appartiene al docente corrente
3. **Degree valido** — il degree esiste
4. **MacroArea compatibile** — il `degree.macroArea` corrisponde al `session.macroArea`
5. **Corso disponibile per degree** — il corso è assegnato a quel degree
6. **Limite esami docente** — `conteggioEsamiDocente < session.examLimit`
7. **Data esame valida** — niente sabato/domenica, la data è nel range `[startDate, endDate]` della sessione
8. **Finestra inserimento aperta** — oggi è nel range `[startInsertDate, endInsertDate]`
9. **No conflitti** — nessun esame esiste già per `(session, degree, examDate)`

Per `update()`:
- Può modificare solo i propri esami
- Stesse validazioni di `create()` (eccetto appartenenza corso)

Per `remove()`:
- Il docente può cancellare solo i propri esami, solo durante la finestra inserimento
- ADMIN e SECRETARY bypassano il vincolo della finestra inserimento

### ExamController — Rotte

| Metodo | Rotta | Auth |
|--------|-------|------|
| `GET` | `/api/exam?sessionId=&degreeId=&teacherId=` | JwtAuthGuard |
| `GET` | `/api/exam/:id` | JwtAuthGuard |
| `POST` | `/api/exam` | TEACHER |
| `PATCH` | `/api/exam/:id` | TEACHER |
| `DELETE` | `/api/exam/:id` | TEACHER, ADMIN, SECRETARY |
| `POST` | `/api/exam/populate` | ADMIN |

---

## DTOs

| DTO | Campi principali |
|-----|-----------------|
| `CreateExamDto` | sessionId, courseId, degreeId, examDate (ISO date), startTime, endTime |
| `UpdateExamDto` | examDate?, startTime?, endTime? (tutti opzionali) |
| `CreateSessionDto` | startDate, endDate, startInsertDate, endInsertDate, macroArea, examLimit, degreeIds? |
| `UpdateSessionDto` | Tutti opzionali |
| `CreateCourseDto` | courseName, teacherId, degreeIds? |
| `CreateDegreeDto` | degreeName, degreeType, degreeYear, macroArea |
| `CreateTeacherDto` | name, surname, email, password |

## Interfacce risposta (per il frontend)

`src/interfaces/`

```typescript
interface ExamListItem {
  id: number;
  examDate: string;
  startTime: string;
  endTime: string;
  course: { id: number; courseName: string };
  session: { id: number; startDate: string; endDate: string };
  teacher: { id: number; name: string; surname: string };
  degree: { id: number; degreeName: string; degreeType: DegreeType; degreeYear: DegreeYear };
}
```

Interfacce analoghe per `SessionListItem`, `CourseListItem`, `TeacherListItem`, `DegreeListItem`.

## Moduli feature

Ogni entità ha un proprio modulo NestJS:

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([ExamEntity, SessionEntity, CourseEntity, DegreeEntity, TeacherEntity])],
  providers: [ExamService, ExamRepository, ...],
  controllers: [ExamController],
  exports: [ExamService],
})
export class ExamModule {}
```

Tutti i moduli feature sono importati in `AppModule`.
