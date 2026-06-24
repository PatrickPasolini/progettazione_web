import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/login.page';
import { LogoutPage } from '../features/auth/logout.page';
import { ChangePasswordPage } from '../features/auth/change-password.page';
import { ProtectedRoute } from '../features/auth/protected-route';
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

        <Route path="/" element={<Navigate to="/secretary" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
