import { useState, useEffect } from 'react';
import { fetchCurrentUser } from '../auth/auth.api';
import { featchSessionsByTeacherId, featchCoursesByTeacherAndSession } from './teacher.api';
import { SessionListItem } from '../../../../../libs/server/entities/src/interfaces/session-list-item';
import { CourseListItem } from '../../../../../libs/server/entities/src/interfaces/course-list-item';
import { DegreeType } from '../../../../../libs/server/entities/src/entities/dto/degree.enum';

const DEGREE_TYPE_LABEL: Record<DegreeType, string> = {
    [DegreeType.BACHELOR]: 'Triennale',
    [DegreeType.MASTER]: 'Magistrale',
    [DegreeType.SINGLE_CYCLE]: 'Magistrale a ciclo unico',
};

function formatDateRange(start: Date, end: Date): string {
    const s = new Date(start);
    const e = new Date(end);
    const month = (d: Date) => d.toLocaleDateString('it-IT', { month: 'short' });
    const year = e.getFullYear();
    return `${month(s)}-${month(e)} ${year}`;
}

export function EsamiPage() {
    const [sessions, setSessions] = useState<SessionListItem[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<number | ''>('');
    const [userId, setUserId] = useState<number | null>(null);
    const [courses, setCourses] = useState<CourseListItem[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');

    useEffect(() => {
        fetchCurrentUser()
            .then((user) => {
                setUserId(user.id);
                return featchSessionsByTeacherId(user.id);
            })
            .then(setSessions)
            .catch(() => setSessions([]));
    }, []);

    useEffect(() => {
        if (userId === null || selectedSessionId === '') {
            setCourses([]);
            setSelectedCourseId('');
            return;
        }
        featchCoursesByTeacherAndSession(userId, selectedSessionId as number)
            .then(setCourses)
            .catch(() => setCourses([]));
    }, [userId, selectedSessionId]);

  return (
    <div className="flex flex-1 min-h-0">
      {/* Barra di sinistra */}
      <aside className="w-[248px] shrink-0 border-r border-line bg-paper overflow-y-auto p-5 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
            Sessione
          </h4>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value === '' ? '' : +e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-line text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-paper shadow-sm"
          >
            <option value="">— seleziona —</option>
            {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                    {s.macroArea}: {formatDateRange(s.startDate, s.endDate)}
                </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
            Corso di laurea
          </h4>
          <div className="flex flex-col gap-2">
            {courses.length === 0 ? (
              <p className="text-[12px] text-ink-3 m-0">
                {selectedSessionId ? 'Nessun corso disponibile.' : 'Seleziona prima una sessione.'}
              </p>
            ) : (
              courses.map((course) => {
                const sel = course.id === selectedCourseId;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`w-full text-left flex items-start gap-2.5 p-3 rounded-[10px] border transition-colors ${
                      sel
                        ? 'border-accent bg-accent-soft ring-1 ring-inset ring-accent'
                        : 'border-line bg-paper hover:border-ink-3 hover:bg-[#f0f5fc]'
                    }`}
                  >
                    <span className={`mt-0.5 w-4 h-4 rounded-full border-[1.5px] shrink-0 flex items-center justify-center ${sel ? 'border-accent' : 'border-ink-4'}`}>
                      {sel && <span className="w-2 h-2 rounded-full bg-accent" />}
                    </span>
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-serif text-[17px] leading-tight text-ink">{course.courseName}</span>
                      <span className="text-[12.5px] text-ink-2">
                        {course.degree.degreeName} · Anno {course.degree.degreeYear}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg text-ink-2 mt-0.5 self-start">
                        {DEGREE_TYPE_LABEL[course.degree.degreeType]}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
            Legenda
          </h4>
          <div className="flex flex-col gap-2 text-[12.5px] text-ink-2">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-[3px] bg-accent shrink-0" />
              Il tuo appello
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-[3px] bg-paper border border-ink-3 shrink-0" />
              Appello di un collega
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-[3px] bg-paper border border-dashed border-ink-4 shrink-0" />
              Data disponibile
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-[3px] bg-[#dde4ef] shrink-0" />
              Sabato / Domenica
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-[3px] bg-gold-soft shrink-0" />
              Festività
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
            Festività
          </h4>
          <p className="text-[12.5px] text-ink-3 m-0">
            Lista delle festività nel periodo della sessione.
          </p>
        </div>
      </aside>

      {/* Area centrale calendario */}
      <main className="flex-1 min-w-0 overflow-y-auto px-9 py-7">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
              Pianificazione appelli
            </p>
            <h1 className="font-serif text-[38px] leading-tight tracking-tight m-0 mt-0.5">
              Calendario <em className="italic text-accent">—</em>
            </h1>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Nuovo appello
          </button>
        </div>

        {/* Placeholder calendario */}
        <div className="rounded-xl border border-line bg-paper flex items-center justify-center min-h-[420px] text-ink-3 text-sm font-mono">
          Calendario — seleziona sessione e corso di laurea
        </div>
      </main>

      {/* Barra di destra */}
      <aside className="w-[280px] shrink-0 border-l border-line bg-paper overflow-y-auto p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
              I miei appelli
            </p>
            <div className="font-serif text-[22px] leading-tight mt-0.5">
              0 pianificati
            </div>
          </div>
        </div>

        <div className="text-center py-8 px-3.5 text-ink-3 border border-dashed border-line rounded-lg text-sm">
          <span className="font-serif text-[22px] text-ink-2 block mb-1">
            Nessun appello
          </span>
          Clicca una data libera sul calendario per aggiungere il tuo primo appello.
        </div>
      </aside>
    </div>
  );
}
