import { Outlet, Navigate } from 'react-router-dom';

export function TeacherPage() {
  return (
    <main className="flex-1 p-8">
      <Outlet />
    </main>
  );
}

export function TeacherIndex() {
  return <Navigate to="/docente/esami" replace />;
}

export function TeacherPlaceholder({ label }: { label: string }) {
  return (
    <p className="font-mono text-sm text-ink-4">
      {label} — in costruzione
    </p>
  );
}
