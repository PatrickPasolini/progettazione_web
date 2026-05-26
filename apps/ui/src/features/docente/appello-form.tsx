import { useState, useEffect } from 'react';
import { Modal } from '../shared/ui/components';
import { fetchApi } from '../shared/api';
import type { Course, Exam, Session, Degree } from '../shared/types';

interface AppelloFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  session: Session;
  degree: Degree;
  date?: string;
  exam?: Exam;
}

export function AppelloForm({ open, onClose, onSaved, session, degree, date, exam }: AppelloFormProps) {
  const isEdit = !!exam;

  const [courseId, setCourseId] = useState<number | ''>(exam?.course.id ?? '');
  const [examDate, setExamDate] = useState(date ?? exam?.examDate ?? '');
  const [startTime, setStartTime] = useState(exam?.startTime ?? '09:00');
  const [endTime, setEndTime] = useState(exam?.endTime ?? '11:00');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetchApi<Course[]>('/course').then(setCourses).catch(() => setCourses([]));
  }, [open]);

  useEffect(() => {
    if (open) {
      setCourseId(exam?.course.id ?? '');
      setExamDate(date ?? exam?.examDate ?? '');
      setStartTime(exam?.startTime ?? '09:00');
      setEndTime(exam?.endTime ?? '11:00');
      setError(null);
    }
  }, [open, exam, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const body = {
        sessionId: session.id,
        courseId: Number(courseId),
        degreeId: degree.id,
        examDate,
        startTime,
        endTime,
      };
      if (isEdit) {
        await fetchApi(`/exam/${exam.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await fetchApi('/exam', { method: 'POST', body: JSON.stringify(body) });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!exam) return;
    if (!confirm('Eliminare questo appello?')) return;
    setLoading(true);
    try {
      await fetchApi(`/exam/${exam.id}`, { method: 'DELETE' });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifica appello' : 'Nuovo appello'}
      subtitle={`${degree.degreeName} · Anno ${degree.degreeYear}`}
      foot={
        <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'space-between' }}>
          <div>
            {isEdit && (
              <button type="button" className="btn-ghost danger" onClick={handleDelete} disabled={loading}>
                Elimina
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn secondary" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" form="appello-form" className="btn primary" disabled={loading || !courseId}>
              {loading ? 'Salvataggio…' : isEdit ? 'Salva modifiche' : 'Crea appello'}
            </button>
          </div>
        </div>
      }
    >
      <form id="appello-form" onSubmit={handleSubmit}>
        {error && (
          <div className="banner warn" style={{ marginBottom: 16 }}>
            <span className="pill">Errore</span>
            <span>{error}</span>
          </div>
        )}

        <div className="field">
          <label>Data</label>
          <input
            type="date"
            value={examDate}
            onChange={e => setExamDate(e.target.value)}
            min={session.startDate}
            max={session.endDate}
            required
          />
        </div>

        <div className="field">
          <label>Corso</label>
          <select value={courseId} onChange={e => setCourseId(Number(e.target.value))} required>
            <option value="">— seleziona —</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.courseName}</option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Ora inizio</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          </div>
          <div className="field">
            <label>Ora fine</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
          </div>
        </div>

        <div className="field" style={{ marginTop: 4 }}>
          <label>Sessione</label>
          <input type="text" value={`Sessione #${session.id} (${session.startDate} → ${session.endDate})`} disabled />
        </div>
        <div className="field">
          <label>Corso di laurea</label>
          <input type="text" value={`${degree.degreeName} · Anno ${degree.degreeYear}`} disabled />
        </div>
      </form>
    </Modal>
  );
}
