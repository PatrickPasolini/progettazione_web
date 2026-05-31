import { Outlet, Navigate } from 'react-router-dom';

export function SegreteriaPage() {
  return (
    <main className="flex-1 p-8">
      <Outlet />
    </main>
  );
}

export function SegreteriaIndex() {
  return <Navigate to="/segreteria/sessioni" replace />;
}

export function SegreteriaPlaceholder({ label }: { label: string }) {
  return (
    <p className="font-mono text-sm text-ink-4">
      {label} — in costruzione
    </p>
  );
} 
