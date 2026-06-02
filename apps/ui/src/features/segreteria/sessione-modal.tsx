import { useState } from 'react';
import { MacroArea, SessionListItem } from '@server/entities/frontend';

interface SessioneModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    session: SessionListItem | null;
    onClose: () => void;
    onSave: () => void;
}

export function SessioneModal() {
  const [macroArea, setMacroArea] = useState<MacroArea | ''>('');
  
}
