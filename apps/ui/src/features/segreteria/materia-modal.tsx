import { useState, useEffect, useRef, useMemo } from 'react';
import { createCourse, updateCourse, fetchTeachers, fetchDegrees } from './segreteria.api';
import type { CourseListItem, TeacherListItem, DegreeListItem } from '@server/entities/frontend';

interface MateriaModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    course: CourseListItem | null;
    defaultDegreeId?: number;
    onClose: () => void;
    onSave: () => void;
}

export function MateriaModal({ isOpen, mode, course, defaultDegreeId, onClose, onSave }: MateriaModalProps) {
    const [courseName, setCourseName] = useState('');

    const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
    const [teacherSearch, setTeacherSearch] = useState('');
    const [teacherOpen, setTeacherOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherListItem | null>(null);
    const teacherRef = useRef<HTMLDivElement>(null);

    const [degrees, setDegrees] = useState<DegreeListItem[]>([]);
    const [degreeSearch, setDegreeSearch] = useState('');
    const [degreeOpen, setDegreeOpen] = useState(false);
    const [selectedDegree, setSelectedDegree] = useState<DegreeListItem | null>(null);
    const degreeRef = useRef<HTMLDivElement>(null);

    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const isDegreeFixed = mode === 'create' && !!defaultDegreeId;

    const defaultDegree = useMemo(
        () => degrees.find((d) => d.id === defaultDegreeId) ?? null,
        [degrees, defaultDegreeId]
    );

    const loadData = async () => {
        const [t, d] = await Promise.all([fetchTeachers(), fetchDegrees()]);
        setTeachers(t);
        setDegrees(d);
        if (mode === 'edit' && course) {
            setCourseName(course.courseName);
            const teacherMatch = t.find((tc) => tc.id === course.teacher.id);
            if (teacherMatch) setSelectedTeacher(teacherMatch);
            const degreeMatch = d.find((deg) => deg.id === course.degree.id);
            if (degreeMatch) setSelectedDegree(degreeMatch);
        }
    };

    useEffect(() => {
        if (mode === 'edit' && course) {
            setCourseName(course.courseName);
            const teacherMatch = teachers.find((t) => t.id === course.teacher.id);
            if (teacherMatch) setSelectedTeacher(teacherMatch);
            const degreeMatch = degrees.find((deg) => deg.id === course.degree.id);
            if (degreeMatch) setSelectedDegree(degreeMatch);
        } else {
            setCourseName('');
            setSelectedTeacher(null);
            if (!isDegreeFixed) setSelectedDegree(null);
        }
        setModalError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, mode, course, defaultDegreeId]);

    useEffect(() => {
        if (isOpen) loadData();
    }, [isOpen]);

    useEffect(() => {
        if (isDegreeFixed && defaultDegree && !selectedDegree) {
            setSelectedDegree(defaultDegree);
        }
    }, [defaultDegree, isDegreeFixed, selectedDegree, isOpen]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (teacherRef.current && !teacherRef.current.contains(e.target as Node))
                setTeacherOpen(false);
            if (degreeRef.current && !degreeRef.current.contains(e.target as Node))
                setDegreeOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filteredTeachers = teachers.filter(
        (t) =>
            `${t.name} ${t.surname}`.toLowerCase().includes(teacherSearch.toLowerCase()) ||
            t.email.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    const filteredDegrees = degrees.filter(
        (d) => d.degreeName.toLowerCase().includes(degreeSearch.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTeacher) {
            setModalError("Seleziona un docente.");
            return;
        }

        const degreeId = isDegreeFixed ? defaultDegreeId! : selectedDegree?.id;
        if (!degreeId) {
            setModalError("Seleziona un corso di laurea.");
            return;
        }

        try {
            setSubmitting(true);
            setModalError(null);

            const payload = {
                courseName,
                teacherId: selectedTeacher.id,
                degreeId,
            };

            if (mode === 'create') {
                await createCourse(payload);
            } else if (mode === 'edit' && course) {
                await updateCourse(course.id, payload);
            }
            onSave();
            onClose();
        } catch (err: any) {
            setModalError(err.message || "Errore durante il salvataggio della materia.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen)
        return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-line rounded-xl shadow-lg w-full max-w-md">
                <div className="bg-bg/30 px-6 py-4 border-b border-line">
                    <h3 className="font-bold text-lg text-ink">
                        {mode === 'create' ? 'Aggiungi Nuova Materia' : 'Modifica Materia'}
                    </h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {modalError && (
                            <div className="text-red-600 bg-red-50 text-sm font-medium p-3 rounded-lg border border-red-100">
                                {modalError}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold uppercase text-ink-3 mb-1">Nome Corso</label>
                            <input
                                type="text"
                                required
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink"
                                placeholder="Es. Analisi Matematica 1"
                            />
                        </div>

                        <div ref={teacherRef} className="relative">
                            <label className="block text-xs font-semibold uppercase text-ink-3 mb-1">Docente</label>
                            {selectedTeacher ? (
                                <div className="flex items-center gap-2 w-full px-3 py-2 border border-accent rounded-lg bg-white">
                                    <span className="flex-1 text-ink">
                                        {selectedTeacher.name} {selectedTeacher.surname}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedTeacher(null); setTeacherSearch(''); }}
                                        className="text-ink-3 hover:text-red-600 text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    required
                                    placeholder="Cerca un docente..."
                                    value={teacherSearch}
                                    onFocus={() => setTeacherOpen(true)}
                                    onChange={(e) => { setTeacherSearch(e.target.value); setTeacherOpen(true); }}
                                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink"
                                />
                            )}
                            {teacherOpen && !selectedTeacher && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-line rounded-lg shadow-lg" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                    {filteredTeachers.length === 0 ? (
                                        <p className="px-3 py-2 text-sm text-ink-4">Nessun docente trovato</p>
                                    ) : (
                                        filteredTeachers.map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => { setSelectedTeacher(t); setTeacherSearch(''); setTeacherOpen(false); }}
                                                className="w-full text-left px-3 py-2 pr-4 hover:bg-bg/50 transition-colors"
                                            >
                                                <span className="block text-sm text-ink">{t.name} {t.surname}</span>
                                                <span className="block text-xs text-ink-3">{t.email}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {isDegreeFixed ? (
                            <div>
                                <label className="block text-xs font-semibold uppercase text-ink-3 mb-1">Corso di Laurea</label>
                                <div className="w-full px-3 py-2 border border-line rounded-lg bg-bg/20 text-ink">
                                    {defaultDegree
                                        ? `${defaultDegree.degreeName} — ${defaultDegree.degreeType} ${defaultDegree.degreeYear} (${defaultDegree.macroArea})`
                                        : 'Caricamento...'
                                    }
                                </div>
                            </div>
                        ) : (
                            <div ref={degreeRef} className="relative">
                                <label className="block text-xs font-semibold uppercase text-ink-3 mb-1">Corso di Laurea</label>
                                {selectedDegree ? (
                                    <div className="flex items-center gap-2 w-full px-3 py-2 border border-accent rounded-lg bg-white">
                                        <span className="flex-1 text-ink">
                                            {selectedDegree.degreeName}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedDegree(null); setDegreeSearch(''); }}
                                            className="text-ink-3 hover:text-red-600 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        required
                                        placeholder="Cerca un corso di laurea..."
                                        value={degreeSearch}
                                        onFocus={() => setDegreeOpen(true)}
                                        onChange={(e) => { setDegreeSearch(e.target.value); setDegreeOpen(true); }}
                                        className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink"
                                    />
                                )}
                                {degreeOpen && !selectedDegree && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-line rounded-lg shadow-lg" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                        {filteredDegrees.length === 0 ? (
                                            <p className="px-3 py-2 text-sm text-ink-4">Nessun corso di laurea trovato</p>
                                        ) : (
                                            filteredDegrees.map((d) => (
                                                <button
                                                    key={d.id}
                                                    type="button"
                                                    onClick={() => { setSelectedDegree(d); setDegreeSearch(''); setDegreeOpen(false); }}
                                                    className="w-full text-left px-3 py-2 pr-4 hover:bg-bg/50 transition-colors"
                                                >
                                                    <span className="block text-sm text-ink">{d.degreeName}</span>
                                                    <span className="block text-xs text-ink-3">{d.degreeType} - {d.degreeYear}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-bg/20 px-6 py-4 border-t border-line flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg font-medium text-ink disabled:opacity-50"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-accent hover:bg-accent-2 transition-colors text-white rounded-lg font-medium shadow-sm disabled:opacity-50"
                        >
                            {submitting ? 'Salvataggio...' : 'Salva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
