import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/login.page';
import { LogoutPage } from '../features/auth/logout.page';
import { ChangePasswordPage } from '../features/auth/change-password.page';
import { ProtectedRoute } from '../features/auth/protected-route';
import { getRoleFromToken } from '../features/auth/role.utils';
import { AppLayout } from '../features/layouts/app-layout';

import {
  SecretaryPage,
  SecretaryIndex,
} from '../features/secretary/pages/secretary.page';
import { TeachersPage } from '../features/secretary/pages/teachers.page';
import { DegreesPage } from '../features/secretary/pages/degrees.page';
import { CoursesPage } from '../features/secretary/pages/courses.page';
import { SessionsPage } from '../features/secretary/pages/sessions.page';

import {
  TeacherPage,
  TeacherIndex,
} from '../features/teacher/pages/teacher.page';
import { ExamsPage } from '../features/teacher/pages/exams.page';

import { AdminPage, AdminIndex } from '../features/admin/pages/admin.page';
import { SecretariesPage } from '../features/admin/pages/secretaries.page';
import { AdminExamsPage } from '../features/admin/pages/admin-exams.page';

// Reindirizza l'utente alla dashboard corretta in base al ruolo nel JWT.
// Senza token (es. primo avvio) si va direttamente al login.
function RootRedirect() {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;

  const role = getRoleFromToken();
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'TEACHER') return <Navigate to="/teacher" replace />;
  return <Navigate to="/secretary" replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route
        path="/cambia-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/secretary" element={<SecretaryPage />}>
          <Route index element={<SecretaryIndex />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="degrees"  element={<DegreesPage />} />
          <Route path="courses"  element={<CoursesPage />} />
          <Route path="teachers" element={<TeachersPage />} />
        </Route>

        <Route path="/teacher" element={<TeacherPage />}>
          <Route index element={<TeacherIndex />} />
          <Route path="exams" element={<ExamsPage />} />
        </Route>

        {/* Dashboard admin: schermate segreteria + lista segretari (CRUD pieno consentito lato API) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminIndex />} />
          <Route path="sessions"    element={<SessionsPage />} />
          <Route path="degrees"     element={<DegreesPage />} />
          <Route path="courses"     element={<CoursesPage />} />
          <Route path="teachers"    element={<TeachersPage />} />
          <Route path="secretaries" element={<SecretariesPage />} />
        </Route>

        {/* Calendario appelli in sola lettura, filtrato per dipartimento e corso di laurea */}
        <Route
          path="/admin/exams"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <div className="flex flex-1 min-h-0">
                <AdminExamsPage />
              </div>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<RootRedirect />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
