import { TriangleAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';

interface ErrorDialogProps {
  open: boolean;
  title?: string;
  message: string | null;
  onClose: () => void;
}

export function ErrorDialog({
  open,
  title = 'Eliminazione non consentita',
  message,
  onClose,
}: ErrorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 shrink-0">
              <TriangleAlert className="w-4 h-4 text-amber-500" />
            </span>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
