import { useEffect, useMemo, useState } from "react";
import { fetchCourses, deleteCourse } from "./segreteria.api";
import { CourseListItem } from '@server/entities/frontend';
import { MateriaModal } from './materia-modal';

export function MateriePage() {
    const [courses, setCourses] = useState<CourseListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">('create');
    const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(null);

    const [searchTerm, setSearchTerm] = useState("");

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchCourses();
            setCourses(data);
        } catch (err: any) {
            setError(err.message || 'Errore nel caricamento delle materie');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        if (!searchTerm.trim()) return courses;
        const term = searchTerm.toLowerCase();
        return courses.filter((c) =>
            c.courseName.toLowerCase().includes(term) ||
            `${c.teacher.name} ${c.teacher.surname}`.toLowerCase().includes(term) ||
            c.degrees.some((d) => d.degreeName.toLowerCase().includes(term))
        );
    }, [courses, searchTerm]);

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

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Sei sicuro di voler eliminare la materia "${name}"?`)) {
            try {
                await deleteCourse(id);
                loadCourses();
            } catch (err: any) {
                setError(err.message || "Errore nell'eliminazione della materia");
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Materie</h1>
                    <p className="text-sm text-gray-600">Gestione materie del dipartimento</p>
                </div>
                <button onClick={openCreateModal}
                        className="bg-accent text-white hover:bg-accent-2 transition-colors
                                   px-4 py-2 rounded-lg font-medium shadow-sm"
                >
                    + Aggiungi Materia
                </button>
            </div>

            <input
                type="text"
                placeholder="Cerca per nome materia, docente o corso di laurea..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-line rounded-lg px-4 py-2 text-sm text-ink
                           placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />

            {loading && <p className="text-ink-3">Caricamento in corso...</p>}
            {error && <p className="text-red-600 font-semibold">Errore: {error}</p>}

            {!loading && !error && (
                <div className="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-bg/50 border-b border-line text-xs font-semibold text-ink-3 uppercase tracking-wider">
                                <th className="px-6 py-4">Nome Corso</th>
                                <th className="px-6 py-4">Docente</th>
                                <th className="px-6 py-4">Corsi di Laurea</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line-2">
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-ink-4">
                                        Nessuna materia inserita a sistema.
                                    </td>
                                </tr>
                            ) : filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-ink-4">
                                        Nessun risultato trovato{searchTerm && <> per "{searchTerm}"</>}.
                                    </td>
                                </tr>
                            ) : (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-bg/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-ink">{course.courseName}</td>
                                        <td className="px-6 py-4 text-ink-2">{course.teacher.name} {course.teacher.surname}</td>
                                        <td className="px-6 py-4 text-ink-3">
                                            {course.degrees.map((d) => d.degreeName).join(", ")}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

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
