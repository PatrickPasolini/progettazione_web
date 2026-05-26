import { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '../shared/api';
import { degreeLabel, HOLIDAYS_2026 } from '../shared/data';
import { fmtItDate, countSessionDays, daysRemaining } from '../shared/date-utils';
import { CalendarGrid } from './calendar-grid';
import { AppelloForm } from './appello-form';
import type { Session, Degree, Exam, CurrentUser } from '../shared/types';

export function DocentePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedDegreeId, setSelectedDegreeId] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formDate, setFormDate] = useState<string | undefined>();
  const [formExam, setFormExam] = useState<Exam | undefined>();

  useEffect(() => {
    Promise.all([
      fetchApi<CurrentUser>('/users/me'),
      fetchApi<Session[]>('/session'),
      fetchApi<Degree[]>('/degree'),
    ]).then(([u, s, d]) => {
      setUser(u);
      setSessions(s);
      setDegrees(d);
      if (s.length > 0) setSelectedSessionId(s[0].id);
      if (d.length > 0) setSelectedDegreeId(d[0].id);
    }).catch(() => {});
  }, []);

  const loadExams = useCallback(() => {
    if (!selectedSessionId || !selectedDegreeId) return;
    fetchApi<Exam[]>(`/exam?sessionId=${selectedSessionId}&degreeId=${selectedDegreeId}`)
      .then(setExams)
      .catch(() => setExams([]));
  }, [selectedSessionId, selectedDegreeId]);

  useEffect(() => { loadExams(); }, [loadExams]);

  const selectedSession = sessions.find(s => s.id === selectedSessionId) ?? null;
  const selectedDegree = degrees.find(d => d.id === selectedDegreeId) ?? null;

  function handleCellClick(date: string, exam?: Exam) {
    setFormDate(date);
    setFormExam(exam);
    setFormOpen(true);
  }

  const myExams = exams.filter(e => e.teacher.id === user?.id);

  const now = new Date().toISOString().slice(0, 10);
  const insertionOpen = selectedSession
    ? now >= selectedSession.startInsertDate && now <= selectedSession.endInsertDate
    : false;

  const sessionDays = selectedSession ? countSessionDays(selectedSession) : 0;
  const remaining = selectedSession ? daysRemaining(selectedSession.endInsertDate) : 0;

  const holidays = Object.entries(HOLIDAYS_2026);

  return (
    <div className="page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="side-section">
          <h4>Sessione</h4>
          <div className="field">
            <label>Sessione esami</label>
            <select
              value={selectedSessionId ?? ''}
              onChange={e => setSelectedSessionId(Number(e.target.value))}
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  Sessione #{s.id} ({s.startDate})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Corso di laurea</label>
            <select
              value={selectedDegreeId ?? ''}
              onChange={e => setSelectedDegreeId(Number(e.target.value))}
            >
              {degrees.map(d => (
                <option key={d.id} value={d.id}>
                  {degreeLabel(d.degreeName, d.degreeType, d.degreeYear)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="side-section">
          <h4>Legenda</h4>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-swatch swatch-mine" /> Mio appello
            </div>
            <div className="legend-item">
              <span className="legend-swatch swatch-other" /> Collega
            </div>
            <div className="legend-item">
              <span className="legend-swatch swatch-weekend" /> Weekend
            </div>
            <div className="legend-item">
              <span className="legend-swatch swatch-holiday" /> Festività
            </div>
            <div className="legend-item">
              <span className="legend-swatch swatch-free" /> Libero
            </div>
          </div>
        </div>

        <div className="side-section">
          <h4>Festività</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {holidays.map(([iso, name]) => (
              <div key={iso} style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                <span style={{ color: 'var(--ink-3)', fontFamily: "'Geist Mono', monospace", fontSize: 10.5 }}>
                  {fmtItDate(iso)}
                </span>
                <br />
                {name}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <h1 className="page-title serif">
          Calendario <em>Appelli</em>
        </h1>
        {selectedDegree && (
          <p className="page-subtitle">{degreeLabel(selectedDegree.degreeName, selectedDegree.degreeType, selectedDegree.degreeYear)}</p>
        )}

        {selectedSession && (
          <div className={`banner${insertionOpen ? ' ok' : ' warn'}`}>
            <span className="pill">{insertionOpen ? 'Inserimento aperto' : 'Inserimento chiuso'}</span>
            <span>
              {insertionOpen
                ? `Puoi inserire appelli fino al ${fmtItDate(selectedSession.endInsertDate)} · ${remaining} giorni rimasti`
                : `La finestra di inserimento è ${now < selectedSession.startInsertDate ? 'non ancora aperta' : 'chiusa'}`
              }
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)' }}>
              {sessionDays} giorni lavorativi
            </span>
          </div>
        )}

        {selectedSession && selectedDegree && (
          <CalendarGrid
            session={selectedSession}
            exams={exams}
            currentUserId={user?.id ?? -1}
            onCellClick={handleCellClick}
          />
        )}
      </main>

      {/* Right rail */}
      <aside className="right-rail">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span className="eyebrow">I miei appelli</span>
          <button
            className="btn primary"
            style={{ fontSize: 12, padding: '6px 12px' }}
            onClick={() => { setFormDate(undefined); setFormExam(undefined); setFormOpen(true); }}
          >
            + Nuovo
          </button>
        </div>

        {myExams.length === 0 ? (
          <div className="empty-rail">
            <span className="serif">Nessun appello</span>
            Clicca su una data del calendario per aggiungere il tuo appello.
          </div>
        ) : (
          myExams.map(exam => (
            <div key={exam.id} className="appello-card">
              <div className="ac-date">{exam.examDate.split('-').reverse().join('/')}</div>
              <div className="ac-day">{new Date(exam.examDate + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long' })}</div>
              <div className="ac-course">{exam.course.courseName}</div>
              <div className="ac-meta">{exam.startTime}–{exam.endTime}</div>
              <div className="ac-actions">
                <button
                  className="btn-ghost"
                  onClick={() => { setFormDate(exam.examDate); setFormExam(exam); setFormOpen(true); }}
                >
                  Modifica
                </button>
                <button
                  className="btn-ghost danger"
                  onClick={async () => {
                    if (!confirm('Eliminare questo appello?')) return;
                    try {
                      await fetchApi(`/exam/${exam.id}`, { method: 'DELETE' });
                      loadExams();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }}
                >
                  Elimina
                </button>
              </div>
            </div>
          ))
        )}
      </aside>

      {selectedSession && selectedDegree && formOpen && (
        <AppelloForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSaved={loadExams}
          session={selectedSession}
          degree={selectedDegree}
          date={formDate}
          exam={formExam}
        />
      )}
    </div>
  );
}
