import { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '../shared/api';
import { fmtItDate, countSessionDays } from '../shared/date-utils';
import { StatusPill } from '../shared/ui/components';
import { PlusIcon } from '../shared/ui/icons';
import { SessionEditor } from './session-editor';
import { CorsiTable } from './corsi-table';
import { FestivitaPanel } from './festivita-panel';
import type { Session, Degree } from '../shared/types';

type Tab = 'sessioni' | 'corsi' | 'festivita';

function sessionStatus(s: Session): 'open' | 'draft' | 'closed' {
  const now = new Date().toISOString().slice(0, 10);
  if (now >= s.startInsertDate && now <= s.endInsertDate) return 'open';
  if (now < s.startInsertDate) return 'draft';
  return 'closed';
}

export function SegreteriaPage() {
  const [tab, setTab] = useState<Tab>('sessioni');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    Promise.all([
      fetchApi<Session[]>('/session'),
      fetchApi<Degree[]>('/degree'),
    ]).then(([s, d]) => {
      setSessions(s);
      setDegrees(d);
      if (s.length > 0 && !selectedSession) setSelectedSession(s[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCreateSession() {
    setCreating(true);
    setCreateError(null);
    try {
      const d = new Date();
      const fmt = (x: Date) => x.toISOString().slice(0, 10);
      const startDate = fmt(d);
      const insertEnd = new Date(d); insertEnd.setDate(d.getDate() + 14);
      const end = new Date(d); end.setDate(d.getDate() + 30);
      const newSession = await fetchApi<Session>('/session', {
        method: 'POST',
        body: JSON.stringify({
          startDate,
          endDate: fmt(end),
          startInsertDate: startDate,
          endInsertDate: fmt(insertEnd),
        }),
      });
      loadData();
      setSelectedSession(newSession);
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page">
      <main className="main" style={{ maxWidth: '100%' }}>
        <h1 className="page-title serif">
          Pannello <em>Segreteria</em>
        </h1>
        <p className="page-subtitle">Gestione sessioni, corsi di laurea e festività</p>

        <div className="tabs">
          <button className={tab === 'sessioni' ? 'active' : ''} onClick={() => setTab('sessioni')}>
            Sessioni
          </button>
          <button className={tab === 'corsi' ? 'active' : ''} onClick={() => setTab('corsi')}>
            Corsi di laurea
          </button>
          <button className={tab === 'festivita' ? 'active' : ''} onClick={() => setTab('festivita')}>
            Festività
          </button>
        </div>

        {tab === 'sessioni' && (
          <>
            {createError && (
              <div className="banner warn" style={{ marginBottom: 16 }}>
                <span className="pill">Errore</span>
                <span>{createError}</span>
              </div>
            )}

            <div className="cards-grid" style={{ marginBottom: 32 }}>
              {sessions.map(s => {
                const status = sessionStatus(s);
                const days = countSessionDays(s);
                const isSelected = selectedSession?.id === s.id;
                return (
                  <div
                    key={s.id}
                    className={`session-card${isSelected ? ' active' : ''}`}
                    onClick={() => setSelectedSession(s)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="tag">#{s.id}</div>
                    <h3>
                      {fmtItDate(s.startDate)} —<br />
                      {fmtItDate(s.endDate)}
                    </h3>
                    <dl>
                      <dt>Inizio ins.</dt>
                      <dd>{fmtItDate(s.startInsertDate)}</dd>
                      <dt>Fine ins.</dt>
                      <dd>{fmtItDate(s.endInsertDate)}</dd>
                    </dl>
                    <div className="countbar">
                      <div className="nums">
                        <div>
                          <b>{days}</b>
                          <span>Giorni</span>
                        </div>
                        <div>
                          <b>{s.degrees.length}</b>
                          <span>Corsi L.</span>
                        </div>
                      </div>
                      <StatusPill status={status} />
                    </div>
                  </div>
                );
              })}

              <button
                className="add-session-card"
                onClick={handleCreateSession}
                disabled={creating}
              >
                <div className="plus">
                  <PlusIcon size={16} />
                </div>
                {creating ? 'Creazione…' : 'Nuova sessione'}
              </button>
            </div>

            {selectedSession && (
              <SessionEditor
                key={selectedSession.id}
                session={selectedSession}
                allDegrees={degrees}
                onSaved={() => {
                  loadData();
                }}
              />
            )}
          </>
        )}

        {tab === 'corsi' && (
          <CorsiTable degrees={degrees} onChanged={loadData} />
        )}

        {tab === 'festivita' && (
          <FestivitaPanel />
        )}
      </main>
    </div>
  );
}
