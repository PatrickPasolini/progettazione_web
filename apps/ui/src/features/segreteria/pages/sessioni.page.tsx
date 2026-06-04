import { useEffect, useState } from 'react';
import { SessionListItem } from '@server/entities/frontend';
import { fetchSessions } from '../segreteria.api';
import { SessioneModal } from '../components/sessione-modal';

// draft: creazione sessione, submission: inserimento exam dei prof, ongoing: sessione in corso , closed: sessione finita
type SessionStatus = 'draft' | 'submission' | 'ongoing' | 'closed';

const MONTHS_IT = [
  'Gen',
  'Feb',
  'Mar',
  'Apr',
  'Mag',
  'Giu',
  'Lug',
  'Ago',
  'Set',
  'Ott',
  'Nov',
  'Dic',
];

function getStatus(s: SessionListItem): SessionStatus {
  const today = new Date().toISOString().slice(0, 10);
  const end = new Date(s.endDate).toISOString().slice(0, 10);
  const start = new Date(s.startDate).toISOString().slice(0, 10);
  const iStart = new Date(s.startInsertDate).toISOString().slice(0, 10);
  const iEnd = new Date(s.endInsertDate).toISOString().slice(0, 10);

  if (today > end) return 'closed';
  if (today >= iStart && today <= iEnd) return 'submission';
  if (today >= start && today <= end) return 'ongoing';
  return 'draft';
}

function formatDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

function getSessionLabel(s: SessionListItem) {
  const start = new Date(s.startDate);
  const end = new Date(s.endDate);
  if (start.getMonth() === end.getMonth()) {
    return `${MONTHS_IT[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${MONTHS_IT[start.getMonth()]} · ${
    MONTHS_IT[end.getMonth()]
  } ${start.getFullYear()}`;
}

// --- StatusPill ---

function StatusPill({ status }: { status: SessionStatus }) {
  const map: Record<SessionStatus, { cls: string; label: string }> = {
    draft: { cls: 'bg-gold-soft text-gold', label: 'Bozza' },
    submission: { cls: 'bg-accent-soft text-accent', label: 'Inserimento' },
    ongoing: { cls: 'bg-teal-soft text-teal', label: 'In corso' },
    closed: { cls: 'bg-line text-ink-3', label: 'Chiusa' },
  };
  const { cls, label } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10.5px] uppercase tracking-wide ${cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

// --- SessionCard ---

function SessionCard({
  session,
  onOpen,
}: {
  session: SessionListItem;
  onOpen: () => void;
}) {
  const status = getStatus(session);

  const isDraft = status === 'draft';

  return (
    <div
      className={`bg-paper border border-line rounded-xl p-5 relative transition-colors ${
        isDraft ? 'cursor-pointer hover:border-accent-soft' : 'cursor-default'
      }`}
      onClick={isDraft ? onOpen : undefined}
    >
      {/* Label mese/anno in alto a destra */}
      <span className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-wider text-ink-3 bg-line-2 px-2 py-1 rounded-full">
        {getSessionLabel(session)}
      </span>

      {/* Macroarea */}
      <h3 className="text-2xl font-semibold m-0 mb-3 pr-24 leading-tight">
        {session.macroArea}
      </h3>

      {/* date + stato */}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm m-0">
        <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-3 pt-0.5">
          Sessione
        </dt>
        <dd className="m-0 tabular-nums text-ink-2">
          {formatDate(session.startDate)} → {formatDate(session.endDate)}
        </dd>

        <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-3 pt-0.5">
          Inserimenti
        </dt>
        <dd className="m-0 tabular-nums text-ink-2">
          {formatDate(session.startInsertDate)} →{' '}
          {formatDate(session.endInsertDate)}
        </dd>

        <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-3 pt-0.5">
          Stato
        </dt>
        <dd className="m-0">
          <StatusPill status={status} />
        </dd>
      </dl>

      {/* bottone Modifica — attivo solo in bozza */}
      <div className="mt-4 pt-4 border-t border-line-2 flex justify-end">
        <button
          disabled={status !== 'draft'}
          className="bg-accent text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          Modifica
        </button>
      </div>
    </div>
  );
}

// --- SessioniPage ---

export function SessioniPage() {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedSession, setSelectedSession] =
    useState<SessionListItem | null>(null);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Errore nel caricamento delle sessioni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedSession(null);
    setIsModalOpen(true);
  };

  const openEditModal = (session: SessionListItem) => {
    setModalMode('edit');
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  return (
    <div>
      {/* Header pagina */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold"> Sessioni d'esame</h1>
          <p className="text-sm text-gray-600">
            Gestione delle sessioni d'esame
          </p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="bg-accent text-white hover:bg-accent-2 transition-colors
                                   px-4 py-2 rounded-lg font-medium shadow-sm"
        >
          + Nuova Sessione
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-ink-3 text-sm">Caricamento sessioni...</p>}

      {/* Errore */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Griglia card */}
      {!loading && !error && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3.5">
          {/* Card "aggiungi nuova sessione" */}
          <button
            onClick={() => openCreateModal()}
            className="border border-dashed border-line rounded-xl p-5 min-h-[200px] flex flex-col items-center justify-center gap-2 text-ink-3 hover:bg-paper hover:border-ink-3 hover:text-ink transition-colors text-sm"
          >
            <span className="w-8 h-8 rounded-full bg-line-2 border border-line flex items-center justify-center text-lg">
              +
            </span>
            <b className="text-ink">Nuova sessione d'esame</b>
            <span className="text-center">
              Imposta date di inizio/fine sessione
            </span>
          </button>

          {/*Lista delle card sessioni — ordinate per stato*/}
          {[...sessions]
            .sort((a, b) => {
              const order: Record<SessionStatus, number> = {
                draft: 0,
                submission: 1,
                ongoing: 2,
                closed: 3,
              };
              return order[getStatus(a)] - order[getStatus(b)];
            })
            .map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onOpen={() => openEditModal(s)}
              />
            ))}
        </div>
      )}

      {isModalOpen && (
        <SessioneModal
          isOpen={isModalOpen}
          mode={modalMode}
          session={selectedSession}
          onClose={closeModal}
          onSave={loadSessions}
        />
      )}
    </div>
  );
}
