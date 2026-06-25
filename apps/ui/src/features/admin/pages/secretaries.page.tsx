import { useEffect, useMemo, useState } from 'react';
import { fetchSecretaries, deleteSecretary, SecretaryListItem } from '../admin.api';
import { SecretaryModal } from '../components/secretary-modal';
import { ErrorDialog } from '../../../components/ui/error-dialog';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';

export function SecretariesPage() {
    const [secretaries, setSecretaries] = useState<SecretaryListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<{ id: number; fullName: string } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selected, setSelected] = useState<SecretaryListItem | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchSecretaries();
            setSecretaries(data);
        } catch (err: any) {
            setError(err.message || 'Errore nel caricamento dei segretari');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const list = !searchTerm.trim()
            ? secretaries
            : secretaries.filter(
                (s) =>
                    s.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        return [...list].sort((a, b) => a.surname.localeCompare(b.surname));
    }, [secretaries, searchTerm]);

    const openCreateModal = () => {
        setModalMode('create');
        setSelected(null);
        setIsModalOpen(true);
    };

    const openEditModal = (secretary: SecretaryListItem) => {
        setModalMode('edit');
        setSelected(secretary);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number, fullName: string) => {
        setPendingDelete({ id, fullName });
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        setPendingDelete(null);
        try {
            await deleteSecretary(pendingDelete.id);
            load();
        } catch (err: any) {
            setDeleteError(err.message || "Errore nell'eliminazione del segretario");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelected(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Segretari</h1>
                    <p className="text-sm text-gray-600">Gestione dei segretari a sistema</p>
                </div>
                <button onClick={openCreateModal}
                        className="bg-accent text-white hover:bg-accent-2 transition-colors
                                   px-4 py-2 rounded-lg font-medium shadow-sm"
                >
                    + Aggiungi Segretario
                </button>
            </div>

            <input
                type="text"
                placeholder="Cerca per cognome, nome o email..."
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
                                <th className="px-6 py-4">Cognome</th>
                                <th className="px-6 py-4">Nome</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line-2">
                            {secretaries.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-ink-4">
                                        Nessun segretario inserito a sistema.
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-ink-4">
                                        Nessun risultato trovato per "{searchTerm}".
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((s) => (
                                    <tr key={s.id} className="hover:bg-bg/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-ink">{s.surname}</td>
                                        <td className="px-6 py-4 text-ink-2">{s.name}</td>
                                        <td className="px-6 py-4 text-ink-3">{s.email}</td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button
                                                onClick={() => openEditModal(s)}
                                                className="text-accent hover:text-accent-2 font-medium text-sm transition-colors"
                                            >
                                                Modifica
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id, `${s.name} ${s.surname}`)}
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
                <SecretaryModal
                    isOpen={isModalOpen}
                    mode={modalMode}
                    secretary={selected}
                    onClose={closeModal}
                    onSave={load}
                />
            )}

            <ConfirmDialog
                open={!!pendingDelete}
                title="Elimina segretario"
                description={<>Sei sicuro di voler eliminare il segretario<br />"{pendingDelete?.fullName}"?</>}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />

            <ErrorDialog
                open={!!deleteError}
                message={deleteError}
                onClose={() => setDeleteError(null)}
            />
        </div>
    );
}
