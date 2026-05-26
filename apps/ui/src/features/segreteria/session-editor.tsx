import { useState, useEffect } from 'react';
import { fetchApi } from '../shared/api';
import { fmtItDate, countSessionDays, parseISO, startOfMonth, endOfMonth, toISO, isWeekend } from '../shared/date-utils';
import { HOLIDAYS_2026, fmtMonth, fmtDow } from '../shared/data';
import type { Session, Degree } from '../shared/types';

interface SessionEditorProps {
  session: Session;
  allDegrees: Degree[];
  onSaved: () => void;
}

export function SessionEditor({ session, allDegrees, onSaved }: SessionEditorProps) {
  const [startDate, setStartDate] = useState(session.startDate);
  const [endDate, setEndDate] = useState(session.endDate);
  const [startInsertDate, setStartInsertDate] = useState(session.startInsertDate);
  const [endInsertDate, setEndInsertDate] = useState(session.endInsertDate);
  const [degreeIds, setDegreeIds] = useState<number[]>(session.degrees.map(d => d.id));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setStartDate(session.startDate);
    setEndDate(session.endDate);
    setStartInsertDate(session.startInsertDate);
    setEndInsertDate(session.endInsertDate);
    setDegreeIds(session.degrees.map(d => d.id));
    setError(null);
    setSuccess(false);
  }, [session.id]);

  function toggleDegree(id: number) {
    setDegreeIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await fetchApi(`/session/${session.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ startDate, endDate, startInsertDate, endInsertDate, degreeIds }),
      });
      setSuccess(true);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // mini-calendar for session period preview
  const previewDate = parseISO(startDate);
  const calStart = startOfMonth(previewDate);
  const calEnd = endOfMonth(previewDate);
  const sessStart = parseISO(startDate);
  const sessEnd = parseISO(endDate);
  const firstDow = (calStart.getDay() + 6) % 7;
  const miniCells: (Date | null)[] = [...Array(firstDow).fill(null)];
  for (const d = new Date(calStart); d <= calEnd; d.setDate(d.getDate() + 1)) {
    miniCells.push(new Date(d));
  }
  while (miniCells.length % 7 !== 0) miniCells.push(null);

  const sessionDays = countSessionDays({ startDate, endDate, id: 0, startInsertDate, endInsertDate, degrees: [] });

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {error && (
        <div className="banner warn" style={{ marginBottom: 16 }}>
          <span className="pill">Errore</span>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="banner ok" style={{ marginBottom: 16 }}>
          <span className="pill">OK</span>
          <span>Sessione aggiornata.</span>
        </div>
      )}

      <div className="config-grid">
        <div style={{ paddingRight: 32 }}>
          <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, margin: '0 0 18px' }}>
            Sessione #{session.id}
          </h3>

          <div style={{ marginBottom: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Periodo sessione</div>
            <div className="field-row">
              <div className="field">
                <label>Inizio sessione</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
              </div>
              <div className="field">
                <label>Fine sessione</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Finestra inserimento</div>
            <div className="field-row">
              <div className="field">
                <label>Apertura inserimenti</label>
                <input type="date" value={startInsertDate} onChange={e => setStartInsertDate(e.target.value)} required />
              </div>
              <div className="field">
                <label>Chiusura inserimenti</label>
                <input type="date" value={endInsertDate} onChange={e => setEndInsertDate(e.target.value)} required />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Corsi di laurea</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {allDegrees.map(d => (
                <label key={d.id} className="toggle" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={degreeIds.includes(d.id)}
                    onChange={() => toggleDegree(d.id)}
                  />
                  <span className="switch" />
                  <span style={{ fontSize: 12.5 }}>{d.degreeName} {d.degreeYear}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Salvataggio…' : 'Salva modifiche'}
          </button>
        </div>

        {/* Mini-calendar preview */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Anteprima — {fmtMonth[previewDate.getMonth()]} {previewDate.getFullYear()}
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 2, fontSize: 11, textAlign: 'center',
          }}>
            {fmtDow.map(d => (
              <div key={d} style={{ color: 'var(--ink-3)', fontFamily: "'Geist Mono',monospace", fontSize: 9, padding: '4px 0', letterSpacing: '0.05em' }}>
                {d}
              </div>
            ))}
            {miniCells.map((d, i) => {
              if (!d) return <div key={i} />;
              const iso = toISO(d);
              const inSession = d >= sessStart && d <= sessEnd;
              const weekend = isWeekend(d);
              const holiday = !!HOLIDAYS_2026[iso];
              let bg = 'transparent';
              let color = 'var(--ink-3)';
              if (!inSession) { bg = 'transparent'; color = 'var(--ink-4)'; }
              else if (weekend) { bg = 'var(--weekend)'; color = 'var(--ink-3)'; }
              else if (holiday) { bg = 'var(--gold-soft)'; color = 'var(--gold)'; }
              else { bg = 'var(--accent-soft)'; color = 'var(--accent)'; }
              return (
                <div key={i} style={{
                  padding: '5px 2px', borderRadius: 4,
                  background: bg, color, fontWeight: inSession && !weekend && !holiday ? 600 : 400,
                }}>
                  {d.getDate()}
                </div>
              );
            })}
          </div>

          {/* Timeline */}
          <div style={{ marginTop: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-3)' }}>
                <span>Apertura inserimenti</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>{fmtItDate(startInsertDate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-3)' }}>
                <span>Inizio sessione</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>{fmtItDate(startDate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-3)' }}>
                <span>Chiusura inserimenti</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>{fmtItDate(endInsertDate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-3)' }}>
                <span>Fine sessione</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>{fmtItDate(endDate)}</span>
              </div>
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
                <span>Giorni lavorativi</span>
                <span>{sessionDays}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
