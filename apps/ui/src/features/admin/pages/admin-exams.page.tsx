import { useEffect, useMemo, useState } from 'react';
import { fetchSessions, fetchDegrees } from '../../secretary/secretary.api';
import { fetchExamsBySessionAndDegree } from '../../teacher/teacher.api';
import { SessionListItem, DegreeListItem, ExamListItem } from '@server/entities/frontend';
import { buildHolidayMap } from '../../../utils/calendar.utils';
import { dateKey } from '../../../utils/date.utils';
import { CalendarGrid } from '../../teacher/components/CalendarGrid';

export function AdminExamsPage() {
    const [sessions, setSessions] = useState<SessionListItem[]>([]);
    const [degrees, setDegrees] = useState<DegreeListItem[]>([]);

    const [macroArea, setMacroArea] = useState<string>('');
    const [selectedSessionId, setSelectedSessionId] = useState<number | ''>('');
    const [selectedDegreeId, setSelectedDegreeId] = useState<number | ''>('');

    const [exams, setExams] = useState<ExamListItem[]>([]);
    const [viewMonth, setViewMonth] = useState<Date>(new Date());

    // Carica tutte le sessioni e tutti i corsi di laurea (admin vede tutto).
    useEffect(() => {
        fetchSessions().then(setSessions).catch(() => setSessions([]));
        fetchDegrees().then(setDegrees).catch(() => setDegrees([]));
    }, []);

    // Dipartimenti distinti ricavati dalle sessioni esistenti.
    const macroAreas = useMemo(
        () => [...new Set(sessions.map((s) => s.macroArea))].sort((a, b) => a.localeCompare(b)),
        [sessions],
    );

    const sessionsForArea = useMemo(
        () => sessions.filter((s) => s.macroArea === macroArea),
        [sessions, macroArea],
    );

    const degreesForArea = useMemo(
        () => degrees.filter((d) => d.macroArea === macroArea),
        [degrees, macroArea],
    );

    // Reset delle selezioni dipendenti al cambio di dipartimento.
    useEffect(() => {
        setSelectedSessionId('');
        setSelectedDegreeId('');
        setExams([]);
    }, [macroArea]);

    const selectedSession = sessions.find((s) => s.id === selectedSessionId);
    const selectedDegree = degrees.find((d) => d.id === selectedDegreeId);

    useEffect(() => {
        if (selectedSession) setViewMonth(new Date(selectedSession.startDate));
    }, [selectedSession]);

    // Carica gli appelli quando sessione + corso di laurea sono selezionati.
    useEffect(() => {
        if (selectedSessionId === '' || selectedDegreeId === '') {
            setExams([]);
            return;
        }
        fetchExamsBySessionAndDegree(selectedSessionId as number, selectedDegreeId as number)
            .then(setExams)
            .catch(() => setExams([]));
    }, [selectedSessionId, selectedDegreeId]);

    const holidays = useMemo(() => {
        if (!selectedSession) return {};
        return buildHolidayMap(
            new Date(selectedSession.startDate),
            new Date(selectedSession.endDate),
        );
    }, [selectedSession]);

    const byDate = useMemo(() => {
        const m: Record<string, ExamListItem> = {};
        exams.forEach((e) => { m[dateKey(e.examDate)] = e; });
        return m;
    }, [exams]);

    const selectCls =
        'border border-line rounded-lg px-3 py-2 text-sm text-ink bg-paper ' +
        'focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <main className="flex-1 min-w-0 overflow-y-auto px-9 py-7">
            <div className="mb-5">
                <h1 className="text-[38px] font-bold leading-tight tracking-tight m-0">
                    Calendario Appelli{' '}
                    <em className="italic text-accent">— sola consultazione</em>
                </h1>
                <p className="text-sm text-ink-3 mt-1">
                    Visualizza gli appelli per dipartimento e corso di laurea. Vista in sola lettura.
                </p>
            </div>

            {/* Filtri: dipartimento, sessione, corso di laurea */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-ink-3 uppercase tracking-wider">Dipartimento</label>
                    <select
                        className={selectCls}
                        value={macroArea}
                        onChange={(e) => setMacroArea(e.target.value)}
                    >
                        <option value="">Seleziona dipartimento…</option>
                        {macroAreas.map((area) => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-ink-3 uppercase tracking-wider">Sessione</label>
                    <select
                        className={selectCls}
                        value={selectedSessionId}
                        disabled={!macroArea}
                        onChange={(e) => setSelectedSessionId(e.target.value ? Number(e.target.value) : '')}
                    >
                        <option value="">Seleziona sessione…</option>
                        {sessionsForArea.map((s) => (
                            <option key={s.id} value={s.id}>
                                {new Date(s.startDate).toLocaleDateString('it-IT')} – {new Date(s.endDate).toLocaleDateString('it-IT')}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-ink-3 uppercase tracking-wider">Corso di laurea</label>
                    <select
                        className={selectCls}
                        value={selectedDegreeId}
                        disabled={!macroArea}
                        onChange={(e) => setSelectedDegreeId(e.target.value ? Number(e.target.value) : '')}
                    >
                        <option value="">Seleziona corso di laurea…</option>
                        {degreesForArea.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.degreeName} · {d.degreeType} · Anno {d.degreeYear}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedSession && selectedDegree ? (
                <CalendarGrid
                    viewMonth={viewMonth}
                    setViewMonth={setViewMonth}
                    sessionStart={new Date(selectedSession.startDate)}
                    sessionEnd={new Date(selectedSession.endDate)}
                    insertOpen={false}
                    byDate={byDate}
                    userId={null}
                    onCellClick={() => { /* sola lettura: nessuna azione */ }}
                    holidays={holidays}
                />
            ) : (
                <div className="rounded-xl border border-line bg-paper flex items-center justify-center min-h-[420px] text-ink-3 text-sm font-mono">
                    Seleziona dipartimento, sessione e corso di laurea per vedere il calendario
                </div>
            )}
        </main>
    );
}
