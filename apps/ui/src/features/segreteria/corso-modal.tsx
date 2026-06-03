import { useState, useEffect } from 'react';
import { createDegree, updateDegree, deleteDegree } from './segreteria.api';
import type { DegreeListItem, DegreeType, MacroArea } from '@server/entities/frontend';

const ALL_YEARS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;

function yearsForType(type: string, cycleYears: number): string[] {
    if (type === 'LT') return ['I', 'II', 'III'];
    if (type === 'LM') return ['I', 'II'];
    return ALL_YEARS.slice(0, cycleYears);
}

interface CorsoModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    degreeGroup: DegreeListItem[];
    onClose: () => void;
    onSave: () => void;
}

export function CorsoModal({ isOpen, mode, degreeGroup, onClose, onSave }: CorsoModalProps) {
    const first = degreeGroup[0] ?? null;

    const [degreeName, setDegreeName] = useState('');
    const [degreeType, setDegreeType] = useState('LT');
    const [macroArea, setMacroArea] = useState<MacroArea | ''>('');
    const [cycleYears, setCycleYears] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    useEffect(() => {
        if (mode === 'edit' && first) {
            setDegreeName(first.degreeName);
            setDegreeType(first.degreeType);
            setMacroArea(first.macroArea as MacroArea);
            setCycleYears(degreeGroup.length >= 2 ? degreeGroup.length : 5);
        } else {
            setDegreeName('');
            setDegreeType('LT');
            setMacroArea('');
            setCycleYears(5);
        }
        setModalError(null);
    }, [isOpen, mode, degreeGroup]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!macroArea) { setModalError("Seleziona un'area"); return; }

        try {
            setSubmitting(true);
            setModalError(null);

            const newYears = yearsForType(degreeType, cycleYears);

            if (mode === 'create') {
                for (const year of newYears) {
                    await createDegree({
                        degreeName,
                        degreeType: degreeType as DegreeType,
                        degreeYear: year as any,
                        macroArea: macroArea as MacroArea,
                    });
                }
            } else {
                const oldByYear = new Map(degreeGroup.map((d) => [d.degreeYear, d]));

                for (const year of newYears) {
                    const existing = oldByYear.get(year as any);
                    if (existing) {
                        await updateDegree(existing.id, {
                            degreeName,
                            degreeType: degreeType as DegreeType,
                            degreeYear: year as any,
                            macroArea: macroArea as MacroArea,
                        });
                    } else {
                        await createDegree({
                            degreeName,
                            degreeType: degreeType as DegreeType,
                            degreeYear: year as any,
                            macroArea: macroArea as MacroArea,
                        });
                    }
                }

                for (const [year, d] of oldByYear.entries()) {
                    if (!newYears.includes(year)) {
                        await deleteDegree(d.id);
                    }
                }
            }

            onSave();
            onClose();
        } catch (err: any) {
            setModalError(err.message || 'Errore durante il salvataggio.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const previewYears = yearsForType(degreeType, cycleYears);

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
                                onChange={(e) => setDegreeType(e.target.value)}
                                className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink bg-white"
                            >
                                <option value="LT">Triennale (LT)</option>
                                <option value="LM">Magistrale (LM)</option>
                                <option value="LMCU">Ciclo Unico (LMCU)</option>
                            </select>
                        </div>

                        {degreeType === 'LMCU' && (
                            <div>
                                <label className="block text-xs font-semibold uppercase text-ink-3 mb-1">
                                    Numero di anni
                                </label>
                                <input
                                    type="number"
                                    min={2}
                                    max={7}
                                    required
                                    value={cycleYears}
                                    onChange={(e) => setCycleYears(Math.min(7, Math.max(2, Number(e.target.value))))}
                                    className="w-24 px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink"
                                />
                            </div>
                        )}

                        <p className="text-xs text-ink-3">
                            {mode === 'create' ? 'Verranno create le annualità' : 'Annualità nel database'}:{' '}
                            <span className="font-mono font-semibold text-ink-2">{previewYears.join(', ')}</span>
                        </p>

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
