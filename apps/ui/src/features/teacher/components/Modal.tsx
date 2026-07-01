import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="w-[480px] max-w-[92vw]">
                <DialogHeader>
                    <DialogTitle className="text-[26px] leading-[1.1]">{title}</DialogTitle>
                    {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}
