import { useState, useEffect } from 'react';
import { createTeacher, updateTeacher } from './segreteria.api';
import type { TeacherListItem } from '@server/entities';

// Interfaccia delle proprietà (Props) che il componente padre passerà a questo Modale
interface DocenteModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    teacher: TeacherListItem | null; // Nullo in modalità creazione
    onClose: () => void;            // Funzione per chiudere il modale
    onSave: () => void;             // Funzione per dire alla pagina di ricaricare la lista
}

export function DocenteModal({ isOpen, mode, teacher, onClose, onSave }: DocenteModalProps) {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    
    // Questo effetto controlla quando il modale si apre o cambia modalità.
    // Se stiamo modificando un docente, precompila i campi con i suoi dati correnti.
    // Se stiamo creando, svuota i campi del form.
    useEffect(() => {
        if (mode === 'edit' && teacher) {
            setName(teacher.name);
            setSurname(teacher.surname);
            setEmail(teacher.email);
            setPassword('');
        } else {
            setName('');
            setSurname('');
            setEmail('');
            setPassword('');
        }
        setModalError(null);
    }, [isOpen, mode, teacher]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setModalError(null);

            if (mode === 'create') {
                await createTeacher({name, surname, email, password});      // TODO: mettere onetimepassword automatica di default
            } else if (mode === 'edit' && teacher) {
                await updateTeacher(teacher.id, {name, surname, email});    // TODO: modificare anche la password? Forse creando una nuova hash per la nuova password? 
            }
            onSave();
            onClose();
        } catch (err: any) {
            setModalError(err.message || "Errore durante il salvataggio del docente.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen)
        return null;

        return (
        /* 1. Il Backdrop: copre tutto lo schermo, lo oscura (bg-black/40) e lo sfoca (backdrop-blur-sm) */
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            
            {/* 2. Il "Quadrato" del Form: centrato, bianco (bg-white), arrotondato, con ombra */}
            <div className="bg-white border border-line rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                
                {/* Header del modale */}
                <div className="bg-bg/30 px-6 py-4 border-b border-line">
                    <h3 className="font-bold text-lg text-ink">
                        {mode === 'create' ? 'Aggiungi Nuovo Docente' : 'Modifica Docente'}
                    </h3>
                </div>

                {/* Form di inserimento dati */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        
                        {/* Se ci sono errori, li mostriamo in rosso all'interno del form */}
                        {modalError && (
                            <div className="text-red-600 bg-red-50 text-sm font-medium p-3 rounded-lg border border-red-100">
                                {modalError}
                            </div>
                        )}

                        {/* Campo Nome */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-ink-3 mb-1">Nome</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink"
                                placeholder="Es. Daniela"
                            />
                        </div>

                        {/* Campo Cognome */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-ink-3 mb-1">Cognome</label>
                            <input
                                type="text"
                                required
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink"
                                placeholder="Es. Fogli"
                            />
                        </div>

                        {/* Campo Email */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-ink-3 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink"
                                placeholder="daniela.fogli@unibs.it"
                            />
                        </div>

                        {/* Campo Password (obbligatorio solo alla creazione) */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-ink-3 mb-1">
                                Password {mode === 'edit' && '(lascia vuoto per non modificare)'}
                            </label>
                            <input
                                type="password"
                                required={mode === 'create'}
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:border-accent text-ink"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Pulsanti di Azione in basso */}
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
