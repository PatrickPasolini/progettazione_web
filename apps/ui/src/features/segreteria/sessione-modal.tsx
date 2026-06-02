import { useEffect, useRef, useState } from 'react';
import {
  MacroArea,
  SessionListItem,
  CreateSessionDto,
} from '@server/entities/frontend';
import { createSession, updateSession } from './segreteria.api';
import { CalendarPicker, dayAfter } from './calendar-picker';

interface SessioneModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  session: SessionListItem | null;
  onClose: () => void;
  onSave: () => void;
}

function toISO(d: Date | string): string {
  return new Date(d).toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function DateField({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  disabled,
  calendarId,
  openCalendar,
  setOpenCalendar,
  highlightDate,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  calendarId: string;
  openCalendar: string | null;
  setOpenCalendar: (id: string | null) => void;
  highlightDate?: string;
}) {
  const isOpen = openCalendar === calendarId;
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && calendarRef.current) {
      calendarRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isOpen]);

  const toggle = () => {
    if (!disabled) setOpenCalendar(isOpen ? null : calendarId);
  };

  const handleSelect = (v: string) => {
    onChange(v);
    setOpenCalendar(null);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-ink-2 mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors
          ${disabled
            ? 'bg-line/30 border-line text-ink-4 cursor-not-allowed'
            : isOpen
              ? 'border-accent bg-paper text-ink shadow-sm'
              : value
                ? 'border-line bg-paper text-ink hover:border-accent/50'
                : 'border-line bg-paper text-ink-4 hover:border-accent/50'
          }
        `}
      >
        <span className={value ? 'font-mono tracking-wide text-ink' : 'text-ink-4'}>
          {value ? formatDate(value) : 'Seleziona data'}
        </span>
        <span className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {isOpen && (
        <div ref={calendarRef} className="mt-2 p-3 border border-line rounded-xl bg-paper shadow-sm">
          <CalendarPicker
            value={value}
            onChange={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
            highlightDate={highlightDate}
          />
        </div>
      )}
    </div>
  );
}

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCalendar, setOpenCalendar] = useState<string | null>(null);

  const insertionComplete = Boolean(startInsertDate && endInsertDate);
  const sessionUnlocked = mode === 'edit' || insertionComplete;
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (startDate && endInsertDate && startDate <= endInsertDate) {
      setStartDate('');
    }
  }, [endInsertDate, startDate]);

  useEffect(() => {
    if (endDate && (!startDate || endDate <= startDate)) {
      setEndDate('');
    }
  }, [startDate, endDate]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!macroArea || !startDate || !endDate || !startInsertDate || !endInsertDate) {
      setError('Compila tutti i campi');
      return;
    }
    const payload: CreateSessionDto = {
      macroArea: macroArea as MacroArea,
      startDate,
      endDate,
      startInsertDate,
      endInsertDate,
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
        className="bg-paper rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl m-0 mb-6 shrink-0">
          {mode === 'create' ? 'Nuova sessione' : 'Modifica sessione'}
        </h2>

        <div className="flex flex-col gap-6 overflow-y-auto">
          {/* Macro Area */}
          <div className="flex flex-col gap-1 shrink-0">
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

          {/* Finestra Inserimento */}
          <div className="flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink-3">
                Finestra inserimento
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <div className="border border-line rounded-xl p-4 bg-paper space-y-4">
              <DateField
                label="Inizio inserimento"
                value={startInsertDate}
                onChange={setStartInsertDate}
                minDate={todayStr}
                maxDate={endInsertDate || undefined}
                calendarId="startInsert"
                openCalendar={openCalendar}
                setOpenCalendar={setOpenCalendar}
              />
              <DateField
                label="Fine inserimento"
                value={endInsertDate}
                onChange={setEndInsertDate}
                minDate={startInsertDate ? dayAfter(startInsertDate) : undefined}
                highlightDate={startInsertDate || undefined}
                calendarId="endInsert"
                openCalendar={openCalendar}
                setOpenCalendar={setOpenCalendar}
              />
            </div>
          </div>

          {/* Periodo Sessione */}
          <div className="flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink-3">
                Periodo sessione
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <div className={`border rounded-xl p-4 bg-paper space-y-4 ${sessionUnlocked ? 'border-line' : 'border-dashed border-ink-4'}`}>
              {!sessionUnlocked && (
                <p className="text-xs text-ink-4 text-center -mt-1 mb-2">
                  Completa la finestra di inserimento per sbloccare
                </p>
              )}

              <DateField
                label="Inizio sessione"
                value={startDate}
                onChange={setStartDate}
                minDate={endInsertDate ? dayAfter(endInsertDate) : undefined}
                disabled={!sessionUnlocked}
                calendarId="startSession"
                openCalendar={openCalendar}
                setOpenCalendar={setOpenCalendar}
              />
              <DateField
                label="Fine sessione"
                value={endDate}
                onChange={setEndDate}
                minDate={startDate ? dayAfter(startDate) : undefined}
                highlightDate={startDate || undefined}
                disabled={!startDate}
                calendarId="endSession"
                openCalendar={openCalendar}
                setOpenCalendar={setOpenCalendar}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500 font-medium shrink-0">{error}</p>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-line shrink-0">
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
