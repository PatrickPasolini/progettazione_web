import { useState, useEffect } from 'react';
import { createTeacher, updateTeacher } from '../secretary.api';
import type { TeacherListItem } from '@server/entities/frontend';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

interface TeacherModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    teacher: TeacherListItem | null;
    onClose: () => void;
    onSave: () => void;
}

export function TeacherModal({ isOpen, mode, teacher, onClose, onSave }: TeacherModalProps) {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    useEffect(() => {
        if (mode === 'edit' && teacher) {
            setName(teacher.name); setSurname(teacher.surname); setEmail(teacher.email); setPassword('');
        } else {
            setName(''); setSurname(''); setEmail(''); setPassword('');
        }
        setModalError(null);
    }, [isOpen, mode, teacher]);

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        try {
            setSubmitting(true); setModalError(null);
            if (mode === 'create') await createTeacher({ name, surname, email, password });
            else if (mode === 'edit' && teacher) await updateTeacher(teacher.id, { name, surname, email });
            onSave(); onClose();
        } catch (err: any) {
            setModalError(err.message || 'Errore durante il salvataggio del docente.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Aggiungi Nuovo Docente' : 'Modifica Docente'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4 py-2">
                        {modalError && (
                            <div className="text-destructive bg-destructive/10 text-sm font-medium p-3 rounded-lg border border-destructive/20">
                                {modalError}
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="doc-name">Nome</Label>
                            <Input id="doc-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Daniela" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="doc-surname">Cognome</Label>
                            <Input id="doc-surname" type="text" required value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Es. Fogli" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="doc-email">Email</Label>
                            <Input id="doc-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="daniela.fogli@unibs.it" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="doc-password">
                                Password {mode === 'edit' && <span className="text-muted-foreground font-normal">(lascia vuoto per non modificare)</span>}
                            </Label>
                            <Input id="doc-password" type="password" required={mode === 'create'} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
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
