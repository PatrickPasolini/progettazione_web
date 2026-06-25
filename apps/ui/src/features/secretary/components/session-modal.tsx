import { useState } from 'react';
import { MacroArea, SessionListItem, CreateSessionDto } from '@server/entities/frontend';
import { createSession, updateSession } from '../secretary.api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { DatePicker } from '../../../components/ui/date-picker';

interface SessionModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  session: SessionListItem | null;
  onClose: () => void;
  onSave: () => void;
}

function toISO(d: Date | string): string {
  return new Date(d).toISOString().slice(0, 10);
}

function DateRangePicker({
  startValue, endValue, onStartChange, onEndChange, maxEnd,
}: {
  startValue: string; endValue: string;
  onStartChange: (v: string) => void; onEndChange: (v: string) => void;
  maxEnd?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <DatePicker value={startValue} onChange={onStartChange} max={endValue || maxEnd} placeholder="Inizio…" />
      <span className="text-muted-foreground text-sm shrink-0">→</span>
      <DatePicker value={endValue} onChange={onEndChange} min={startValue} max={maxEnd} placeholder="Fine…" />
    </div>
  );
}

export function SessionModal({ isOpen, mode, session, onClose, onSave }: SessionModalProps) {
  const [macroArea, setMacroArea] = useState<MacroArea | ''>((session?.macroArea as MacroArea) ?? '');
  const [startDate, setStartDate] = useState(session?.startDate ? toISO(session.startDate) : '');
  const [endDate, setEndDate] = useState(session?.endDate ? toISO(session.endDate) : '');
  const [startInsertDate, setStartInsertDate] = useState(session?.startInsertDate ? toISO(session.startInsertDate) : '');
  const [endInsertDate, setEndInsertDate] = useState(session?.endInsertDate ? toISO(session.endInsertDate) : '');
  const [examLimit, setExamLimit] = useState<number>(session?.examLimit ?? 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!macroArea || !startDate || !endDate || !startInsertDate || !endInsertDate) {
      setError('Compila tutti i campi'); return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (startDate < today) { setError('La data di inizio sessione non può essere nel passato'); return; }
    if (endDate < startDate) { setError("La data di fine sessione deve essere dopo l'inizio"); return; }
    if (startInsertDate < today) { setError('La data di inizio inserimento non può essere nel passato'); return; }
    if (endInsertDate < startInsertDate) { setError("La data di fine inserimento deve essere dopo l'inizio"); return; }
    if (endInsertDate >= startDate) { setError("La finestra di inserimento deve terminare prima dell'inizio della sessione"); return; }
    if (!examLimit || examLimit < 1) { setError('Il limite appelli deve essere almeno 1'); return; }

    const payload: CreateSessionDto = { macroArea: macroArea as MacroArea, startDate, endDate, startInsertDate, endInsertDate, examLimit };
    try {
      setLoading(true); setError(null);
      if (mode === 'create') await createSession(payload);
      else if (session) await updateSession(session.id, payload);
      onSave(); onClose();
    } catch (e: any) {
      setError(e.message ?? 'Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuova sessione' : 'Modifica sessione'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Macro Area</Label>
            <select
              value={macroArea}
              onChange={(e) => setMacroArea(e.target.value as MacroArea)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Seleziona area…</option>
              {Object.values(MacroArea).map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Periodo sessione</Label>
            <DateRangePicker startValue={startDate} endValue={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Finestra inserimento</Label>
            <DateRangePicker startValue={startInsertDate} endValue={endInsertDate} onStartChange={setStartInsertDate} onEndChange={setEndInsertDate} maxEnd={startDate || undefined} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Limite appelli per docente</Label>
            <Input
              type="number"
              min={1}
              value={examLimit}
              onChange={(e) => setExamLimit(Number(e.target.value))}
              className="w-24"
            />
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={loading}>Annulla</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvataggio…' : mode === 'create' ? 'Crea' : 'Salva'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
