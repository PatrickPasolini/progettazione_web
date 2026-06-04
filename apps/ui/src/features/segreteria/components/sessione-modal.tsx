import { useState } from 'react';
import {
  MacroArea,
  SessionListItem,
  CreateSessionDto,
} from '@server/entities/frontend';
import { createSession, updateSession } from '../segreteria.api';

interface SessioneModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  session: SessionListItem | null;
  onClose: () => void;
  onSave: () => void;
}

// Converte Date → "YYYY-MM-DD" per <input type="date">
function toISO(d: Date | string): string {
  return new Date(d).toISOString().slice(0, 10);
}

function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 block w-full px-3 py-2.5 bg-paper border border-line text-ink text-sm rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
    />
  );
}

// --- Campo per intervallo tra due date ---

function DateRangePicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
}: {
  startValue: string;
  endValue: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <DateField value={startValue} onChange={onStartChange} />
      <span className="text-ink-3 text-sm">→</span>
      <DateField value={endValue} onChange={onEndChange} />
    </div>
  );
}

// --- SessioneModal ---

export function SessioneModal({
  isOpen,
  mode,
  session,
  onClose,
  onSave,
}: SessioneModalProps) {
  const [macroArea, setMacroArea] = useState<MacroArea | ''>(
    session?.macroArea ? (session.macroArea as MacroArea) : ''
  );
  const [startDate, setStartDate] = useState(
    session?.startDate ? toISO(session.startDate) : ''
  );
  const [endDate, setEndDate] = useState(
    session?.endDate ? toISO(session.endDate) : ''
  );
  const [startInsertDate, setStartInsertDate] = useState(
    session?.startInsertDate ? toISO(session.startInsertDate) : ''
  );
  const [endInsertDate, setEndInsertDate] = useState(
    session?.endInsertDate ? toISO(session.endInsertDate) : ''
  );
  const [examLimit, setExamLimit] = useState<number>(session?.examLimit ?? 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!macroArea || !startDate || !endDate || !startInsertDate || !endInsertDate) {
      setError('Compila tutti i campi');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (startDate < today) {
      setError('La data di inizio sessione non può essere nel passato');
      return;
    }
    if (endDate < startDate) {
      setError('La data di fine sessione deve essere dopo l\'inizio');
      return;
    }
    if (startInsertDate < today) {
      setError('La data di inizio inserimento non può essere nel passato');
      return;
    }
    if (endInsertDate < startInsertDate) {
      setError("La data di fine inserimento deve essere dopo l'inizio");
      return;
    }
    if (endInsertDate >= startDate) {
      setError("La finestra di inserimento deve terminare prima dell'inizio della sessione");
      return;
    }
    if (!examLimit || examLimit < 1) {
      setError('Il limite appelli deve essere almeno 1');
      return;
    }
    const payload: CreateSessionDto = {
      macroArea: macroArea as MacroArea,
      startDate,
      endDate,
      startInsertDate,
      endInsertDate,
      examLimit,
    };
    try {
      setLoading(true);
      setError(null);
      if (mode === 'create') {
        await createSession(payload);
      } else if (session) {
        await updateSession(session.id, payload);
      }
      onSave();
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-paper rounded-xl p-6 w-full max-w-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl m-0 mb-6">
          {mode === 'create' ? 'Nuova sessione' : 'Modifica sessione'}
        </h2>

        <div className="flex flex-col gap-5">
          {/* Macro Area */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-2 uppercase tracking-wide">
              Macro Area
            </label>
            <select
              value={macroArea}
              onChange={(e) => setMacroArea(e.target.value as MacroArea)}
              className="w-full px-3 py-2 rounded-lg border border-line text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-paper shadow-sm"
            >
              <option value="">Seleziona area…</option>
              {Object.values(MacroArea).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Periodo sessione */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink-2 uppercase tracking-wide">
              Periodo sessione
            </label>
            <DateRangePicker
              startValue={startDate}
              endValue={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
          </div>

          {/* Finestra inserimento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink-2 uppercase tracking-wide">
              Finestra inserimento
            </label>
            <DateRangePicker
              startValue={startInsertDate}
              endValue={endInsertDate}
              onStartChange={setStartInsertDate}
              onEndChange={setEndInsertDate}
            />
          </div>

          {/* Limite appelli */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-2 uppercase tracking-wide">
              Limite appelli per docente
            </label>
            <input
              type="number"
              min={1}
              value={examLimit}
              onChange={(e) => setExamLimit(Number(e.target.value))}
              className="w-24 px-3 py-2.5 bg-paper border border-line text-ink text-sm rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-line">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-line text-ink-2 text-sm hover:bg-line-2 transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvataggio…' : mode === 'create' ? 'Crea' : 'Salva'}
          </button>
        </div>
      </div>
    </div>
  );
}
