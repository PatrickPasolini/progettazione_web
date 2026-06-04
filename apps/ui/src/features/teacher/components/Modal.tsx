import { useRef, useEffect } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 grid place-items-center"
            onClick={onClose}
        >
            <div
                ref={ref}
                className="bg-paper rounded-2xl shadow-2xl w-[480px] max-w-[92vw] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 pt-[22px] pb-3.5 border-b border-line">
                    <h3 className="font-serif text-[26px] leading-[1.1] m-0">{title}</h3>
                    {subtitle && <p className="mt-1 text-[13px] text-ink-3 m-0">{subtitle}</p>}
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}
