import { useState, useMemo } from 'react';
import { ExamListItem } from '@server/entities/frontend';

function pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
}

function formatISO(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function sameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function getMonthKey(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

const DAYS = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];

const MONTHS = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

interface TeacherCalendarProps {
    session: { id: number; startDate: Date | string; endDate: Date | string };
    ownExams: ExamListItem[];
    otherExams: ExamListItem[];
    hasExistingExam: boolean;
    onFreeDateClick: (date: string) => void;
    onOwnExamClick: (exam: ExamListItem) => void;
}

export function TeacherCalendar({
    session,
    ownExams,
    otherExams,
    hasExistingExam,
    onFreeDateClick,
    onOwnExamClick,
}: TeacherCalendarProps) {
    const sessionStart = new Date(session.startDate);
    const sessionEnd = new Date(session.endDate);

    const [viewMonth, setViewMonth] = useState(() => new Date(
        sessionStart.getFullYear(),
        sessionStart.getMonth(),
        1,
    ));

    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const today = new Date();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const startOffset = (firstDayOfWeek + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const currentMonthKey = getMonthKey(viewMonth);
    const minMonthKey = getMonthKey(sessionStart);
    const maxMonthKey = getMonthKey(sessionEnd);

    const canGoPrev = currentMonthKey > minMonthKey;
    const canGoNext = currentMonthKey < maxMonthKey;

    const ownExamMap = useMemo(() => {
        const map = new Map<string, ExamListItem>();
        for (const e of ownExams) {
            const key = formatISO(new Date(e.examDate));
            map.set(key, e);
        }
        return map;
    }, [ownExams]);

    const otherExamMap = useMemo(() => {
        const map = new Map<string, ExamListItem[]>();
        for (const e of otherExams) {
            const key = formatISO(new Date(e.examDate));
            const arr = map.get(key);
            if (arr) arr.push(e);
            else map.set(key, [e]);
        }
        return map;
    }, [otherExams]);

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between px-1 mb-3">
                <button
                    type="button"
                    onClick={() => setViewMonth(new Date(year, month - 1, 1))}
                    disabled={!canGoPrev}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg text-sm text-ink-2 disabled:text-ink-4 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                >
                    ◀
                </button>
                <span className="text-base font-semibold text-ink">
                    {MONTHS[month]} {year}
                </span>
                <button
                    type="button"
                    onClick={() => setViewMonth(new Date(year, month + 1, 1))}
                    disabled={!canGoNext}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg text-sm text-ink-2 disabled:text-ink-4 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                >
                    ▶
                </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d) => (
                    <div
                        key={d}
                        className="h-8 flex items-center justify-center text-[11px] font-mono text-ink-3 uppercase"
                    >
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-px">
                {cells.map((date, i) => {
                    if (!date) return <div key={`e-${i}`} className="h-12" />;

                    const iso = formatISO(date);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const outOfRange = date < sessionStart || date > sessionEnd;
                    const isToday = sameDay(date, today);

                    const ownExam = ownExamMap.get(iso);
                    const otherExamsOnDate = otherExamMap.get(iso);

                    if (outOfRange) return <div key={iso} className="h-12" />;

                    return (
                        <button
                            key={iso}
                            type="button"
                            disabled={
                                isWeekend ||
                                !!otherExamsOnDate ||
                                (hasExistingExam && !ownExam)
                            }
                            onClick={() => {
                                if (ownExam) onOwnExamClick(ownExam);
                                else if (!isWeekend && !hasExistingExam) onFreeDateClick(iso);
                            }}
                            className={`
                                h-12 flex flex-col items-center justify-center text-sm rounded-lg transition-colors relative
                                ${isWeekend
                                    ? 'bg-[#dde4ef] text-ink-4 cursor-not-allowed'
                                    : otherExamsOnDate
                                        ? 'bg-paper border border-line text-ink-3 cursor-not-allowed'
                                        : ownExam
                                            ? 'bg-accent text-white font-semibold cursor-pointer hover:brightness-110'
                                            : hasExistingExam
                                                ? 'text-ink-4 cursor-not-allowed'
                                                : 'text-ink hover:bg-accent/5 cursor-pointer'
                                }
                                ${isToday && !ownExam && !otherExamsOnDate && !isWeekend
                                    ? 'ring-1 ring-accent/40'
                                    : ''
                                }
                            `}
                        >
                            <span className="leading-none">{date.getDate()}</span>
                            {ownExam && (
                                <span className="text-[9px] leading-tight mt-0.5 font-medium opacity-90">
                                    Tuo
                                </span>
                            )}
                            {otherExamsOnDate && (
                                <span className="text-[9px] leading-tight mt-0.5 text-ink-4">
                                    Occupato
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
