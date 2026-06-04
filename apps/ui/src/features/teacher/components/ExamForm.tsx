import { useState } from 'react';
import { CourseListItem, ExamListItem } from '@server/entities/frontend';
import { isWeekend, fmtTime } from '../../../utils/date.utils';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { DatePicker } from '../../../components/ui/date-picker';

interface ExamFormProps {
    mode: 'add' | 'edit';
    initialDate: string;
    sessionStart: string;
    sessionEnd: string;
    course: CourseListItem;
    byDate: Record<string, ExamListItem>;
    holidays: Record<string, string>;
    exam?: ExamListItem;
    onCancel: () => void;
    onSave: (data: { examDate: string; startTime: string; endTime: string }) => Promise<void>;
    onDelete?: () => Promise<void>;
}

export function ExamForm({
    mode,
    initialDate,
    sessionStart,
    sessionEnd,
    course,
    byDate,
    holidays,
    exam,
    onCancel,
    onSave,
    onDelete,
}: ExamFormProps) {
    const [examDate, setExamDate] = useState(initialDate || '');
    const [startHour, setStartHour] = useState(exam ? fmtTime(exam.startTime) : '09:00');
    const [endHour, setEndHour] = useState(exam ? fmtTime(exam.endTime) : '11:00');
    const [err, setErr] = useState('');
    const [saving, setSaving] = useState(false);

    function validate(): string {
        if (!examDate) return 'Seleziona una data.';
        if (examDate < sessionStart || examDate > sessionEnd)
            return 'La data è fuori dal periodo della sessione.';
        const d = new Date(examDate + 'T12:00:00');
        if (isWeekend(d)) return 'Sabato e domenica non sono ammessi.';
        if (holidays[examDate]) return `${holidays[examDate]} è una festività esclusa.`;
        const existing = byDate[examDate];
        if (existing && existing.id !== exam?.id)
            return `Esiste già un appello in questa data per ${course.degree.degreeName}.`;
        return '';
    }

    async function handleSubmit(e: { preventDefault(): void }) {
        e.preventDefault();
        const v = validate();
        if (v) { setErr(v); return; }
        setSaving(true);
        try {
            await onSave({
                examDate,
                startTime: `${examDate}T${startHour}:00`,
                endTime: `${examDate}T${endHour}:00`,
            });
        } catch (ex) {
            setErr(ex instanceof Error ? ex.message : 'Errore durante il salvataggio.');
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!onDelete) return;
        if (!window.confirm('Cancellare questo appello?')) return;
        setSaving(true);
        try {
            await onDelete();
        } catch {
            setErr('Errore durante la cancellazione.');
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <Label>Data</Label>
                    <DatePicker
                        value={examDate}
                        min={sessionStart}
                        max={sessionEnd}
                        onChange={(v) => { setExamDate(v); setErr(''); }}
                        filterDate={(d) => !isWeekend(d) && !holidays[d.toISOString().slice(0, 10)]}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="start-hour">Ora inizio</Label>
                    <Input
                        id="start-hour"
                        type="time"
                        value={startHour}
                        step={1800}
                        onChange={(e) => setStartHour(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="end-hour">Ora fine</Label>
                    <Input
                        id="end-hour"
                        type="time"
                        value={endHour}
                        step={1800}
                        onChange={(e) => setEndHour(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label>Materia</Label>
                    <Input value={course.courseName} disabled className="bg-muted text-muted-foreground" />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label>Corso di laurea · Anno</Label>
                <Input
                    value={`${course.degree.degreeName} · Anno ${course.degree.degreeYear}`}
                    disabled
                    className="bg-muted text-muted-foreground"
                />
            </div>

            {err && (
                <div className="text-[12px] text-destructive flex items-center gap-1.5">
                    ⚠ {err}
                </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-1 pt-3.5 border-t border-border -mx-6 px-6">
                {mode === 'edit' && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        disabled={saving}
                        className="mr-auto border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                        Cancella appello
                    </Button>
                )}
                <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                    Annulla
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving ? 'Salvataggio…' : mode === 'edit' ? 'Salva modifiche' : 'Conferma appello'}
                </Button>
            </div>
        </form>
    );
}
