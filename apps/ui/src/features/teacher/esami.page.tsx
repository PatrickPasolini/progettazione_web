import { useState, useEffect, useMemo, useCallback } from 'react';
import { SessionListItem, CourseListItem, ExamListItem } from '@server/entities/frontend';
import { fetchCurrentUser } from '../auth/auth.api';
import {
    fetchActiveSessions,
    fetchCoursesByTeacher,
    fetchSessionExams,
    createExam,
    updateExam,
    deleteExam,
} from './teacher.api';
import { TeacherCalendar } from './teacher-calendar';
import { ExamModal } from './exam-modal';

function formatDateRange(start: Date | string, end: Date | string): string {
    const s = new Date(start);
    const e = new Date(end);
    const month = (d: Date) => d.toLocaleDateString('it-IT', { month: 'short' });
    const year = e.getFullYear();
    return `${month(s)}-${month(e)} ${year}`;
}

function pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
}

function formatISO(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function EsamiPage() {
    const [user, setUser] = useState<{ id: number; name: string; surname: string } | null>(null);
    const [sessions, setSessions] = useState<SessionListItem[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [allCourses, setAllCourses] = useState<CourseListItem[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(null);
    const [exams, setExams] = useState<ExamListItem[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [modalDate, setModalDate] = useState<string | null>(null);
    const [selectedExam, setSelectedExam] = useState<ExamListItem | null>(null);

    const selectedSession = useMemo(
        () => sessions.find((s) => s.id === selectedSessionId) ?? null,
        [sessions, selectedSessionId],
    );

    const filteredCourses = useMemo(
        () =>
            selectedSession
                ? allCourses.filter((c) => c.degree.macroArea === selectedSession.macroArea)
                : [],
        [allCourses, selectedSession],
    );

    const ownExams = useMemo(
        () => exams.filter((e) => e.teacher.id === user?.id),
        [exams, user],
    );

    const otherExams = useMemo(
        () => exams.filter((e) => e.teacher.id !== user?.id),
        [exams, user],
    );

    const myExistingExam = useMemo(
        () =>
            selectedCourse
                ? ownExams.find((e) => e.course.id === selectedCourse.id) ?? null
                : null,
        [selectedCourse, ownExams],
    );

    const plannedCount = useMemo(
        () =>
            filteredCourses.filter((c) =>
                ownExams.some((e) => e.course.id === c.id),
            ).length,
        [filteredCourses, ownExams],
    );

    useEffect(() => {
        fetchCurrentUser()
            .then((u) => setUser(u))
            .catch(() => setUser(null));
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        fetchActiveSessions(user.id)
            .then((ss) => {
                setSessions(ss);
                if (ss.length > 0) setSelectedSessionId(ss[0].id);
            })
            .catch(() => setSessions([]));
        fetchCoursesByTeacher(user.id)
            .then(setAllCourses)
            .catch(() => setAllCourses([]));
    }, [user]);

    useEffect(() => {
        setSelectedCourse(null);
        setSelectedExam(null);
        setExams([]);
    }, [selectedSessionId]);

    useEffect(() => {
        if (!selectedCourse || !selectedSessionId) {
            setExams([]);
            return;
        }
        fetchSessionExams(selectedSessionId, selectedCourse.degree.id)
            .then(setExams)
            .catch(() => setExams([]));
    }, [selectedSessionId, selectedCourse]);

    const handleFreeDateClick = useCallback((date: string) => {
        setModalDate(date);
        setModalMode('create');
        setSelectedExam(null);
        setModalOpen(true);
    }, []);

    const handleOwnExamClick = useCallback((exam: ExamListItem) => {
        setModalDate(formatISO(new Date(exam.examDate)));
        setModalMode('edit');
        setSelectedExam(exam);
        setModalOpen(true);
    }, []);

    const reloadExams = useCallback(async () => {
        if (!selectedCourse || !selectedSessionId) return;
        const updated = await fetchSessionExams(selectedSessionId, selectedCourse.degree.id);
        setExams(updated);
    }, [selectedCourse, selectedSessionId]);

    const handleModalSave = useCallback(
        async (startTime: string, endTime: string) => {
            if (!selectedCourse || !selectedSessionId || !modalDate) return;

            const makeTime = (time: string) => `${modalDate}T${time}:00`;

            if (modalMode === 'create') {
                await createExam({
                    sessionId: selectedSessionId,
                    courseId: selectedCourse.id,
                    degreeId: selectedCourse.degree.id,
                    examDate: modalDate,
                    startTime: makeTime(startTime),
                    endTime: makeTime(endTime),
                });
            } else if (selectedExam) {
                await updateExam(selectedExam.id, {
                    examDate: modalDate,
                    startTime: makeTime(startTime),
                    endTime: makeTime(endTime),
                });
            }

            await reloadExams();
            setModalOpen(false);
        },
        [selectedCourse, selectedSessionId, modalDate, modalMode, selectedExam, reloadExams],
    );

    const handleModalDelete = useCallback(async () => {
        if (!selectedExam) return;
        await deleteExam(selectedExam.id);
        await reloadExams();
        setModalOpen(false);
    }, [selectedExam, reloadExams]);

    return (
        <div className="flex flex-1 min-h-0">
            <aside className="w-[248px] shrink-0 border-r border-line bg-paper overflow-y-auto p-5 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
                        Sessione
                    </h4>
                    <select
                        value={selectedSessionId ?? ''}
                        onChange={(e) =>
                            setSelectedSessionId(e.target.value === '' ? null : +e.target.value)
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
                </div>

                {sessions.length === 0 && (
                    <p className="text-[12.5px] text-ink-3 m-0 text-center py-4">
                        Nessuna sessione attiva per le tue aree.
                    </p>
                )}

                {filteredCourses.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                        <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
                            Corsi
                        </h4>
                        <div className="flex flex-col gap-1.5">
                            {filteredCourses.map((course) => {
                                const hasExam = ownExams.some(
                                    (e) => e.course.id === course.id,
                                );
                                const isSelected = selectedCourse?.id === course.id;
                                return (
                                    <button
                                        key={course.id}
                                        type="button"
                                        onClick={() => setSelectedCourse(course)}
                                        className={`
                                            w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors
                                            ${isSelected
                                                ? 'bg-accent/10 border-accent text-ink font-semibold'
                                                : hasExam
                                                    ? 'bg-paper border-line text-ink hover:border-accent/40'
                                                    : 'bg-paper border-line text-ink hover:border-accent/40'
                                            }
                                        `}
                                    >
                                        <div className="font-medium leading-tight">
                                            {course.courseName}
                                        </div>
                                        <div className="text-[11px] text-ink-3 mt-0.5">
                                            {course.degree.degreeName} ({course.degree.degreeType})
                                        </div>
                                        {hasExam && (
                                            <div className="text-[10px] text-accent font-semibold mt-1">
                                                ✅ Appello inserito
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {selectedSession && filteredCourses.length === 0 && (
                    <p className="text-[12.5px] text-ink-3 m-0 text-center py-4">
                        Nessun corso trovato per {selectedSession.macroArea}.
                    </p>
                )}
            </aside>

            <main className="flex-1 min-w-0 overflow-y-auto px-9 py-7 flex flex-col gap-6">
                <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
                        Pianificazione appelli
                    </p>
                    <h1 className="font-serif text-[38px] leading-tight tracking-tight m-0 mt-0.5">
                        Calendario{' '}
                        <em className="italic text-accent">
                            {selectedCourse
                                ? selectedCourse.degree.degreeName
                                : '—'}
                        </em>
                    </h1>
                </div>

                {!selectedCourse && (
                    <div className="rounded-xl border border-dashed border-line bg-paper flex items-center justify-center min-h-[420px] text-ink-3 text-sm font-mono">
                        Seleziona un corso a sinistra
                    </div>
                )}

                {selectedCourse && (
                    <TeacherCalendar
                        session={selectedSession!}
                        ownExams={ownExams}
                        otherExams={otherExams}
                        hasExistingExam={!!myExistingExam}
                        onFreeDateClick={handleFreeDateClick}
                        onOwnExamClick={handleOwnExamClick}
                    />
                )}

                {selectedCourse && myExistingExam && (
                    <p className="text-sm text-ink-3 text-center -mt-2">
                        Hai già un appello per questo corso.
                        Clicca sulla data evidenziata per modificarlo.
                    </p>
                )}

                {selectedCourse && (
                    <div className="flex flex-col gap-2 text-sm text-ink-3">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-[3px] bg-accent shrink-0" />
                            <span>Il tuo appello</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-[3px] bg-paper border border-line shrink-0" />
                            <span>Appello di un collega</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-[3px] bg-[#dde4ef] shrink-0" />
                            <span>Sabato / Domenica</span>
                        </div>
                    </div>
                )}

                <ExamModal
                    isOpen={modalOpen}
                    mode={modalMode}
                    courseName={selectedCourse?.courseName ?? ''}
                    degreeName={selectedCourse?.degree.degreeName ?? ''}
                    selectedDate={modalDate ?? ''}
                    currentStartTime={
                        selectedExam
                            ? formatISO(new Date(selectedExam.startTime)).slice(11, 16)
                            : '09:00'
                    }
                    currentEndTime={
                        selectedExam
                            ? formatISO(new Date(selectedExam.endTime)).slice(11, 16)
                            : '11:00'
                    }
                    onClose={() => setModalOpen(false)}
                    onSave={handleModalSave}
                    onDelete={modalMode === 'edit' ? handleModalDelete : undefined}
                />
            </main>

            <aside className="w-[280px] shrink-0 border-l border-line bg-paper overflow-y-auto p-5">
                <div className="mb-4">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-ink-3 m-0">
                        I miei appelli
                    </p>
                    <div className="font-serif text-[22px] leading-tight mt-0.5">
                        {plannedCount} / {filteredCourses.length} pianificati
                    </div>
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-8 px-3.5 text-ink-3 border border-dashed border-line rounded-lg text-sm">
                        <span className="font-serif text-[22px] text-ink-2 block mb-1">
                            Nessun corso
                        </span>
                        Nessuna materia disponibile per questa sessione.
                    </div>
                )}

                {filteredCourses.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                        {filteredCourses.map((course) => {
                            const planned = ownExams.some(
                                (e) => e.course.id === course.id,
                            );
                            return (
                                <div
                                    key={course.id}
                                    className={`
                                        px-3 py-2.5 rounded-lg text-sm border
                                        ${planned
                                            ? 'border-accent/30 bg-accent/5'
                                            : 'border-line bg-paper'
                                        }
                                    `}
                                >
                                    <div className="font-medium text-ink leading-tight">
                                        {course.courseName}
                                    </div>
                                    <div className="text-[11px] text-ink-3 mt-0.5">
                                        {course.degree.degreeName}
                                    </div>
                                    <div className="text-[11px] font-semibold mt-1.5">
                                        {planned ? (
                                            <span className="text-accent">✅ Pianificato</span>
                                        ) : (
                                            <span className="text-ink-3">❌ Da pianificare</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </aside>
        </div>
    );
}
