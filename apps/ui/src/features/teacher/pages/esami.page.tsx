import { useState, useEffect, useMemo } from 'react';
import { fetchCurrentUser } from '../../auth/auth.api';
import {
    featchSessionsByTeacherId,
    featchCoursesByTeacherAndSession,
    fetchExamsBySessionAndDegree,
    createExam,
    updateExam,
    deleteExam,
} from '../teacher.api';
import { SessionListItem, CourseListItem, ExamListItem } from '@server/entities/frontend';
import { buildHolidayMap } from '../../../utils/calendar.utils';
import { Button } from '../../../components/ui/button';
import { dateKey } from '../../../utils/date.utils';
import { CalendarGrid } from '../components/CalendarGrid';
import { ExamForm } from '../components/ExamForm';
import { Modal } from '../components/Modal';
import { InsertionBanner } from '../components/InsertionBanner';
import { SessionSidebar } from '../components/SessionSidebar';
import { MyExamsList } from '../components/MyExamsList';

type ModalState =
    | { mode: 'add'; date: string }
    | { mode: 'edit'; date: string; exam: ExamListItem }
    | null;

export function EsamiPage() {
    const [sessions, setSessions] = useState<SessionListItem[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<number | ''>('');
    const [userId, setUserId] = useState<number | null>(null);
    const [courses, setCourses] = useState<CourseListItem[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
    const [exams, setExams] = useState<ExamListItem[]>([]);
    const [viewMonth, setViewMonth] = useState<Date>(new Date());
    const [modal, setModal] = useState<ModalState>(null);

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

    useEffect(() => {
        const session = sessions.find((s) => s.id === selectedSessionId);
        if (session) setViewMonth(new Date(session.startDate));
    }, [selectedSessionId, sessions]);

    useEffect(() => {
        if (!selectedCourseId || !selectedSessionId) { setExams([]); return; }
        const course = courses.find((c) => c.id === selectedCourseId);
        if (!course) return;
        fetchExamsBySessionAndDegree(selectedSessionId as number, course.degree.id)
            .then(setExams)
            .catch(() => setExams([]));
    }, [selectedCourseId, selectedSessionId, courses]);

    // ── Derived ──────────────────────────────────────────────────────────────

    const selectedSession = sessions.find((s) => s.id === selectedSessionId);
    const selectedCourse = courses.find((c) => c.id === selectedCourseId);

    const holidays = useMemo(() => {
        if (!selectedSession) return {};
        return buildHolidayMap(
            new Date(selectedSession.startDate),
            new Date(selectedSession.endDate),
        );
    }, [selectedSession]);

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

    const examLimitReached =
        !!selectedSession && myExams.length >= selectedSession.examLimit;

    // ── Handlers ─────────────────────────────────────────────────────────────

    function onCellClick(iso: string, existing: ExamListItem | null) {
        if (!insertOpen || !selectedCourse) return;
        if (!existing && examLimitReached) return;
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

    async function handleDeleteFromList(exam: ExamListItem) {
        if (!window.confirm('Cancellare questo appello?')) return;
        await deleteExam(exam.id);
        await reloadExams();
    }

    // ── Render ───────────────────────────────────────────────────────────────

    const modalSubtitle =
        modal?.mode === 'edit'
            ? `${selectedCourse?.degree.degreeName} · Anno ${selectedCourse?.degree.degreeYear} · ${new Date(modal.date + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}`
            : modal?.date
            ? `${selectedCourse?.degree.degreeName} · ${new Date(modal.date + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}`
            : 'Seleziona una data nel calendario.';

    return (
        <div className="flex flex-1 min-h-0">
            <SessionSidebar
                sessions={sessions}
                selectedSessionId={selectedSessionId}
                onSessionChange={setSelectedSessionId}
                selectedSession={selectedSession}
                courses={courses}
                selectedCourseId={selectedCourseId}
                onCourseChange={setSelectedCourseId}
                holidays={holidays}
            />

            <main className="flex-1 min-w-0 overflow-y-auto px-9 py-7">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h1 className="text-[38px] font-bold leading-tight tracking-tight m-0 mt-0.5">
                            Calendario Appelli{' '}
                            <em className="italic text-accent">
                                {selectedSession ? `- ${selectedSession.macroArea}` : '-'}
                            </em>
                        </h1>
                    </div>
                    <Button
                        disabled={!insertOpen || !selectedCourse || examLimitReached}
                        onClick={() => setModal({ mode: 'add', date: '' })}
                    >
                        + Nuovo appello
                    </Button>
                </div>

                {selectedSession && (
                    <InsertionBanner
                        session={selectedSession}
                        insertOpen={insertOpen}
                        examLimitReached={examLimitReached}
                    />
                )}

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
                        holidays={holidays}
                    />
                ) : (
                    <div className="rounded-xl border border-line bg-paper flex items-center justify-center min-h-[420px] text-ink-3 text-sm font-mono">
                        {selectedSession
                            ? 'Seleziona una materia per vedere il calendario'
                            : 'Calendario — seleziona sessione e corso di laurea'}
                    </div>
                )}
            </main>

            <MyExamsList
                myExams={myExams}
                session={selectedSession}
                examLimitReached={examLimitReached}
                insertOpen={insertOpen}
                onEdit={(exam) => setModal({ mode: 'edit', date: dateKey(exam.examDate), exam })}
                onDelete={handleDeleteFromList}
            />

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
                        holidays={holidays}
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
