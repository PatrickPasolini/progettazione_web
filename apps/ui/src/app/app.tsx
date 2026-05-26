import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/login.page';
import { LogoutPage } from '../features/auth/logout.page';
import { ProtectedRoute } from '../features/auth/protected-route';
import { AppLayout } from '../features/layouts/app-layout';
import { DocentePage } from '../features/docente/docente.page';
import { SegreteriaPage } from '../features/segreteria/segreteria.page';
import { fetchApi } from '../features/shared/api';
import type { CurrentUser } from '../features/shared/types';

function RoleRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    fetchApi<CurrentUser>('/users/me')
      .then(user => {
        if (user.role === 'TEACHER') {
          navigate('/docente', { replace: true });
        } else if (user.role === 'SECRETARY' || user.role === 'ADMIN') {
          navigate('/segreteria', { replace: true });
        } else {
          navigate('/docente', { replace: true });
        }
      })
      .catch(() => navigate('/login', { replace: true }));
  }, [navigate]);

  return null;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleRedirect />} />
        <Route path="/docente" element={<DocentePage />} />
        <Route path="/segreteria" element={<SegreteriaPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
