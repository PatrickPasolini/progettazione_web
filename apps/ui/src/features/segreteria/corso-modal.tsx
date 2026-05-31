import { useState, useEffect } from 'react';
import { createDegree, updateDegree } from './segreteria.api';
import type { DegreeListItem, DegreeType, DegreeYear, MacroArea } from '@server/entities/frontend';

interface CorsoModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    degree: DegreeListItem | null;
    onClose: () => void;
    onSave: () => void;
}

export function CorsoModal({ isOpen, mode, degree, onClose, onSave }: CorsoModalProps) {
    const [degreeName, setDegreeName] = useState('');
    const [degreeType, setDegreeType] = useState<DegreeType>('LT' as DegreeType);
    const [degreeYear, setDegreeYear] = useState<DegreeYear>('I' as DegreeYear);
    const [macroArea, setMacroArea] = useState<MacroArea | ''>('');

    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    useEffect(() => {
        if (mode === 'edit' && degree) {
            setDegreeName(degree.degreeName);
            setDegreeType(degree.degreeType);
            setDegreeYear(degree.degreeYear);
            setMacroArea(degree.macroArea);
        } else {
            setDegreeName('');
            setDegreeType('LT' as DegreeType);
            setDegreeYear('I' as DegreeYear);
            setMacroArea('');
        }
        setModalError(null);
    }, [isOpen, mode, degree]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setModalError(null);

            if (mode === 'create') {
                await createDegree({ degreeName, degreeType, degreeYear, macroArea: macroArea as MacroArea });
            } else if (mode === 'edit' && degree) {
                await updateDegree(degree.id, { degreeName, degreeType, degreeYear, macroArea: macroArea as MacroArea });
            }
            onSave();
            onClose();
        } catch (err: any) {
            setModalError(err.message || "Errore durante il salvataggio del corso di laurea.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen)
        return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-line rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                <div className="bg-bg/30 px-6 py-4 border-b border-line">
                    <h3 className="font-bold text-lg text-ink">
                        {mode === 'create' ? 'Aggiungi Nuovo Corso di Laurea' : 'Modifica Corso di Laurea'}
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
                                value={degreeName}
                                onChange={(e) => setDegreeName(e.target.value)}
                                className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink"
                                placeholder="Es. Ingegneria Informatica"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-ink-3 mb-1">Tipo</label>
                            <select
                                required
                                value={degreeType}
                                onChange={(e) => setDegreeType(e.target.value as DegreeType)}
                                className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink bg-white"
                            >
                                <option value="LT">Triennale (LT)</option>
                                <option value="LM">Magistrale (LM)</option>
                                <option value="LMCU">Ciclo Unico (LMCU)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-ink-3 mb-1">Anno</label>
                            <select
                                required
                                value={degreeYear}
                                onChange={(e) => setDegreeYear(e.target.value as DegreeYear)}
                                className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink bg-white"
                            >
                                <option value="I">I</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                                <option value="IV">IV</option>
                                <option value="V">V</option>
                                <option value="VI">VI</option>
                                <option value="VII">VII</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-ink-3 mb-1">Area</label>
                            <select
                                required
                                value={macroArea}
                                onChange={(e) => setMacroArea(e.target.value as MacroArea)}
                                className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink bg-white"
                            >
                                <option value="" disabled>Seleziona area...</option>
                                <option value="Agraria">Agraria</option>
                                <option value="Biotecnologie">Biotecnologie</option>
                                <option value="Economia">Economia</option>
                                <option value="Farmacia">Farmacia</option>
                                <option value="Giurisprudenza">Giurisprudenza</option>
                                <option value="Ingegneria">Ingegneria</option>
                                <option value="Medicina">Medicina</option>
                                <option value="Scienze Motorie">Scienze Motorie</option>
                                <option value="Scienze Politiche e Sociali">Scienze Politiche e Sociali</option>
                            </select>
                        </div>
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
