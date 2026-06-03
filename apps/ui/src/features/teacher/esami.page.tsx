import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchCurrentUser } from '../auth/auth.api';
import {
    featchSessionsByTeacherId,
    featchCoursesByTeacherAndSession,
    fetchExamsBySessionAndDegree,
    createExam,
    updateExam,
    deleteExam,
} from './teacher.api';
import { SessionListItem } from '../../../../../libs/server/entities/src/interfaces/session-list-item';
import { CourseListItem } from '../../../../../libs/server/entities/src/interfaces/course-list-item';
import { ExamListItem } from '../../../../../libs/server/entities/src/interfaces/exam-list-item';
import { DegreeType } from '../../../../../libs/server/entities/src/entities/dto/degree.enum';

// ─── Constants ────────────────────────────────────────────────────────────────

const HOLIDAYS_2026: Record<string, string> = {
    '2026-01-01': 'Capodanno',
    '2026-01-06': 'Epifania',
    '2026-04-06': 'Lunedì di Pasqua',
    '2026-04-25': 'Festa della Liberazione',
    '2026-05-01': 'Festa del Lavoro',
    '2026-06-02': 'Festa della Repubblica',
    '2026-08-15': 'Ferragosto',
    '2026-11-01': 'Ognissanti',
    '2026-12-08': 'Immacolata Concezione',
    '2026-12-25': 'Natale',
    '2026-12-26': 'Santo Stefano',
};

const DOW_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const MONTH_LABELS_IT = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

const DOW_FULL = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

const DEGREE_TYPE_LABEL: Record<DegreeType, string> = {
    [DegreeType.BACHELOR]: 'Triennale',
    [DegreeType.MASTER]: 'Magistrale',
    [DegreeType.SINGLE_CYCLE]: 'Magistrale a ciclo unico',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function isWeekend(d: Date): boolean {
    return d.getDay() === 0 || d.getDay() === 6;
}

function startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
    return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function dateKey(v: unknown): string {
    return String(v).substring(0, 10);
}

function fmtTime(v: unknown): string {
    const d = new Date(v as string);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function formatDateRange(start: Date, end: Date): string {
    const s = new Date(start);
    const e = new Date(end);
    const month = (d: Date) => d.toLocaleDateString('it-IT', { month: 'short' });
    const year = e.getFullYear();
    return `${month(s)}-${month(e)} ${year}`;
}

function countSessionDays(session: SessionListItem): number {
    const s = new Date(session.startDate);
    const e = new Date(session.endDate);
    let n = 0;
    const d = new Date(s);
    while (d <= e) {
        if (!isWeekend(d) && !HOLIDAYS_2026[toISO(d)]) n++;
        d.setDate(d.getDate() + 1);
    }
    return n;
}

function daysRemaining(isoEnd: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(isoEnd);
    end.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((end.getTime() - today.getTime()) / 86400000));
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalState =
    | { mode: 'add'; date: string }
    | { mode: 'edit'; date: string; exam: ExamListItem }
    | null;

// ─── CalendarGrid ─────────────────────────────────────────────────────────────

interface CalendarGridProps {
    viewMonth: Date;
    setViewMonth: (d: Date) => void;
    sessionStart: Date;
    sessionEnd: Date;
    insertOpen: boolean;
    byDate: Record<string, ExamListItem>;
    userId: number | null;
    onCellClick: (iso: string, existing: ExamListItem | null) => void;
    stats: { mine: number; others: number; days: number };
}

function CalendarGrid({
    viewMonth,
    setViewMonth,
    sessionStart,
    sessionEnd,
    insertOpen,
    byDate,
    userId,
    onCellClick,
    stats,
}: CalendarGridProps) {
    const first = startOfMonth(viewMonth);
    const startOffset = (first.getDay() + 6) % 7; // Monday-first
    const cells: Date[] = [];
    const gridStart = new Date(first);
    gridStart.setDate(gridStart.getDate() - startOffset);
    for (let i = 0; i < 42; i++) {
        const d = new Date(gridStart);
        d.setDate(d.getDate() + i);
        cells.push(d);
    }
    // hide trailing entirely-out-of-month week
    while (
        cells.length > 35 &&
        cells[cells.length - 1].getMonth() !== viewMonth.getMonth() &&
        cells[cells.length - 7].getMonth() !== viewMonth.getMonth()
    ) {
        cells.splice(cells.length - 7, 7);
    }

    const prevMonth = addMonths(viewMonth, -1);
    const nextMonth = addMonths(viewMonth, 1);
    const sStartMonth = startOfMonth(sessionStart);
    const sEndMonth = startOfMonth(sessionEnd);
    const canPrev = prevMonth >= sStartMonth;
    const canNext = nextMonth <= sEndMonth;

    const todayISO = toISO(new Date());

    return (
        <div>
            {/* Calendar header */}
            <div className="flex items-center gap-4 mb-[18px]">
                <div className="inline-flex gap-0.5">
                    <button
                        onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                        disabled={!canPrev}
                        className="w-8 h-8 bg-paper border border-line rounded-lg text-ink-2 grid place-items-center hover:bg-[#e3e9f3] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7.5 2L3.5 6l4 4" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                        disabled={!canNext}
                        className="w-8 h-8 bg-paper border border-line rounded-lg text-ink-2 grid place-items-center hover:bg-[#e3e9f3] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
                            <path d="M7.5 2L3.5 6l4 4" />
                        </svg>
                    </button>
                </div>
                <div className="font-serif text-[26px] leading-none">
                    {MONTH_LABELS_IT[viewMonth.getMonth()]}{' '}
                    <span className="text-ink-3">{viewMonth.getFullYear()}</span>
                </div>
                <div className="ml-auto flex gap-6 text-[12.5px] text-ink-3">
                    <span><b className="text-ink font-semibold">{stats.days}</b> giorni utili</span>
                    <span><b className="text-ink font-semibold">{stats.others}</b> appelli colleghi</span>
                    <span><b className="text-accent font-semibold">{stats.mine}</b> miei appelli</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-px bg-line border border-line rounded-xl overflow-hidden">
                {/* Day-of-week headers */}
                {DOW_LABELS.map((d) => (
                    <div
                        key={d}
                        className="bg-[#e3e9f3] px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-ink-3"
                    >
                        {d}
                    </div>
                ))}

                {/* Day cells */}
                {cells.map((d, i) => {
                    const iso = toISO(d);
                    const outMonth = d.getMonth() !== viewMonth.getMonth();
                    const inSession =
                        iso >= toISO(sessionStart) && iso <= toISO(sessionEnd);
                    const we = isWeekend(d);
                    const hol = HOLIDAYS_2026[iso];
                    const exam = byDate[iso];
                    const isToday = iso === todayISO;
                    const isMine = exam && exam.teacher.id === userId;

                    let cellCls =
                        'min-h-[140px] p-2.5 flex flex-col gap-1.5 relative transition-colors duration-100 ';

                    if (outMonth) {
                        cellCls += 'bg-bg cursor-default';
                    } else if (!inSession) {
                        cellCls += 'bg-bg cursor-not-allowed';
                    } else if (we) {
                        cellCls += 'bg-[#dde4ef] cursor-not-allowed';
                    } else if (hol) {
                        cellCls += 'cursor-not-allowed';
                    } else {
                        cellCls += insertOpen ? 'bg-paper hover:bg-[#f0f5fc] cursor-pointer' : 'bg-paper cursor-default';
                    }

                    const cellStyle = hol && !outMonth
                        ? { background: 'repeating-linear-gradient(45deg, #f3e7c9, #f3e7c9 4px, #f8fafd 4px, #f8fafd 8px)' }
                        : undefined;

                    return (
                        <div
                            key={i}
                            className={cellCls}
                            style={cellStyle}
                            onClick={() => {
                                if (outMonth) return;
                                onCellClick(iso, exam ?? null);
                            }}
                        >
                            {/* Cell header: date number + label */}
                            <div className="flex items-center justify-between">
                                <span
                                    className={
                                        isToday && !outMonth
                                            ? 'w-6 h-6 bg-ink text-paper rounded-full grid place-items-center font-mono text-[13px]'
                                            : 'font-serif text-[18px] leading-none' +
                                              (outMonth ? ' text-ink-4' : '')
                                    }
                                >
                                    {d.getDate()}
                                </span>
                                {!outMonth && we && (
                                    <span className="font-mono text-[9.5px] uppercase tracking-wide text-ink-3">
                                        {d.getDay() === 6 ? 'Sab' : 'Dom'}
                                    </span>
                                )}
                                {!outMonth && hol && (
                                    <span className="font-mono text-[9.5px] uppercase tracking-wide text-gold">
                                        Festivo
                                    </span>
                                )}
                                {!outMonth && !inSession && !we && !hol && (
                                    <span className="font-mono text-[9.5px] uppercase tracking-wide text-ink-3">
                                        fuori sess.
                                    </span>
                                )}
                            </div>

                            {/* Exam chip */}
                            {!outMonth && exam && (
                                <div
                                    className={
                                        'text-[11.5px] px-[7px] py-[5px] rounded-[5px] flex flex-col gap-[1px] leading-[1.25] border-l-[3px] ' +
                                        (isMine
                                            ? 'bg-accent text-paper border-[#0a1f44] border border-l-[3px]'
                                            : 'bg-paper text-ink-2 border-line border border-l-[3px] border-l-ink-4')
                                    }
                                >
                                    <span className={'font-mono text-[9.5px] tracking-wide ' + (isMine ? 'text-white/70' : 'text-ink-3')}>
                                        {fmtTime(exam.startTime)} · {exam.course.courseName.substring(0, 12)}
                                    </span>
                                    <span className={'font-medium ' + (isMine ? 'text-paper' : 'text-ink')}>
                                        {exam.course.courseName}
                                    </span>
                                    <span className={'text-[10.5px] ' + (isMine ? 'text-white/75' : 'text-ink-3')}>
                                        {isMine ? 'tu' : `${exam.teacher.name} ${exam.teacher.surname}`}
                                    </span>
                                </div>
                            )}

                            {/* Add hint on hover (available dates only, insertOpen) */}
                            {!outMonth && inSession && !we && !hol && !exam && insertOpen && (
                                <div className="absolute inset-x-0 bottom-0 h-[22px] hidden items-center justify-center text-[11px] text-ink-3 border-t border-dashed border-line cal-cell-add">
                                    + Aggiungi
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Global style for the hover add hint */}
            <style>{`
                .cal-cell-add { display: none; }
                div:hover > .cal-cell-add { display: flex; }
            `}</style>
        </div>
    );
}

// ─── ExamForm ─────────────────────────────────────────────────────────────────

interface ExamFormProps {
    mode: 'add' | 'edit';
    initialDate: string;
    sessionStart: string;
    sessionEnd: string;
    course: CourseListItem;
    byDate: Record<string, ExamListItem>;
    exam?: ExamListItem;
    onCancel: () => void;
    onSave: (data: { examDate: string; startTime: string; endTime: string }) => Promise<void>;
    onDelete?: () => Promise<void>;
}

function ExamForm({
    mode,
    initialDate,
    sessionStart,
    sessionEnd,
    course,
    byDate,
    exam,
    onCancel,
    onSave,
    onDelete,
}: ExamFormProps) {
    const [examDate, setExamDate] = useState(initialDate || '');
    const [startHour, setStartHour] = useState(
        exam ? fmtTime(exam.startTime) : '09:00',
    );
    const [endHour, setEndHour] = useState(
        exam ? fmtTime(exam.endTime) : '11:00',
    );
    const [err, setErr] = useState('');
    const [saving, setSaving] = useState(false);

    function validate(): string {
        if (!examDate) return 'Seleziona una data.';
        if (examDate < sessionStart || examDate > sessionEnd)
            return 'La data è fuori dal periodo della sessione.';
        const d = new Date(examDate + 'T12:00:00');
        if (isWeekend(d)) return 'Sabato e domenica non sono ammessi.';
        if (HOLIDAYS_2026[examDate]) return `${HOLIDAYS_2026[examDate]} è una festività esclusa.`;
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
        if (!confirm('Cancellare questo appello?')) return;
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

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({
    open,
    onClose,
    title,
    subtitle,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 grid place-items-center"
            onClick={onClose}
        >
            <div
                ref={ref}
                className="bg-paper rounded-2xl shadow-2xl w-[480px] max-w-[92vw] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 pt-[22px] pb-3.5 border-b border-line">
                    <h3 className="font-serif text-[26px] leading-[1.1] m-0">{title}</h3>
                    {subtitle && <p className="mt-1 text-[13px] text-ink-3 m-0">{subtitle}</p>}
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

// ─── EsamiPage ────────────────────────────────────────────────────────────────

export function EsamiPage() {
    const [sessions, setSessions] = useState<SessionListItem[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<number | ''>('');
    const [userId, setUserId] = useState<number | null>(null);
    const [courses, setCourses] = useState<CourseListItem[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
    const [exams, setExams] = useState<ExamListItem[]>([]);
    const [viewMonth, setViewMonth] = useState<Date>(new Date());
    const [modal, setModal] = useState<ModalState>(null);

    // Load user + sessions
    useEffect(() => {
        fetchCurrentUser()
            .then((user) => {
                setUserId(user.id);
                return featchSessionsByTeacherId(user.id);
            })
            .then((data) => {
                setSessions(data);
                if (data.length > 0) setSelectedSessionId(data[0].id);
            })
            .catch(() => setSessions([]));
    }, []);

    // Load courses when session changes
    useEffect(() => {
        if (userId === null || selectedSessionId === '') {
            setCourses([]);
            setSelectedCourseId('');
            return;
        }
        featchCoursesByTeacherAndSession(userId, selectedSessionId as number)
            .then(setCourses)
            .catch(() => setCourses([]));
    }, [userId, selectedSessionId]);

    // Reset viewMonth to session start when session changes
    useEffect(() => {
        const session = sessions.find((s) => s.id === selectedSessionId);
        if (session) setViewMonth(new Date(session.startDate));
    }, [selectedSessionId, sessions]);

    // Load exams when course or session changes
    useEffect(() => {
        if (!selectedCourseId || !selectedSessionId) { setExams([]); return; }
        const course = courses.find((c) => c.id === selectedCourseId);
        if (!course) return;
        fetchExamsBySessionAndDegree(selectedSessionId as number, course.degree.id)
            .then(setExams)
            .catch(() => setExams([]));
    }, [selectedCourseId, selectedSessionId, courses]);

    // ── Derived values ──────────────────────────────────────────────────────

    const selectedSession = sessions.find((s) => s.id === selectedSessionId);
    const selectedCourse = courses.find((c) => c.id === selectedCourseId);

    const today = new Date();
    const insertOpen = selectedSession
        ? today >= new Date(selectedSession.startInsertDate) &&
          today <= new Date(selectedSession.endInsertDate)
        : false;

    const byDate = useMemo(() => {
        const m: Record<string, ExamListItem> = {};
        exams.forEach((e) => { m[dateKey(e.examDate)] = e; });
        return m;
    }, [exams]);

    const myExams = useMemo(
        () =>
            exams
                .filter((e) => e.teacher.id === userId)
                .sort((a, b) => dateKey(a.examDate).localeCompare(dateKey(b.examDate))),
        [exams, userId],
    );

    const daysInSession = useMemo(
        () => (selectedSession ? countSessionDays(selectedSession) : 0),
        [selectedSession],
    );

    const stats = {
        mine: myExams.length,
        others: exams.filter((e) => e.teacher.id !== userId).length,
        days: daysInSession,
    };

    // ── Handlers ────────────────────────────────────────────────────────────

    function onCellClick(iso: string, existing: ExamListItem | null) {
        if (!insertOpen || !selectedCourse) return;
        if (existing) {
            if (existing.teacher.id === userId)
                setModal({ mode: 'edit', date: iso, exam: existing });
        } else {
            setModal({ mode: 'add', date: iso });
        }
    }

    function reloadExams() {
        if (!selectedCourse || !selectedSessionId) return Promise.resolve();
        return fetchExamsBySessionAndDegree(
            selectedSessionId as number,
            selectedCourse.degree.id,
        ).then(setExams);
    }

    async function handleSave(data: { examDate: string; startTime: string; endTime: string }) {
        if (!selectedSession || !selectedCourse) return;
        if (modal?.mode === 'add') {
            await createExam({
                sessionId: selectedSession.id,
                courseId: selectedCourse.id,
                degreeId: selectedCourse.degree.id,
                ...data,
            });
        } else if (modal?.mode === 'edit') {
            await updateExam(modal.exam.id, data);
        }
        setModal(null);
        await reloadExams();
    }

    async function handleDelete() {
        if (modal?.mode !== 'edit') return;
        await deleteExam(modal.exam.id);
        setModal(null);
        await reloadExams();
    }

    // ── Render ──────────────────────────────────────────────────────────────

    const modalSubtitle =
        modal?.mode === 'edit'
            ? `${selectedCourse?.degree.degreeName} · Anno ${selectedCourse?.degree.degreeYear} · ${new Date(modal.date + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}`
            : modal?.date
            ? `${selectedCourse?.degree.degreeName} · ${new Date(modal.date + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}`
            : 'Seleziona una data nel calendario.';

    return (
        <div className="flex flex-1 min-h-0">
            {/* ── Left sidebar ──────────────────────────────────────────── */}
            <aside className="w-[248px] shrink-0 border-r border-line bg-paper overflow-y-auto p-5 flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                    <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
                        Sessione
                    </h4>
                    <select
                        value={selectedSessionId}
                        onChange={(e) =>
                            setSelectedSessionId(e.target.value === '' ? '' : +e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-line text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-paper shadow-sm"
                    >
                        <option value="">— seleziona —</option>
                        {sessions.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.macroArea}: {formatDateRange(s.startDate, s.endDate)}
                            </option>
                        ))}
                    </select>

                    {selectedSession && (
                        <div className="flex flex-col gap-1 text-[12px] text-ink-3 mt-1">
                            <div className="flex justify-between">
                                <span>Periodo</span>
                                <span className="text-ink-2 font-mono text-[11px]">
                                    {new Date(selectedSession.startDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                    {' → '}
                                    {new Date(selectedSession.endDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Inserimenti</span>
                                <span className="text-ink-2 font-mono text-[11px]">
                                    {new Date(selectedSession.startInsertDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                    {' → '}
                                    {new Date(selectedSession.endInsertDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Course/materia picker */}
                <div className="flex flex-col gap-1.5">
                    <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
                        Materia
                    </h4>
                    <div className="flex flex-col gap-2">
                        {courses.length === 0 ? (
                            <p className="text-[12px] text-ink-3 m-0">
                                {selectedSessionId
                                    ? 'Nessun corso disponibile.'
                                    : 'Seleziona prima una sessione.'}
                            </p>
                        ) : (
                            courses.map((course) => {
                                const sel = course.id === selectedCourseId;
                                return (
                                    <button
                                        key={course.id}
                                        type="button"
                                        onClick={() => setSelectedCourseId(course.id)}
                                        className={`w-full text-left flex items-start gap-2.5 p-3 rounded-[10px] border transition-colors ${
                                            sel
                                                ? 'border-accent bg-accent-soft ring-1 ring-inset ring-accent'
                                                : 'border-line bg-paper hover:border-ink-3 hover:bg-[#f0f5fc]'
                                        }`}
                                    >
                                        <span
                                            className={`mt-0.5 w-4 h-4 rounded-full border-[1.5px] shrink-0 flex items-center justify-center ${
                                                sel ? 'border-accent' : 'border-ink-4'
                                            }`}
                                        >
                                            {sel && <span className="w-2 h-2 rounded-full bg-accent" />}
                                        </span>
                                        <span className="flex flex-col gap-0.5 min-w-0">
                                            <span className="font-serif text-[17px] leading-tight text-ink">
                                                {course.courseName}
                                            </span>
                                            <span className="text-[12.5px] text-ink-2">
                                                {course.degree.degreeName} · Anno {course.degree.degreeYear}
                                            </span>
                                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg text-ink-2 mt-0.5 self-start">
                                                {DEGREE_TYPE_LABEL[course.degree.degreeType]}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                    {selectedCourse && (
                        <p className="text-[12px] text-ink-3 m-0 mt-1">
                            È ammesso un solo appello al giorno per CdS+anno.
                        </p>
                    )}
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-2">
                    <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
                        Legenda
                    </h4>
                    <div className="flex flex-col gap-2 text-[12.5px] text-ink-2">
                        <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-[3px] bg-accent shrink-0" />
                            Il tuo appello
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-[3px] bg-paper border border-ink-3 shrink-0" />
                            Appello di un collega
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-[3px] bg-paper border border-dashed border-ink-4 shrink-0" />
                            Data disponibile
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-[3px] bg-[#dde4ef] shrink-0" />
                            Sabato / Domenica
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span
                                className="w-3 h-3 rounded-[3px] shrink-0"
                                style={{
                                    background:
                                        'repeating-linear-gradient(45deg, #f3e7c9, #f3e7c9 3px, #f8fafd 3px, #f8fafd 6px)',
                                }}
                            />
                            Festività
                        </div>
                    </div>
                </div>

                {/* Holidays in session */}
                <div className="flex flex-col gap-2">
                    <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
                        Festività escluse
                    </h4>
                    {selectedSession ? (
                        (() => {
                            const sStart = dateKey(selectedSession.startDate);
                            const sEnd = dateKey(selectedSession.endDate);
                            const inRange = Object.entries(HOLIDAYS_2026).filter(
                                ([iso]) => iso >= sStart && iso <= sEnd,
                            );
                            return inRange.length === 0 ? (
                                <p className="text-[12.5px] text-ink-3 m-0">
                                    Nessuna festività nel periodo.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-1.5 text-[12.5px] text-ink-2">
                                    {inRange.map(([iso, name]) => (
                                        <div key={iso} className="flex justify-between">
                                            <span>{name}</span>
                                            <span className="font-mono text-[11px] text-ink-3">
                                                {new Date(iso + 'T12:00:00').toLocaleDateString('it-IT', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()
                    ) : (
                        <p className="text-[12.5px] text-ink-3 m-0">
                            Seleziona una sessione.
                        </p>
                    )}
                </div>
            </aside>

            {/* ── Main calendar area ────────────────────────────────────── */}
            <main className="flex-1 min-w-0 overflow-y-auto px-9 py-7">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h1 className="font-serif text-[38px] leading-tight tracking-tight m-0 mt-0.5">
                            Calendario{' '}
                            <em className="italic text-accent">
                                {selectedSession ? `— ${selectedSession.macroArea}` : '—'}
                            </em>
                        </h1>
                        <p className="text-[14px] text-ink-3 m-0 mt-0.5">
                            Visualizza gli appelli inseriti dai colleghi e pianifica i tuoi nelle date libere.
                        </p>
                    </div>
                    <button
                        disabled={!insertOpen || !selectedCourse}
                        onClick={() => setModal({ mode: 'add', date: '' })}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-2"
                    >
                        + Nuovo appello
                    </button>
                </div>

                {/* Insertion window banner */}
                {selectedSession && (
                    <div
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl border mb-[22px] ${
                            insertOpen
                                ? 'bg-teal-soft border-[#b8d0cb]'
                                : 'bg-paper border-line'
                        }`}
                    >
                        <span
                            className={`font-mono text-[10.5px] uppercase tracking-wider px-2 py-[3px] rounded-full ${
                                insertOpen
                                    ? 'bg-teal text-paper'
                                    : 'bg-ink text-paper'
                            }`}
                        >
                            {insertOpen ? 'Aperta' : 'Chiusa'}
                        </span>
                        <div className="flex-1 text-[13.5px]">
                            {insertOpen ? (
                                <>
                                    <b className="text-ink">Finestra di inserimento attiva.</b>
                                    <span className="text-ink-2">
                                        {' '}Puoi inserire, modificare o cancellare i tuoi appelli fino al{' '}
                                        {new Date(selectedSession.endInsertDate).toLocaleDateString('it-IT', {
                                            day: 'numeric', month: 'long', year: 'numeric',
                                        })}.
                                    </span>
                                </>
                            ) : (
                                <>
                                    <b className="text-ink">Finestra di inserimento non attiva.</b>
                                    <span className="text-ink-2">
                                        {' '}Periodo previsto:{' '}
                                        {new Date(selectedSession.startInsertDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                                        {' → '}
                                        {new Date(selectedSession.endInsertDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}.
                                    </span>
                                </>
                            )}
                        </div>
                        {insertOpen && (
                            <span className="font-mono text-[11px] text-ink-3">
                                Restano {daysRemaining(selectedSession.endInsertDate)} giorni
                            </span>
                        )}
                    </div>
                )}

                {/* Calendar or placeholder */}
                {selectedSession && selectedCourse ? (
                    <CalendarGrid
                        viewMonth={viewMonth}
                        setViewMonth={setViewMonth}
                        sessionStart={new Date(selectedSession.startDate)}
                        sessionEnd={new Date(selectedSession.endDate)}
                        insertOpen={insertOpen}
                        byDate={byDate}
                        userId={userId}
                        onCellClick={onCellClick}
                        stats={stats}
                    />
                ) : (
                    <div className="rounded-xl border border-line bg-paper flex items-center justify-center min-h-[420px] text-ink-3 text-sm font-mono">
                        {selectedSession
                            ? 'Seleziona una materia per vedere il calendario'
                            : 'Calendario — seleziona sessione e corso di laurea'}
                    </div>
                )}
            </main>

            {/* ── Right rail ───────────────────────────────────────────── */}
            <aside className="w-[280px] shrink-0 border-l border-line bg-paper overflow-y-auto p-5">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
                            I miei appelli
                        </p>
                        <div className="font-serif text-[22px] leading-tight mt-0.5">
                            {myExams.length}{' '}
                            {myExams.length === 1 ? 'pianificato' : 'pianificati'}
                        </div>
                    </div>
                </div>

                {myExams.length === 0 ? (
                    <div className="text-center py-8 px-3.5 text-ink-3 border border-dashed border-line rounded-lg text-sm">
                        <span className="font-serif text-[22px] text-ink-2 block mb-1">
                            Nessun appello
                        </span>
                        Clicca una data libera sul calendario per aggiungere il tuo primo appello.
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {myExams.map((exam) => {
                            const d = new Date(dateKey(exam.examDate) + 'T12:00:00');
                            const dayIndex = (d.getDay() + 6) % 7;
                            return (
                                <div
                                    key={exam.id}
                                    className="border border-line border-l-[3px] border-l-accent rounded-lg p-3 bg-paper"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-serif text-[22px] leading-none">
                                                {d.getDate()}{' '}
                                                {d.toLocaleDateString('it-IT', { month: 'short' }).toLowerCase()}
                                            </div>
                                            <div className="font-mono text-[10.5px] uppercase tracking-wide text-ink-3 mt-0.5">
                                                {DOW_FULL[dayIndex]}
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10.5px] px-2 py-[3px] rounded-full bg-accent-soft text-accent">
                                            {fmtTime(exam.startTime)}
                                        </span>
                                    </div>
                                    <div className="text-[13px] text-ink font-medium mt-2">
                                        {exam.course.courseName}
                                    </div>
                                    <div className="text-[12px] text-ink-3 mt-0.5">
                                        {exam.degree.degreeName} · Anno {exam.degree.degreeYear}
                                    </div>
                                    <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-line-2">
                                        <button
                                            onClick={() =>
                                                setModal({
                                                    mode: 'edit',
                                                    date: dateKey(exam.examDate),
                                                    exam,
                                                })
                                            }
                                            disabled={!insertOpen}
                                            className="text-[12px] px-2.5 py-1.5 rounded-md border border-line text-ink-2 hover:bg-bg disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Modifica
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Cancellare questo appello?')) return;
                                                await deleteExam(exam.id);
                                                await reloadExams();
                                            }}
                                            disabled={!insertOpen}
                                            className="text-[12px] px-2.5 py-1.5 rounded-md border border-accent-soft text-accent hover:bg-accent-soft disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Cancella
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </aside>

            {/* ── Modal ────────────────────────────────────────────────── */}
            <Modal
                open={!!modal}
                onClose={() => setModal(null)}
                title={modal?.mode === 'edit' ? 'Modifica appello' : 'Nuovo appello'}
                subtitle={modalSubtitle}
            >
                {modal && selectedSession && selectedCourse && (
                    <ExamForm
                        mode={modal.mode}
                        initialDate={modal.date}
                        sessionStart={dateKey(selectedSession.startDate)}
                        sessionEnd={dateKey(selectedSession.endDate)}
                        course={selectedCourse}
                        byDate={byDate}
                        exam={modal.mode === 'edit' ? modal.exam : undefined}
                        onCancel={() => setModal(null)}
                        onSave={handleSave}
                        onDelete={modal.mode === 'edit' ? handleDelete : undefined}
                    />
                )}
            </Modal>
        </div>
    );
}
