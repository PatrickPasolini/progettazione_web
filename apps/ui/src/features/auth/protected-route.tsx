import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getRoleFromToken } from './role.utils';

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: string[];
}) {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se la rotta è ristretta a certi ruoli, verifica il ruolo dal JWT.
  if (roles && !roles.includes(getRoleFromToken() ?? '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
