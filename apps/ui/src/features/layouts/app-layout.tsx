import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { fetchApi } from '../shared/api';
import { Avatar } from '../shared/ui/components';
import { CalIcon, PersonIcon, CogIcon } from '../shared/ui/icons';
import type { CurrentUser } from '../shared/types';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetchApi<CurrentUser>('/users/me')
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const canSwitch = user?.role === 'ADMIN' || user?.role === 'SECRETARY';
  const isDocente = location.pathname.startsWith('/docente');
  const isSegreteria = location.pathname.startsWith('/segreteria');

  const initials = user
    ? `${user.name?.charAt(0) ?? ''}${user.surname?.charAt(0) ?? ''}`.toUpperCase()
    : '?';

  const fullName = user ? `${user.name} ${user.surname}` : '';

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <span className="brand-name">Appelli<span className="dot">.</span></span>
          <span className="brand-sub">Gestione esami</span>
        </div>

        <div className="topbar-divider" />

        <div className="role-switch">
          {(canSwitch || user?.role === 'TEACHER') && (
            <button
              className={isDocente ? 'active' : ''}
              onClick={() => navigate('/docente')}
            >
              <span className="dotpoint" />
              <CalIcon size={14} />
              Docente
            </button>
          )}
          {(canSwitch) && (
            <button
              className={isSegreteria ? 'active' : ''}
              onClick={() => navigate('/segreteria')}
            >
              <span className="dotpoint" />
              <CogIcon size={14} />
              Segreteria
            </button>
          )}
        </div>

        <div className="top-meta">
          <span>A.A. 2025–2026</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PersonIcon size={14} />
            <span>{fullName}</span>
          </div>
          <Avatar initials={initials} />
          <button
            className="btn-ghost"
            style={{ fontSize: 12, padding: '4px 10px' }}
            onClick={() => navigate('/logout')}
          >
            Esci
          </button>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
