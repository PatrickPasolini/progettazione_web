import { Outlet, Navigate } from 'react-router-dom';

export function AdminPage() {
  return (
    <main className="flex-1 p-8">
      <Outlet />
    </main>
  );
}

export function AdminIndex() {
  return <Navigate to="/admin/sessions" replace />;
}
