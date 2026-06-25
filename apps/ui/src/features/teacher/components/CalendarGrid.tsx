import { ExamListItem } from '@server/entities/frontend';
import { toISO, isWeekend, startOfMonth, addMonths, fmtTime } from '../../../utils/date.utils';
import { DOW_LABELS, MONTH_LABELS_IT } from '../../../utils/calendar.utils';
import { Button } from '../../../components/ui/button';

interface CalendarGridProps {
    viewMonth: Date;
    setViewMonth: (d: Date) => void;
    sessionStart: Date;
    sessionEnd: Date;
    insertOpen: boolean;
    byDate: Record<string, ExamListItem>;
    userId: number | null;
    onCellClick: (iso: string, existing: ExamListItem | null) => void;
    holidays: Record<string, string>;
}

export function CalendarGrid({
    viewMonth,
    setViewMonth,
    sessionStart,
    sessionEnd,
    insertOpen,
    byDate,
    userId,
    onCellClick,
    holidays,
}: CalendarGridProps) {
    const first = startOfMonth(viewMonth);
    const startOffset = (first.getDay() + 6) % 7;
    const cells: Date[] = [];
    const gridStart = new Date(first);
    gridStart.setDate(gridStart.getDate() - startOffset);
    for (let i = 0; i < 42; i++) {
        const d = new Date(gridStart);
        d.setDate(d.getDate() + i);
        cells.push(d);
    }
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
            <div className="flex items-center gap-4 mb-[18px]">
                <div className="inline-flex gap-0.5">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                        disabled={!canPrev}
                        className="w-8 h-8"
                    >
                        <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7.5 2L3.5 6l4 4" />
                        </svg>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                        disabled={!canNext}
                        className="w-8 h-8"
                    >
                        <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
                            <path d="M7.5 2L3.5 6l4 4" />
                        </svg>
                    </Button>
                </div>
                <div className="text-[26px] font-semibold leading-none">
                    {MONTH_LABELS_IT[viewMonth.getMonth()]}{' '}
                    <span className="text-ink-3">{viewMonth.getFullYear()}</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-line border border-line rounded-xl overflow-hidden">
                {DOW_LABELS.map((d) => (
                    <div
                        key={d}
                        className="bg-[#e3e9f3] px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-ink-3"
                    >
                        {d}
                    </div>
                ))}

                {cells.map((d, i) => {
                    const iso = toISO(d);
                    const outMonth = d.getMonth() !== viewMonth.getMonth();
                    const inSession =
                        iso >= toISO(sessionStart) && iso <= toISO(sessionEnd);
                    const we = isWeekend(d);
                    const hol = holidays[iso];
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
                            <div className="flex items-center justify-between">
                                <span
                                    className={
                                        isToday && !outMonth
                                            ? 'w-6 h-6 bg-ink text-paper rounded-full grid place-items-center font-mono text-[13px]'
                                            : 'text-[18px] font-semibold leading-none' +
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
                                        {fmtTime(exam.startTime)}
                                    </span>
                                    <span className={'font-medium ' + (isMine ? 'text-paper' : 'text-ink')}>
                                        {exam.course.courseName}
                                    </span>
                                    <span className={'text-[10.5px] ' + (isMine ? 'text-white/75' : 'text-ink-3')}>
                                        {isMine ? 'tu' : `${exam.teacher.name} ${exam.teacher.surname}`}
                                    </span>
                                </div>
                            )}

                            {!outMonth && inSession && !we && !hol && !exam && insertOpen && (
                                <div className="absolute inset-x-0 bottom-0 h-[22px] hidden items-center justify-center text-[11px] text-ink-3 border-t border-dashed border-line cal-cell-add">
                                    + Aggiungi
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                .cal-cell-add { display: none; }
                div:hover > .cal-cell-add { display: flex; }
            `}</style>
        </div>
    );
}
