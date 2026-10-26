import { useState, useEffect } from 'react';
import { createSecretary, updateSecretary, SecretaryListItem } from '../admin.api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

interface SecretaryModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    secretary: SecretaryListItem | null;
    onClose: () => void;
    onSave: () => void;
}

export function SecretaryModal({ isOpen, mode, secretary, onClose, onSave }: SecretaryModalProps) {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    useEffect(() => {
        if (mode === 'edit' && secretary) {
            setName(secretary.name); setSurname(secretary.surname); setEmail(secretary.email); setPassword('');
        } else {
            setName(''); setSurname(''); setEmail(''); setPassword('');
        }
        setModalError(null);
    }, [isOpen, mode, secretary]);

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        try {
            setSubmitting(true); setModalError(null);
            if (mode === 'create') await createSecretary({ name, surname, email, password });
            else if (mode === 'edit' && secretary) await updateSecretary(secretary.id, { name, surname, email, password });
            onSave(); onClose();
        } catch (err: any) {
            setModalError(err.message || 'Errore durante il salvataggio del segretario.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Aggiungi Nuovo Segretario' : 'Modifica Segretario'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4 py-2">
                        {modalError && (
                            <div className="text-destructive bg-destructive/10 text-sm font-medium p-3 rounded-lg border border-destructive/20">
                                {modalError}
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="seg-name">Nome</Label>
                            <Input id="seg-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Segreteria" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="seg-surname">Cognome</Label>
                            <Input id="seg-surname" type="text" required value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Es. Ingegneria" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="seg-email">Email</Label>
                            <Input id="seg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="segreteria.ingegneria@unibs.it" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="seg-password">
                                Password {mode === 'edit' && <span className="text-muted-foreground font-normal">(lascia vuoto per non modificare)</span>}
                            </Label>
                            <Input id="seg-password" type="password" required={mode === 'create'} minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 caratteri, 1 maiuscola, 1 simbolo (? ^ ! # @)" />
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
