import { useState, useEffect, useMemo, useRef } from 'react';
import { createCourse, updateCourse, fetchTeachers, fetchDegrees } from '../secretary.api';
import type { CourseListItem, TeacherListItem, DegreeListItem } from '@server/entities/frontend';
import { MacroArea } from '@server/entities/frontend';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

interface CourseModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    course: CourseListItem | null;
    onClose: () => void;
    onSave: () => void;
}

const selectCls = "w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed";
const dropdownCls = "absolute z-10 mt-1 w-full bg-background border border-border rounded-lg shadow-lg overflow-y-auto max-h-[120px]";

export function CourseModal({ isOpen, mode, course, onClose, onSave }: CourseModalProps) {
    const [courseName, setCourseName] = useState('');

    const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
    const [teacherSearch, setTeacherSearch] = useState('');
    const [teacherOpen, setTeacherOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherListItem | null>(null);
    const teacherRef = useRef<HTMLDivElement>(null);

    const [degrees, setDegrees] = useState<DegreeListItem[]>([]);
    const [selectedMacroArea, setSelectedMacroArea] = useState('');
    const [selectedGroupKey, setSelectedGroupKey] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const loadData = async () => {
        const [t, d] = await Promise.all([fetchTeachers(), fetchDegrees()]);
        setTeachers(t);
        setDegrees(d);
        if (mode === 'edit' && course) {
            const teacherMatch = t.find((tc) => tc.id === course.teacher.id);
            if (teacherMatch) setSelectedTeacher(teacherMatch);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        setModalError(null);
        if (mode === 'edit' && course) {
            setCourseName(course.courseName);
            setSelectedMacroArea(course.degree.macroArea);
            setSelectedGroupKey(`${course.degree.degreeName}|${course.degree.degreeType}`);
            setSelectedYear(course.degree.degreeYear);
        } else {
            setCourseName('');
            setSelectedTeacher(null);
            setTeacherSearch('');
            setSelectedMacroArea('');
            setSelectedGroupKey('');
            setSelectedYear('');
        }
    }, [isOpen, mode, course]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (teacherRef.current && !teacherRef.current.contains(e.target as Node))
                setTeacherOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filteredTeachers = teachers.filter((t) =>
        `${t.name} ${t.surname}`.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.email.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    const degreeGroups = useMemo(() => {
        if (!selectedMacroArea) return [];
        const seen = new Set<string>();
        const result: { key: string; label: string }[] = [];
        for (const d of degrees) {
            if (d.macroArea !== selectedMacroArea) continue;
            const key = `${d.degreeName}|${d.degreeType}`;
            if (!seen.has(key)) {
                seen.add(key);
                result.push({ key, label: `${d.degreeName} ${d.degreeType}` });
            }
        }
        return result.sort((a, b) => a.label.localeCompare(b.label));
    }, [degrees, selectedMacroArea]);

    const availableYears = useMemo(() => {
        if (!selectedGroupKey) return [];
        const [name, type] = selectedGroupKey.split('|');
        return degrees
            .filter((d) => d.degreeName === name && d.degreeType === type)
            .map((d) => d.degreeYear)
            .sort();
    }, [degrees, selectedGroupKey]);

    const resolvedDegreeId = useMemo(() => {
        if (!selectedGroupKey || !selectedYear) return null;
        const [name, type] = selectedGroupKey.split('|');
        return degrees.find(
            (d) => d.degreeName === name && d.degreeType === type && d.degreeYear === selectedYear
        )?.id ?? null;
    }, [degrees, selectedGroupKey, selectedYear]);

    const handleMacroAreaChange = (value: string) => {
        setSelectedMacroArea(value);
        setSelectedGroupKey('');
        setSelectedYear('');
    };

    const handleGroupKeyChange = (value: string) => {
        setSelectedGroupKey(value);
        setSelectedYear('');
    };

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (!selectedTeacher) { setModalError('Seleziona un docente.'); return; }
        if (!resolvedDegreeId) { setModalError('Seleziona MacroArea, Corso di Laurea e Anno.'); return; }
        try {
            setSubmitting(true);
            setModalError(null);
            const payload = { courseName, teacherId: selectedTeacher.id, degreeId: resolvedDegreeId };
            if (mode === 'create') await createCourse(payload);
            else if (mode === 'edit' && course) await updateCourse(course.id, payload);
            onSave();
            onClose();
        } catch (err: any) {
            setModalError(err.message || 'Errore durante il salvataggio della materia.');
        } finally {
            setSubmitting(false);
        }
    };

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
                            <Input
                                id="course-name"
                                type="text"
                                required
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="Es. Analisi Matematica 1"
                            />
                        </div>

                        <div ref={teacherRef} className="relative flex flex-col gap-1.5">
                            <Label>Docente</Label>
                            {selectedTeacher ? (
                                <div className="flex items-center gap-2 w-full px-3 py-2 border border-primary rounded-md bg-background">
                                    <span className="flex-1 text-sm text-foreground">
                                        {selectedTeacher.name} {selectedTeacher.surname}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedTeacher(null); setTeacherSearch(''); }}
                                        className="text-muted-foreground hover:text-destructive text-sm"
                                    >✕</button>
                                </div>
                            ) : (
                                <Input
                                    type="text"
                                    required
                                    placeholder="Cerca un docente..."
                                    value={teacherSearch}
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
                                                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                                            >
                                                <span className="block text-sm text-foreground">{t.name} {t.surname}</span>
                                                <span className="block text-xs text-muted-foreground">{t.email}</span>
                                            </button>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="macro-area">MacroArea</Label>
                            <select
                                id="macro-area"
                                required
                                value={selectedMacroArea}
                                onChange={(e) => handleMacroAreaChange(e.target.value)}
                                className={selectCls}
                            >
                                <option value="">— Seleziona un'area —</option>
                                {Object.values(MacroArea).map((area) => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="degree-group">Corso di Laurea</Label>
                            <select
                                id="degree-group"
                                required
                                value={selectedGroupKey}
                                onChange={(e) => handleGroupKeyChange(e.target.value)}
                                disabled={!selectedMacroArea}
                                className={selectCls}
                            >
                                <option value="">— Seleziona un corso —</option>
                                {degreeGroups.map((g) => (
                                    <option key={g.key} value={g.key}>{g.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="degree-year">Anno</Label>
                            <select
                                id="degree-year"
                                required
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                disabled={!selectedGroupKey}
                                className={selectCls}
                            >
                                <option value="">— Seleziona un anno —</option>
                                {availableYears.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
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
