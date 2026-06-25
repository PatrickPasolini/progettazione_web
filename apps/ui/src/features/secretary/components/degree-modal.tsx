import { useState, useEffect } from 'react';
import { createDegree, updateDegree, deleteDegree } from '../secretary.api';
import type { DegreeListItem, DegreeType, MacroArea } from '@server/entities/frontend';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

const ALL_YEARS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;

function yearsForType(type: string, cycleYears: number): string[] {
    if (type === 'LT') return ['I', 'II', 'III'];
    if (type === 'LM') return ['I', 'II'];
    return ALL_YEARS.slice(0, cycleYears);
}

interface DegreeModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    degreeGroup: DegreeListItem[];
    onClose: () => void;
    onSave: () => void;
}

export function DegreeModal({ isOpen, mode, degreeGroup, onClose, onSave }: DegreeModalProps) {
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
            setDegreeName(''); setDegreeType('LT'); setMacroArea(''); setCycleYears(5);
        }
        setModalError(null);
    }, [isOpen, mode, degreeGroup]);

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (!macroArea) { setModalError("Seleziona un'area"); return; }
        try {
            setSubmitting(true); setModalError(null);
            const newYears = yearsForType(degreeType, cycleYears);
            if (mode === 'create') {
                for (const year of newYears) {
                    await createDegree({ degreeName, degreeType: degreeType as DegreeType, degreeYear: year as any, macroArea: macroArea as MacroArea });
                }
            } else {
                const oldByYear = new Map(degreeGroup.map((d) => [d.degreeYear, d]));
                for (const year of newYears) {
                    const existing = oldByYear.get(year as any);
                    if (existing) await updateDegree(existing.id, { degreeName, degreeType: degreeType as DegreeType, degreeYear: year as any, macroArea: macroArea as MacroArea });
                    else await createDegree({ degreeName, degreeType: degreeType as DegreeType, degreeYear: year as any, macroArea: macroArea as MacroArea });
                }
                for (const [year, d] of oldByYear.entries()) {
                    if (!newYears.includes(year)) await deleteDegree(d.id);
                }
            }
            onSave(); onClose();
        } catch (err: any) {
            setModalError(err.message || 'Errore durante il salvataggio.');
        } finally {
            setSubmitting(false);
        }
    };

    const previewYears = yearsForType(degreeType, cycleYears);
    const selectCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

    return (
        <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Aggiungi Nuovo Corso di Laurea' : 'Modifica Corso di Laurea'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4 py-2">
                        {modalError && (
                            <div className="text-destructive bg-destructive/10 text-sm font-medium p-3 rounded-lg border border-destructive/20">
                                {modalError}
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="degree-name">Nome Corso</Label>
                            <Input id="degree-name" type="text" required value={degreeName} onChange={(e) => setDegreeName(e.target.value)} placeholder="Es. Ingegneria Informatica" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Tipo</Label>
                            <select required value={degreeType} onChange={(e) => setDegreeType(e.target.value)} className={selectCls}>
                                <option value="LT">Triennale (LT)</option>
                                <option value="LM">Magistrale (LM)</option>
                                <option value="LMCU">Ciclo Unico (LMCU)</option>
                            </select>
                        </div>

                        {degreeType === 'LMCU' && (
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="cycle-years">Numero di anni</Label>
                                <Input id="cycle-years" type="number" min={2} max={7} required value={cycleYears} onChange={(e) => setCycleYears(Math.min(7, Math.max(2, Number(e.target.value))))} className="w-24" />
                            </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                            {mode === 'create' ? 'Verranno create le annualità' : 'Annualità nel database'}:{' '}
                            <span className="font-mono font-semibold text-foreground">{previewYears.join(', ')}</span>
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <Label>Area</Label>
                            <select required value={macroArea} onChange={(e) => setMacroArea(e.target.value as MacroArea)} className={selectCls}>
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

                    <div className="flex justify-end gap-2 pt-4 border-t border-border mt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Annulla</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? 'Salvataggio…' : 'Salva'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
