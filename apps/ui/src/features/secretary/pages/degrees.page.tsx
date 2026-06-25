import { useEffect, useMemo, useState } from "react";
import { fetchDegrees, deleteDegree } from "../secretary.api";
import { DegreeListItem, DegreeType, MacroArea } from '@server/entities/frontend';
import { DegreeModal } from '../components/degree-modal';
import { ErrorDialog } from '../../../components/ui/error-dialog';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';

export function DegreesPage() {
    const [degrees, setDegrees] = useState<DegreeListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">('create');
    const [selectedGroup, setSelectedGroup] = useState<DegreeListItem[]>([]);

    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<DegreeListItem[] | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterArea, setFilterArea] = useState("");

    const loadDegrees = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchDegrees();
            setDegrees(data);
        } catch (err: any) {
            setError(err.message || 'Errore nel caricamento dei corsi di laurea');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDegrees();
    }, []);

    const filteredDegrees = useMemo(() => {
        let list = degrees;

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            list = list.filter(
                (d) =>
                    d.degreeName.toLowerCase().includes(term) ||
                    d.macroArea.toLowerCase().includes(term)
            );
        }

        if (filterType) {
            list = list.filter((d) => d.degreeType === filterType);
        }

        if (filterArea) {
            list = list.filter((d) => d.macroArea === filterArea);
        }

        return [...list].sort((a, b) => {
            const areaCmp = a.macroArea.localeCompare(b.macroArea);
            if (areaCmp !== 0) return areaCmp;
            const nameCmp = a.degreeName.localeCompare(b.degreeName);
            if (nameCmp !== 0) return nameCmp;
            const typeOrder: Record<string, number> = { LT: 1, LM: 2, LMCU: 3 };
            const typeCmp = (typeOrder[a.degreeType] ?? 0) - (typeOrder[b.degreeType] ?? 0);
            if (typeCmp !== 0) return typeCmp;
            return a.degreeYear.localeCompare(b.degreeYear);
        });
    }, [degrees, searchTerm, filterType, filterArea]);

    const groupedDegrees = useMemo(() => {
        const map = new Map<string, DegreeListItem[]>();
        for (const d of filteredDegrees) {
            const key = `${d.degreeName}||${d.macroArea}||${d.degreeType}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(d);
        }
        return [...map.values()];
    }, [filteredDegrees]);

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedGroup([]);
        setIsModalOpen(true);
    };

    const openEditModal = (group: DegreeListItem[]) => {
        setModalMode('edit');
        setSelectedGroup(group);
        setIsModalOpen(true);
    };

    const handleDelete = (group: DegreeListItem[]) => {
        setPendingDelete(group);
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        setPendingDelete(null);
        try {
            for (const d of pendingDelete) {
                await deleteDegree(d.id);
            }
            loadDegrees();
        } catch (err: any) {
            setDeleteError(err.message || "Errore nell'eliminazione del corso di laurea");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedGroup([]);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Corsi di Laurea</h1>
                    <p className="text-sm text-gray-600">Gestione corsi di laurea del dipartimento</p>
                </div>
                <button onClick={openCreateModal}
                        className="bg-accent text-white hover:bg-accent-2 transition-colors
                                   px-4 py-2 rounded-lg font-medium shadow-sm"
                >
                    + Aggiungi Corso di Laurea
                </button>
            </div>

            <div className="flex gap-3">
                <input
                    type="text"
                    placeholder="Cerca per nome corso o area..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 border border-line rounded-lg px-4 py-2 text-sm text-ink
                               placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-36 border border-line rounded-lg px-3 py-2 text-sm text-ink bg-white
                               focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                    <option value="">Tutti i tipi</option>
                    {Object.values(DegreeType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <select
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    className="w-48 border border-line rounded-lg px-3 py-2 text-sm text-ink bg-white
                               focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                    <option value="">Tutte le aree</option>
                    {Object.values(MacroArea).map((area) => (
                        <option key={area} value={area}>{area}</option>
                    ))}
                </select>
                <button
                    onClick={() => { setSearchTerm(""); setFilterType(""); setFilterArea(""); }}
                    className="px-3 py-2 text-sm text-ink-3 hover:text-red-600 border border-line
                               rounded-lg transition-colors"
                    title="Resetta filtri"
                >
                    ✕
                </button>
            </div>

            {loading && <p className="text-ink-3">Caricamento in corso...</p>}
            {error && <p className="text-red-600 font-semibold">Errore: {error}</p>}

            {!loading && !error && (
                <div className="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-bg/50 border-b border-line text-xs font-semibold text-ink-3 uppercase tracking-wider">
                                <th className="px-6 py-4">Nome Corso</th>
                                <th className="px-6 py-4">Area</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Anno</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line-2">
                            {degrees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-ink-4">
                                        Nessun corso di laurea inserito a sistema.
                                    </td>
                                </tr>
                            ) : filteredDegrees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-ink-4">
                                        Nessun risultato trovato
                                        {searchTerm && <> per "{searchTerm}"</>}
                                        {filterType && <> — {filterType}</>}
                                        {filterArea && <> — {filterArea}</>}
                                        .
                                    </td>
                                </tr>
                            ) : (
                                groupedDegrees.map((group) => (
                                    <tr key={group.map((d) => d.id).join('-')} className="hover:bg-bg/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-ink">{group[0].degreeName}</td>
                                        <td className="px-6 py-4 text-ink-3">{group[0].macroArea}</td>
                                        <td className="px-6 py-4 text-ink-2">{group[0].degreeType}</td>
                                        <td className="px-6 py-4 text-ink-3">
                                            {group.map((d) => d.degreeYear).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button
                                                onClick={() => openEditModal(group)}
                                                className="text-accent hover:text-accent-2 font-medium text-sm transition-colors"
                                            >
                                                Modifica
                                            </button>
                                            <button
                                                onClick={() => handleDelete(group)}
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
                <DegreeModal
                    isOpen={isModalOpen}
                    mode={modalMode}
                    degreeGroup={selectedGroup}
                    onClose={closeModal}
                    onSave={loadDegrees}
                />
            )}

            <ConfirmDialog
                open={!!pendingDelete}
                title="Elimina corso di laurea"
                description={<>Sei sicuro di voler eliminare il corso di laurea<br />"{pendingDelete?.[0]?.degreeName}"?</>}
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
