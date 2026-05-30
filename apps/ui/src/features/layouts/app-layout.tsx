import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../auth/auth.api';

interface NavTab { label: string; path: string; }

const SEGRETERIA_TABS: NavTab[] = [
  { label: 'Sessioni', path: '/segreteria/sessioni' },
  { label: 'Corsi',    path: '/segreteria/corsi' },
  { label: 'Materie',  path: '/segreteria/materie' },
  { label: 'Docenti',  path: '/segreteria/docenti' },
];

const TEACHER_TABS: NavTab[] = [
  { label: 'Esami', path: '/docente/esami' },
];

export function AppLayout() {
  const [email, setEmail] = useState<string | null>(null);
  const [tabs, setTabs] = useState<NavTab[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUser()
      .then((u) => {
        setEmail(u.email);
        setTabs(u.role === 'SECRETARY' ? SEGRETERIA_TABS : TEACHER_TABS);
      })
      .catch(() => setEmail(null));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="bg-paper border-b border-line sticky top-0 z-10">
        <div className="flex items-center h-20 px-8 gap-8">

          <div className="shrink-0">
            <img src="/examflow-logo.png" alt="ExamFlow" className="h-16 w-auto" />
          </div>

          <div className="w-px h-7 bg-line shrink-0" />

          <nav className="flex items-center gap-1 h-full">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  [
                    'h-20 flex items-center px-5 text-base font-medium border-b-2 transition-colors',
                    isActive
                      ? 'border-accent text-ink'
                      : 'border-transparent text-ink-3 hover:text-ink hover:bg-gray-100 rounded-md',
                  ].join(' ')
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-ink-4">A.A. 2025/2026</span>
            <div className="w-px h-5 bg-line" />

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                  <span className="text-accent text-sm font-semibold">
                    {email ? email[0].toUpperCase() : '?'}
                  </span>
                </div>
                {email && (
                  <span className="text-sm text-ink-2 max-w-[180px] truncate">{email}</span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-1 w-40 bg-paper border border-line rounded-lg shadow-md py-1 z-50">
                  <button
                    onClick={() => navigate('/logout')}
                    className="w-full text-left px-4 py-2 text-sm text-ink-2 hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      <Outlet />
    </div>
  );
}
