import { useState } from 'react';
import { CourseListItem, ExamListItem } from '@server/entities/frontend';
import { isWeekend, fmtTime } from '../../../utils/date.utils';

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

    async function handleSubmit(e: React.FormEvent) {
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

    const inputCls =
        'w-full px-3 py-[9px] rounded-lg border border-line bg-paper text-ink text-[13.5px] focus:outline-none focus:border-ink-2';

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-ink-3">Data</label>
                    <input
                        type="date"
                        className={inputCls}
                        value={examDate}
                        min={sessionStart}
                        max={sessionEnd}
                        onChange={(e) => { setExamDate(e.target.value); setErr(''); }}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-ink-3">Ora inizio</label>
                    <input
                        type="time"
                        className={inputCls}
                        value={startHour}
                        step={1800}
                        onChange={(e) => setStartHour(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-ink-3">Ora fine</label>
                    <input
                        type="time"
                        className={inputCls}
                        value={endHour}
                        step={1800}
                        onChange={(e) => setEndHour(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-ink-3">Materia</label>
                    <input
                        type="text"
                        className={inputCls + ' bg-[#e3e9f3] text-ink-3'}
                        value={course.courseName}
                        disabled
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-ink-3">Corso di laurea · Anno</label>
                <input
                    type="text"
                    className={inputCls + ' bg-[#e3e9f3] text-ink-3'}
                    value={`${course.degree.degreeName} · Anno ${course.degree.degreeYear}`}
                    disabled
                />
            </div>

            {err && (
                <div className="text-[12px] text-accent flex items-center gap-1.5">
                    ⚠ {err}
                </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-1 pt-3.5 border-t border-line -mx-6 px-6">
                {mode === 'edit' && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={saving}
                        className="mr-auto text-[12px] px-2.5 py-1.5 rounded-md border border-accent-soft text-accent hover:bg-accent-soft disabled:opacity-40"
                    >
                        Cancella appello
                    </button>
                )}
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="text-[13.5px] font-medium px-4 py-2.5 rounded-lg border border-line bg-paper text-ink hover:bg-bg disabled:opacity-40"
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="text-[13.5px] font-medium px-4 py-2.5 rounded-lg bg-accent text-white hover:bg-accent-2 disabled:opacity-40"
                >
                    {saving ? 'Salvataggio…' : mode === 'edit' ? 'Salva modifiche' : 'Conferma appello'}
                </button>
            </div>
        </form>
    );
}
