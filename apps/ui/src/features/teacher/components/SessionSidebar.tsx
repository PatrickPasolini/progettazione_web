import { SessionListItem, CourseListItem } from '@server/entities/frontend';
import { formatDateRange, dateKey } from '../../../utils/date.utils';
import { DEGREE_TYPE_LABEL } from '../../../utils/calendar.utils';

interface SessionSidebarProps {
    sessions: SessionListItem[];
    selectedSessionId: number | '';
    onSessionChange: (id: number | '') => void;
    selectedSession: SessionListItem | undefined;
    courses: CourseListItem[];
    selectedCourseId: number | '';
    onCourseChange: (id: number) => void;
    holidays: Record<string, string>;
}

export function SessionSidebar({
    sessions,
    selectedSessionId,
    onSessionChange,
    selectedSession,
    courses,
    selectedCourseId,
    onCourseChange,
    holidays,
}: SessionSidebarProps) {
    return (
        <aside className="w-[248px] shrink-0 border-r border-line bg-paper overflow-y-auto p-5 flex flex-col gap-6">
            {/* Session selector */}
            <div className="flex flex-col gap-1.5">
                <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
                    Sessione
                </h4>
                <select
                    value={selectedSessionId}
                    onChange={(e) =>
                        onSessionChange(e.target.value === '' ? '' : +e.target.value)
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

            {/* Course picker */}
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
                                    onClick={() => onCourseChange(course.id)}
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
                                        <span className="text-[17px] font-semibold leading-tight text-ink">
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
                        const inRange = Object.entries(holidays).filter(
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
    );
}
