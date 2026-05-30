import { Outlet, Navigate } from 'react-router-dom';
import { SegreteriaNavbar } from './segreteria-navbar';

export function SegreteriaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <SegreteriaNavbar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
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
