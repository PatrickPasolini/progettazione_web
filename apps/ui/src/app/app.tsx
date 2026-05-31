import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/login.page';
import { LogoutPage } from '../features/auth/logout.page';
import { ProtectedRoute } from '../features/auth/protected-route';
import { AppLayout } from '../features/layouts/app-layout';

import {
  SegreteriaPage,
  SegreteriaIndex,
  SegreteriaPlaceholder,
} from '../features/segreteria/segreteria.page';
import { DocentiPage } from '../features/segreteria/docenti.page';
import { CorsiPage } from '../features/segreteria/corsi.page';
import { MateriePage } from '../features/segreteria/materie.page';


import {
  TeacherPage,
  TeacherIndex,
  TeacherPlaceholder,
} from '../features/teacher/teacher.page';

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
        <Route path="/segreteria" element={<SegreteriaPage />}>
          <Route index element={<SegreteriaIndex />} />
          <Route path="sessioni" element={<SegreteriaPlaceholder label="Sessioni" />} />
          <Route path="corsi"    element={<CorsiPage />} />
          <Route path="materie"  element={<MateriePage />} />
          <Route path="docenti"  element={<DocentiPage />} />
        </Route>

        <Route path="/docente" element={<TeacherPage />}>
          <Route index element={<TeacherIndex />} />
          <Route path="esami" element={<TeacherPlaceholder label="Esami" />} />
        </Route>

        <Route path="/" element={<Navigate to="/segreteria" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
