import { Outlet, Navigate } from 'react-router-dom';

export function SecretaryPage() {
  return (
    <main className="flex-1 p-8">
      <Outlet />
    </main>
  );
}

export function SecretaryIndex() {
  return <Navigate to="/secretary/sessions" replace />;
}
