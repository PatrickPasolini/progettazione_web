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

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />

      {/* Segreteria — senza autenticazione per ora */}
      <Route path="/segreteria" element={<SegreteriaPage />}>
        <Route index element={<SegreteriaIndex />} />
        <Route path="sessioni" element={<SegreteriaPlaceholder label="Sessioni" />} />
        <Route path="corsi"    element={<SegreteriaPlaceholder label="Corsi di laurea" />} />
        <Route path="materie"  element={<SegreteriaPlaceholder label="Materie" />} />
        <Route path="docenti"  element={<SegreteriaPlaceholder label="Docenti" />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<div style={{ padding: '2rem' }}>Home — aggiungi qui le tue route protette</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
