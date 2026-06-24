import { useEffect, useMemo, useState } from "react";
import { fetchCourses, deleteCourse, fetchDegrees } from "../segreteria.api";
import { CourseListItem, DegreeListItem } from '@server/entities/frontend';
import { MateriaModal } from '../components/materia-modal';
import { ErrorDialog } from '../../../components/ui/error-dialog';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';

interface YearLeaf {
    degreeId: number;
    degreeYear: string;
    courses: CourseListItem[];
}

interface GroupNode {
    label: string;
    degreeType: string;
    years: YearLeaf[];
}

interface AreaNode {
    area: string;
    groups: GroupNode[];
}

export function MateriePage() {
    const [courses, setCourses] = useState<CourseListItem[]>([]);
    const [degrees, setDegrees] = useState<DegreeListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">('create');
    const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(null);

    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const [courseData, degreeData] = await Promise.all([fetchCourses(), fetchDegrees()]);
            setCourses(courseData);
            setDegrees(degreeData);
        } catch (err: any) {
            setError(err.message || 'Errore nel caricamento delle materie');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const tree = useMemo(() => {
        const areaMap = new Map<string, Map<string, YearLeaf[]>>();

        for (const degree of degrees) {
            const groupKey = `${degree.degreeName}|${degree.degreeType}`;
            if (!areaMap.has(degree.macroArea)) areaMap.set(degree.macroArea, new Map());
            const area = areaMap.get(degree.macroArea)!;
            if (!area.has(groupKey)) area.set(groupKey, [] as YearLeaf[]);
            const group = area.get(groupKey)!;
            if (!group.find((y) => y.degreeId === degree.id))
                group.push({ degreeId: degree.id, degreeYear: degree.degreeYear, courses: [] });
        }

        for (const c of courses) {
            const { degree } = c;
            const groupKey = `${degree.degreeName}|${degree.degreeType}`;
            const area = areaMap.get(degree.macroArea);
            const year = area?.get(groupKey)?.find((y) => y.degreeId === degree.id);
            if (year) year.courses.push(c);
        }

        const typeOrder: Record<string, number> = { LT: 1, LM: 2, LMCU: 3 };
        const yearOrder = ['I', 'II', 'III', 'IV', 'V', 'VI'];

        const result: AreaNode[] = [];
        for (const [area, groupMap] of areaMap) {
            const groups: GroupNode[] = [];
            for (const [gk, years] of groupMap) {
                const [degreeName, degreeType] = gk.split('|');
                years.sort((a, b) => yearOrder.indexOf(a.degreeYear) - yearOrder.indexOf(b.degreeYear));
                groups.push({
                    label: `${degreeName} ${degreeType}`,
                    degreeType,
                    years,
                });
            }
            groups.sort((a, b) => {
                const tc = (typeOrder[a.degreeType] ?? 0) - (typeOrder[b.degreeType] ?? 0);
                if (tc !== 0) return tc;
                return a.label.localeCompare(b.label);
            });
            result.push({ area, groups });
        }
        result.sort((a, b) => a.area.localeCompare(b.area));

        return result;
    }, [courses, degrees]);

    const toggle = (key: string) => {
        const next = new Set(expanded);
        if (next.has(key)) next.delete(key); else next.add(key);
        setExpanded(next);
    };

    useEffect(() => {
        if (!searchTerm.trim()) return;
        const term = searchTerm.toLowerCase();
        const keys = new Set<string>();
        for (const areaNode of tree) {
            for (const group of areaNode.groups) {
                for (const year of group.years) {
                    const match = year.courses.some(
                        (c) =>
                            c.courseName.toLowerCase().includes(term) ||
                            `${c.teacher.name} ${c.teacher.surname}`.toLowerCase().includes(term)
                    );
                    if (match) {
                        keys.add(`area_${areaNode.area}`);
                        keys.add(`group_${areaNode.area}_${group.label}`);
                        keys.add(`year_${year.degreeId}`);
                    }
                }
            }
        }
        setExpanded(keys);
    }, [searchTerm, tree]);

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedCourse(null);
        setIsModalOpen(true);
    };

    const openEditModal = (course: CourseListItem) => {
        setModalMode('edit');
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number, name: string) => {
        setPendingDelete({ id, name });
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        setPendingDelete(null);
        try {
            await deleteCourse(pendingDelete.id);
            loadCourses();
        } catch (err: any) {
            setDeleteError(err.message || "Errore nell'eliminazione della materia");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Materie</h1>
                    <p className="text-sm text-gray-600">Gestione materie del dipartimento</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 rounded-lg font-medium shadow-sm transition-colors bg-accent text-white hover:bg-accent-2"
                >
                    + Aggiungi Materia
                </button>
            </div>

            <input
                type="text"
                placeholder="Cerca per nome corso o docente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-line rounded-lg px-4 py-2 text-sm text-ink
                           placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />

            {loading && <p className="text-ink-3">Caricamento in corso...</p>}
            {error && <p className="text-red-600 font-semibold">Errore: {error}</p>}

            {!loading && !error && tree.length === 0 && (
                <div className="bg-white border border-line rounded-xl shadow-sm p-8 text-center">
                    <p className="text-ink-4">Nessun corso di laurea inserito a sistema.</p>
                </div>
            )}

            {!loading && !error && tree.length > 0 && (
                <div className="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
                    {tree.map((areaNode) => {
                        const areaKey = `area_${areaNode.area}`;
                        const areaOpen = expanded.has(areaKey);
                        return (
                            <div key={areaNode.area}>
                                <button
                                    onClick={() => toggle(areaKey)}
                                    className="w-full text-left px-6 py-3 font-bold text-ink bg-bg/30
                                               border-b border-line hover:bg-bg/50 transition-colors"
                                >
                                    {areaOpen ? '▼' : '▶'} {areaNode.area}
                                </button>
                                {areaOpen && (
                                    <div className="divide-y divide-line/50">
                                        {areaNode.groups.map((group) => {
                                            const groupKey = `group_${areaNode.area}_${group.label}`;
                                            const groupOpen = expanded.has(groupKey);
                                            return (
                                                <div key={groupKey}>
                                                    <button
                                                        onClick={() => toggle(groupKey)}
                                                        className="w-full text-left px-10 py-2 font-semibold text-ink text-sm
                                                                   hover:bg-bg/30 transition-colors border-b border-line/30"
                                                    >
                                                        {groupOpen ? '▼' : '▶'} {group.label}
                                                    </button>
                                                    {groupOpen && (
                                                        <div>
                                                            {group.years.map((year) => {
                                                                const yearKey = `year_${year.degreeId}`;
                                                                const yearOpen = expanded.has(yearKey);
                                                                const term = searchTerm.trim().toLowerCase();
                                                                const displayCourses = term
                                                                    ? year.courses.filter(
                                                                        (c) =>
                                                                            c.courseName.toLowerCase().includes(term) ||
                                                                            `${c.teacher.name} ${c.teacher.surname}`.toLowerCase().includes(term)
                                                                      )
                                                                    : year.courses;
                                                                return (
                                                                    <div key={year.degreeId} className="border-b border-line/20 last:border-b-0">
                                                                        <button
                                                                            onClick={() => toggle(yearKey)}
                                                                            className="w-full text-left px-14 py-1.5 text-sm text-ink-2
                                                                                       hover:bg-bg/20 transition-colors flex items-center gap-2"
                                                                        >
                                                                            <span className="font-medium text-ink">
                                                                                Anno {year.degreeYear}
                                                                            </span>
                                                                            <span className="text-ink-4 text-xs">
                                                                                ({year.courses.length} {year.courses.length === 1 ? 'corso' : 'corsi'})
                                                                            </span>
                                                                        </button>
                                                                        {yearOpen && displayCourses.length > 0 && (
                                                                            <div className="px-14 pb-2">
                                                                                <div className="border border-line rounded-lg overflow-hidden bg-white">
                                                                                    <table className="w-full border-collapse text-left">
                                                                                        <thead>
                                                                                            <tr className="bg-bg/50 border-b border-line text-xs font-semibold text-ink-3 uppercase tracking-wider">
                                                                                                <th className="px-4 py-3 w-1/2">Nome Corso</th>
                                                                                                <th className="px-4 py-3">Docente</th>
                                                                                                <th className="px-4 py-3 text-right">Azioni</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody className="divide-y divide-line-2">
                                                                                            {displayCourses.map((course) => (
                                                                                                <tr key={course.id} className="hover:bg-bg/5 transition-colors">
                                                                                                    <td className="px-4 py-3 font-medium text-ink text-sm">{course.courseName}</td>
                                                                                                    <td className="px-4 py-3 text-ink-2 text-sm">
                                                                                                        {course.teacher.name} {course.teacher.surname}
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3 text-right space-x-3">
                                                                                                        <button
                                                                                                            onClick={() => openEditModal(course)}
                                                                                                            className="text-accent hover:text-accent-2 font-medium text-sm transition-colors"
                                                                                                        >
                                                                                                            Modifica
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={() => handleDelete(course.id, course.courseName)}
                                                                                                            className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                                                                                                        >
                                                                                                            Elimina
                                                                                                        </button>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ))}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {yearOpen && displayCourses.length === 0 && (
                                                                            <div className="px-14 pb-2">
                                                                                <p className="px-4 py-3 text-sm text-ink-4">
                                                                                    Nessuna materia trovata.
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmDialog
                open={!!pendingDelete}
                title="Elimina materia"
                description={<>Sei sicuro di voler eliminare la materia<br />"{pendingDelete?.name}"?</>}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />

            <ErrorDialog
                open={!!deleteError}
                message={deleteError}
                onClose={() => setDeleteError(null)}
            />

            {isModalOpen && (
                <MateriaModal
                    isOpen={isModalOpen}
                    mode={modalMode}
                    course={selectedCourse}
                    onClose={closeModal}
                    onSave={loadCourses}
                />
            )}
        </div>
    );
}
