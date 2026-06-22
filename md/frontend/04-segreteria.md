# Frontend — Portale Segreteria

**Percorso**: `apps/ui/src/features/segreteria/`

## Struttura

```
segreteria/
  pages/
    segreteria.page.tsx    ← container + redirect a /sessioni
    sessioni.page.tsx      ← gestione sessioni d'esame
    corsi.page.tsx         ← gestione corsi (materie assegnate a degree)
    materie.page.tsx       ← gestione corsi di laurea (DegreeEntity)
    docenti.page.tsx       ← gestione docenti
  components/
    sessione-modal.tsx     ← form create/edit sessione
    corso-modal.tsx        ← form create/edit corso
    materia-modal.tsx      ← form create/edit degree
    docente-modal.tsx      ← form create/edit docente
  segreteria.api.ts        ← API client per tutte le sezioni
```

## Pagine

### SessioniPage

`pages/sessioni.page.tsx`

Tabella delle sessioni d'esame. Operazioni:
- **Crea** → apre `SessioneModal` vuoto
- **Modifica** → apre `SessioneModal` pre-popolato
- **Elimina** → confirm dialog → `DELETE /api/session/:id`

Campi visibili in tabella: periodo esami (start/end), finestra inserimento (start/end), macroArea, examLimit, degree assegnati.

### CorsiPage

`pages/corsi.page.tsx`

Tabella dei corsi (CourseEntity). Operazioni CRUD tramite `CorsoModal`.

Campi visibili: nome corso, docente, corso di laurea.

### MateriePage

`pages/materie.page.tsx`

Tabella dei corsi di laurea (DegreeEntity). Operazioni CRUD tramite `MateriaModal`.

Campi visibili: nome, tipo (LT/LM/LMCU), anno, macroArea.

### DocentiPage

`pages/docenti.page.tsx`

Tabella docenti (TeacherEntity). Operazioni CRUD tramite `DocenteModal`.

Campi visibili: nome, cognome, email, ruolo.

## Componenti Modal

Tutti i modal seguono lo stesso pattern:

```typescript
interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;      // callback per ricaricare la lista dopo salvataggio
  item?: Entity | null;     // se null → modalità create; se presente → edit
}
```

### SessioneModal (`sessione-modal.tsx`)

Campi form:
| Campo | Tipo |
|-------|------|
| startDate | date picker |
| endDate | date picker |
| startInsertDate | date picker |
| endInsertDate | date picker |
| macroArea | select enum |
| examLimit | number input |
| degrees | multi-select (checkbox lista degrees disponibili) |

Submit: `createSession()` o `updateSession()` da `segreteria.api.ts`.

### CorsoModal (`corso-modal.tsx`)

Campi form:
| Campo | Tipo |
|-------|------|
| courseName | text input |
| teacherId | select (lista docenti) |
| degreeId | select (lista degrees) |

### MateriaModal (`materia-modal.tsx`)

Campi form:
| Campo | Tipo |
|-------|------|
| degreeName | text input |
| degreeType | select (LT / LM / LMCU) |
| degreeYear | select (I / II / ... / VII) |
| macroArea | select enum |

### DocenteModal (`docente-modal.tsx`)

Campi form:
| Campo | Tipo |
|-------|------|
| name | text input |
| surname | text input |
| email | email input |
| password | password input (solo in create) |

## segreteria.api.ts

`segreteria.api.ts` (~248 righe)

Tutte le funzioni usano `Authorization: Bearer <token>`.

### Teachers

```typescript
fetchTeachers(): Promise<TeacherListItem[]>
fetchTeacherById(id: number): Promise<TeacherListItem>
createTeacher(dto: CreateTeacherDto): Promise<TeacherListItem>
updateTeacher(id: number, dto: UpdateTeacherDto): Promise<TeacherListItem>
deleteTeacher(id: number): Promise<void>
```

### Degrees

```typescript
fetchDegrees(): Promise<DegreeListItem[]>
fetchDegreeById(id: number): Promise<DegreeListItem>
createDegree(dto: CreateDegreeDto): Promise<DegreeListItem>
updateDegree(id: number, dto: UpdateDegreeDto): Promise<DegreeListItem>
deleteDegree(id: number): Promise<void>
```

### Courses

```typescript
fetchCourses(): Promise<CourseListItem[]>
fetchCourseById(id: number): Promise<CourseListItem>
createCourse(dto: CreateCourseDto): Promise<CourseListItem>
updateCourse(id: number, dto: UpdateCourseDto): Promise<CourseListItem>
deleteCourse(id: number): Promise<void>
```

### Sessions

```typescript
fetchSessions(): Promise<SessionListItem[]>
createSession(dto: CreateSessionDto): Promise<SessionListItem>
updateSession(id: number, dto: UpdateSessionDto): Promise<SessionListItem>
deleteSession(id: number): Promise<void>
```
