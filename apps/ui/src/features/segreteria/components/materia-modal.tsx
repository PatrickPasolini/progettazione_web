import { useState, useEffect, useRef, useMemo } from 'react';
import { createCourse, updateCourse, fetchTeachers, fetchDegrees } from '../segreteria.api';
import type { CourseListItem, TeacherListItem, DegreeListItem } from '@server/entities/frontend';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

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
    const defaultDegree = useMemo(() => degrees.find((d) => d.id === defaultDegreeId) ?? null, [degrees, defaultDegreeId]);

    const loadData = async () => {
        const [t, d] = await Promise.all([fetchTeachers(), fetchDegrees()]);
        setTeachers(t); setDegrees(d);
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
            setCourseName(''); setSelectedTeacher(null);
            if (!isDegreeFixed) setSelectedDegree(null);
        }
        setModalError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, mode, course, defaultDegreeId]);

    useEffect(() => { if (isOpen) loadData(); }, [isOpen]);

    useEffect(() => {
        if (isDegreeFixed && defaultDegree && !selectedDegree) setSelectedDegree(defaultDegree);
    }, [defaultDegree, isDegreeFixed, selectedDegree, isOpen]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (teacherRef.current && !teacherRef.current.contains(e.target as Node)) setTeacherOpen(false);
            if (degreeRef.current && !degreeRef.current.contains(e.target as Node)) setDegreeOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filteredTeachers = teachers.filter((t) =>
        `${t.name} ${t.surname}`.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.email.toLowerCase().includes(teacherSearch.toLowerCase())
    );
    const filteredDegrees = degrees.filter((d) => d.degreeName.toLowerCase().includes(degreeSearch.toLowerCase()));

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (!selectedTeacher) { setModalError('Seleziona un docente.'); return; }
        const degreeId = isDegreeFixed ? defaultDegreeId! : selectedDegree?.id;
        if (!degreeId) { setModalError('Seleziona un corso di laurea.'); return; }
        try {
            setSubmitting(true); setModalError(null);
            const payload = { courseName, teacherId: selectedTeacher.id, degreeId };
            if (mode === 'create') await createCourse(payload);
            else if (mode === 'edit' && course) await updateCourse(course.id, payload);
            onSave(); onClose();
        } catch (err: any) {
            setModalError(err.message || 'Errore durante il salvataggio della materia.');
        } finally {
            setSubmitting(false);
        }
    };

    const dropdownCls = "absolute z-10 mt-1 w-full bg-background border border-border rounded-lg shadow-lg overflow-y-auto max-h-[120px]";

    return (
        <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Aggiungi Nuova Materia' : 'Modifica Materia'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4 py-2">
                        {modalError && (
                            <div className="text-destructive bg-destructive/10 text-sm font-medium p-3 rounded-lg border border-destructive/20">
                                {modalError}
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="course-name">Nome Corso</Label>
                            <Input id="course-name" type="text" required value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Es. Analisi Matematica 1" />
                        </div>

                        <div ref={teacherRef} className="relative flex flex-col gap-1.5">
                            <Label>Docente</Label>
                            {selectedTeacher ? (
                                <div className="flex items-center gap-2 w-full px-3 py-2 border border-primary rounded-md bg-background">
                                    <span className="flex-1 text-sm text-foreground">{selectedTeacher.name} {selectedTeacher.surname}</span>
                                    <button type="button" onClick={() => { setSelectedTeacher(null); setTeacherSearch(''); }} className="text-muted-foreground hover:text-destructive text-sm">✕</button>
                                </div>
                            ) : (
                                <Input type="text" required placeholder="Cerca un docente..." value={teacherSearch}
                                    onFocus={() => setTeacherOpen(true)}
                                    onChange={(e) => { setTeacherSearch(e.target.value); setTeacherOpen(true); }}
                                />
                            )}
                            {teacherOpen && !selectedTeacher && (
                                <div className={dropdownCls}>
                                    {filteredTeachers.length === 0
                                        ? <p className="px-3 py-2 text-sm text-muted-foreground">Nessun docente trovato</p>
                                        : filteredTeachers.map((t) => (
                                            <button key={t.id} type="button"
                                                onClick={() => { setSelectedTeacher(t); setTeacherSearch(''); setTeacherOpen(false); }}
                                                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors">
                                                <span className="block text-sm text-foreground">{t.name} {t.surname}</span>
                                                <span className="block text-xs text-muted-foreground">{t.email}</span>
                                            </button>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {isDegreeFixed ? (
                            <div className="flex flex-col gap-1.5">
                                <Label>Corso di Laurea</Label>
                                <div className="w-full px-3 py-2 border border-border rounded-md bg-muted text-sm text-foreground">
                                    {defaultDegree ? `${defaultDegree.degreeName} — ${defaultDegree.degreeType} ${defaultDegree.degreeYear} (${defaultDegree.macroArea})` : 'Caricamento…'}
                                </div>
                            </div>
                        ) : (
                            <div ref={degreeRef} className="relative flex flex-col gap-1.5">
                                <Label>Corso di Laurea</Label>
                                {selectedDegree ? (
                                    <div className="flex items-center gap-2 w-full px-3 py-2 border border-primary rounded-md bg-background">
                                        <span className="flex-1 text-sm text-foreground">{selectedDegree.degreeName}</span>
                                        <button type="button" onClick={() => { setSelectedDegree(null); setDegreeSearch(''); }} className="text-muted-foreground hover:text-destructive text-sm">✕</button>
                                    </div>
                                ) : (
                                    <Input type="text" required placeholder="Cerca un corso di laurea..." value={degreeSearch}
                                        onFocus={() => setDegreeOpen(true)}
                                        onChange={(e) => { setDegreeSearch(e.target.value); setDegreeOpen(true); }}
                                    />
                                )}
                                {degreeOpen && !selectedDegree && (
                                    <div className={dropdownCls}>
                                        {filteredDegrees.length === 0
                                            ? <p className="px-3 py-2 text-sm text-muted-foreground">Nessun corso trovato</p>
                                            : filteredDegrees.map((d) => (
                                                <button key={d.id} type="button"
                                                    onClick={() => { setSelectedDegree(d); setDegreeSearch(''); setDegreeOpen(false); }}
                                                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors">
                                                    <span className="block text-sm text-foreground">{d.degreeName}</span>
                                                    <span className="block text-xs text-muted-foreground">{d.degreeType} - {d.degreeYear}</span>
                                                </button>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border mt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Annulla</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? 'Salvataggio…' : 'Salva'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
