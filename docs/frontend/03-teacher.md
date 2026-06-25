# Frontend — Portale Docente

**Percorso**: `apps/ui/src/features/teacher/`

## Flusso utente

```
Login come TEACHER
  → /docente/esami (EsamiPage)
  → Sidebar: seleziona sessione → seleziona corso
  → Calendario: visualizza tutti gli esami del degree
  → Click su giorno libero → ExamForm (modal add)
  → Click su proprio esame → ExamForm (modal edit)
  → Banner: mostra stato finestra inserimento + limite esami
```

## EsamiPage

`pages/esami.page.tsx` — componente principale (~263 righe)

### State

```typescript
const [sessions, setSessions] = useState<SessionListItem[]>([]);
const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
const [courses, setCourses] = useState<CourseListItem[]>([]);
const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
const [exams, setExams] = useState<ExamListItem[]>([]);
const [viewMonth, setViewMonth] = useState<Date>(new Date());
const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
const [selectedDate, setSelectedDate] = useState<string | null>(null);
const [editingExam, setEditingExam] = useState<ExamListItem | null>(null);
```

### Effetti (useEffect)

1. **Carica sessioni** al mount → `fetchSessionsByTeacherId(userId)` → imposta prima sessione come selezionata
2. **Carica corsi** quando cambia sessione → `fetchCoursesByTeacherAndSession(teacherId, sessionId)`
3. **Carica esami** quando cambia corso → `fetchExamsBySessionAndDegree(sessionId, degreeId)` (usa `course.degree.id`)
4. **Build holidays map** → calcola mappa `{ [dateISO]: true }` per i giorni festivi/weekend

### Logica calendario

- Giorni Sab/Dom: non selezionabili
- Giorni con esame già presente per quel degree: bloccati (tooltip mostra chi ha prenotato)
- Docente può vedere tutti gli esami ma modificare solo i propri
- Click su giorno libero (se finestra aperta) → `modalMode = 'add'`
- Click su proprio esame → `modalMode = 'edit'`

### Vincoli applicati lato frontend (pre-validation)

- Finestra inserimento chiusa → nessun click accettato → banner rosso
- Limite esami raggiunto → pulsante aggiungi disabilitato → banner giallo
- Giorno weekend → non cliccabile

*(Il backend ri-valida tutto indipendentemente)*

## Componenti

### SessionSidebar

`components/SessionSidebar.tsx`

Doppio dropdown:
- **Sessione**: lista sessioni disponibili per il docente
- **Corso**: lista corsi del docente nella sessione selezionata

Quando cambia la selezione, emette callback verso `EsamiPage` per triggerare il ricaricamento dati.

### CalendarGrid

`components/CalendarGrid.tsx`

Griglia mensile (7 colonne × N settimane).

Per ogni giorno:
- Mostra badge con nome corso se c'è un esame
- Colore diverso per: esame proprio, esame altrui, weekend, oggi
- Click handler delegato a `EsamiPage`

### ExamForm

`components/ExamForm.tsx`

Form usato sia in modalità `add` che `edit`:

| Campo | Tipo | Note |
|-------|------|------|
| examDate | date | Pre-popolato dal giorno cliccato |
| startTime | time | Orario inizio esame |
| endTime | time | Orario fine esame |

In modalità `edit` i campi sono pre-popolati con i valori dell'esame esistente.

Submit:
- `add` → `createExam(dto)` → `POST /api/exam`
- `edit` → `updateExam(id, dto)` → `PATCH /api/exam/:id`

### Modal

`components/Modal.tsx`

Wrapper generico per dialog. Usato da `EsamiPage` per contenere `ExamForm`.

### InsertionBanner

`components/InsertionBanner.tsx`

Banner in cima alla pagina. Tre stati:
- **Verde**: finestra inserimento aperta, esami rimanenti disponibili
- **Giallo**: finestra aperta ma limite esami raggiunto
- **Rosso**: finestra inserimento chiusa (data odierna fuori range)

### MyExamsList

`components/MyExamsList.tsx`

Lista a destra del calendario con i propri esami prenotati nella sessione corrente. Ogni item ha pulsante cancella (chiama `deleteExam(id)`).

## teacher.api.ts

`teacher.api.ts`

```typescript
// Sessioni
fetchSessionsByTeacherId(teacherId: number): Promise<SessionListItem[]>
// GET /api/session/teacher/:id

// Corsi
fetchCoursesByTeacherAndSession(teacherId: number, sessionId: number): Promise<CourseListItem[]>
// GET /api/course/teacher/:teacherId/session/:sessionId

// Esami
fetchExamsBySessionAndDegree(sessionId: number, degreeId: number): Promise<ExamListItem[]>
// GET /api/exam?sessionId=..&degreeId=..

createExam(dto: CreateExamDto): Promise<ExamListItem>
// POST /api/exam

updateExam(id: number, dto: UpdateExamDto): Promise<ExamListItem>
// PATCH /api/exam/:id

deleteExam(id: number): Promise<void>
// DELETE /api/exam/:id
```

Tutti usano `Authorization: Bearer <token>` da `localStorage.access_token`.
