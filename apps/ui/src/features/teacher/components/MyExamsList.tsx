import { ExamListItem, SessionListItem } from '@server/entities/frontend';
import { dateKey, fmtTime } from '../../../utils/date.utils';
import { DOW_FULL } from '../../../utils/calendar.utils';

interface MyExamsListProps {
    myExams: ExamListItem[];
    session: SessionListItem | undefined;
    examLimitReached: boolean;
    insertOpen: boolean;
    onEdit: (exam: ExamListItem) => void;
    onDelete: (exam: ExamListItem) => void;
}

export function MyExamsList({
    myExams,
    session,
    examLimitReached,
    insertOpen,
    onEdit,
    onDelete,
}: MyExamsListProps) {
    return (
        <aside className="w-[280px] shrink-0 border-l border-line bg-paper overflow-y-auto p-5">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
                        I miei appelli
                    </p>
                    <div className={`font-serif text-[22px] leading-tight mt-0.5 ${examLimitReached ? 'text-gold' : ''}`}>
                        {myExams.length}
                        {session && (
                            <span className="text-ink-3"> / {session.examLimit}</span>
                        )}{' '}
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
                                        onClick={() => onEdit(exam)}
                                        disabled={!insertOpen}
                                        className="text-[12px] px-2.5 py-1.5 rounded-md border border-line text-ink-2 hover:bg-bg disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Modifica
                                    </button>
                                    <button
                                        onClick={() => onDelete(exam)}
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
    );
}
