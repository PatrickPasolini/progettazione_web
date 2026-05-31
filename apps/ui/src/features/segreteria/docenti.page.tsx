import { useEffect, useMemo, useState } from "react";
import { fetchTeachers, deleteTeacher } from "./segreteria.api";
import { TeacherListItem } from '@server/entities/frontend';
import { DocenteModal } from './docente-modal';

export function DocentiPage() {
    // visualizzazione tabella
    const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    //modale per aggiungere o modificare un docente
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">('create');
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherListItem | null>(null);

    //ricerca
    const [searchTerm, setSearchTerm] = useState("");

    const loadTeachers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchTeachers();
            setTeachers(data); // save data
        } catch (err: any) {
            setError(err.message || 'Errore nel caricamento dei docenti');
        } finally {
            setLoading(false); // finish loading
        }
    }

    // Esegue 'loadTeachers' una sola volta
    useEffect(() => {
        loadTeachers();
    }, []);

    const filteredTeachers = useMemo(() => {
        const list = !searchTerm.trim()
            ? teachers
            : teachers.filter(
                (t) =>
                    t.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        return [...list].sort((a, b) => a.surname.localeCompare(b.surname));
    }, [teachers, searchTerm]);

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedTeacher(null);
        setIsModalOpen(true);
    };

    const openEditModal = (teacher: TeacherListItem) => {
        setModalMode('edit');
        setSelectedTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number, fullName: string) => {
        if (window.confirm(`Sei sicuro di voler eliminare il docente ${fullName}?'`)) {
            try {
                await deleteTeacher(id);
                loadTeachers();
            } catch (err: any) {
                setError(err.message || 'Errore nell eliminazione del docente');
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTeacher(null);
    };

    return (
        <div className="space-y-6">
            {/* Header con bottone per aggiunta che apre il modal*/}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Docenti</h1>
                    <p className="text-sm text-gray-600">Gestione docenti del dipartimento</p>
                </div>
                <button onClick={openCreateModal}
                        className="bg-accent text-white hover:bg-accent-2 transition-colors
                                   px-4 py-2 rounded-lg font-medium shadow-sm"
                >
                    + Aggiungi Docente
                </button>
            </div>

            {/* Barra di ricerca */}
            <input
                type="text"
                placeholder="Cerca per cognome, nome o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-line rounded-lg px-4 py-2 text-sm text-ink
                           placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />

            {/* Visualizzazione degli stati di Caricamento o Errore */}
            {loading && <p className="text-ink-3">Caricamento in corso...</p>}
            {error && <p className="text-red-600 font-semibold">Errore: {error}</p>}

            {/* Tabella dei docenti con i pulsanti per modifica e elimina*/}
            {!loading && !error && (
                <div className="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-bg/50 border-b border-line text-xs font-semibold text-ink-3 uppercase tracking-wider">
                                <th className="px-6 py-4">Cognome</th>
                                <th className="px-6 py-4">Nome</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line-2">
                            {teachers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-ink-4">
                                        Nessun docente inserito a sistema.
                                    </td>
                                </tr>
                            ) : filteredTeachers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-ink-4">
                                        Nessun risultato trovato per "{searchTerm}".
                                    </td>
                                </tr>
                            ) : (
                                filteredTeachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-bg/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-ink">{teacher.surname}</td>
                                        <td className="px-6 py-4 text-ink-2">{teacher.name}</td>
                                        <td className="px-6 py-4 text-ink-3">{teacher.email}</td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button
                                                onClick={() => openEditModal(teacher)}
                                                className="text-accent hover:text-accent-2 font-medium text-sm transition-colors"
                                            >
                                                Modifica
                                            </button>
                                            <button
                                                onClick={() => handleDelete(teacher.id, `${teacher.name} ${teacher.surname}`)}
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

            {/* Modale per inserimento / modifica docente (sarà importato dal file che scriveremo qui a breve) */}
            {isModalOpen && (
                <DocenteModal
                    isOpen={isModalOpen}
                    mode={modalMode}
                    teacher={selectedTeacher}
                    onClose={closeModal}
                    onSave={loadTeachers}
                />
            )}

        </div>

    );
    
}