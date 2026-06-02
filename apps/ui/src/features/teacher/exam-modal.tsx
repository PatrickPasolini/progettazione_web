import { useState } from 'react';

function formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

const HOURS = Array.from({ length: 19 }, (_, i) => {
    const h = Math.floor(i / 2) + 9;
    const min = i % 2 === 0 ? '00' : '30';
    return `${pad(h)}:${min}`;
});

function pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
}

interface ExamModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    courseName: string;
    degreeName: string;
    selectedDate: string;
    currentStartTime?: string;
    currentEndTime?: string;
    onClose: () => void;
    onSave: (startTime: string, endTime: string) => void;
    onDelete?: () => void;
}

export function ExamModal({
    isOpen,
    mode,
    courseName,
    degreeName,
    selectedDate,
    currentStartTime,
    currentEndTime,
    onClose,
    onSave,
    onDelete,
}: ExamModalProps) {
    const [startTime, setStartTime] = useState(currentStartTime ?? '09:00');
    const [endTime, setEndTime] = useState(currentEndTime ?? '11:00');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!startTime || !endTime) {
            setError('Seleziona ora inizio e fine');
            return;
        }
        if (startTime >= endTime) {
            setError('L\'ora di fine deve essere dopo l\'ora di inizio');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            await onSave(startTime, endTime);
        } catch (e: any) {
            setError(e.message ?? 'Errore durante il salvataggio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-paper rounded-xl p-6 w-full max-w-md shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="font-serif text-2xl m-0 mb-6">
                    {mode === 'create' ? 'Nuovo appello' : 'Modifica appello'}
                </h2>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-ink-2 uppercase tracking-wide">
                            Corso
                        </span>
                        <span className="text-sm text-ink font-medium">{courseName}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-ink-2 uppercase tracking-wide">
                            Corso di Laurea
                        </span>
                        <span className="text-sm text-ink">{degreeName}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-ink-2 uppercase tracking-wide">
                            Data
                        </span>
                        <span className="text-sm text-ink font-semibold">
                            {formatDate(selectedDate)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-ink-2 uppercase tracking-wide">
                                Inizio
                            </label>
                            <select
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-line text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-paper shadow-sm"
                            >
                                {HOURS.map((h) => (
                                    <option key={h} value={h}>
                                        {h}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-ink-2 uppercase tracking-wide">
                                Fine
                            </label>
                            <select
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-line text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-paper shadow-sm"
                            >
                                {HOURS.map((h) => (
                                    <option key={h} value={h}>
                                        {h}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>
                )}

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-line">
                    {mode === 'edit' && onDelete && (
                        <button
                            onClick={onDelete}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm hover:bg-red-50 transition-colors disabled:opacity-50 mr-auto"
                        >
                            Elimina
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg border border-line text-ink-2 text-sm hover:bg-line-2 transition-colors disabled:opacity-50"
                    >
                        Annulla
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent-2 transition-colors disabled:opacity-50"
                    >
                        {loading
                            ? 'Salvataggio…'
                            : mode === 'create'
                                ? 'Crea'
                                : 'Salva'}
                    </button>
                </div>
            </div>
        </div>
    );
}
