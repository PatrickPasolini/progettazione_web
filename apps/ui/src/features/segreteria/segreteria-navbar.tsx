import { NavLink } from 'react-router-dom';

const TABS = [
  { label: 'Sessioni',   path: '/segreteria/sessioni' },
  { label: 'Corsi',      path: '/segreteria/corsi' },
  { label: 'Materie',    path: '/segreteria/materie' },
  { label: 'Docenti',    path: '/segreteria/docenti' },
];

export function SegreteriaNavbar() {
  return (
    <header className="bg-paper border-b border-line sticky top-0 z-10">
      <div className="flex items-center h-14 px-6 gap-6">

        {/*Logo navbar*/}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 rounded-sm bg-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-wide">A</span>
          </div>
          <span className="font-serif text-xl text-ink leading-none">Appelli.</span>
        </div>

        <div className="w-px h-5 bg-line shrink-0" />

        {/* Tabs */}
        <nav className="flex items-center gap-1 h-full">
          {TABS.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                [
                  'h-14 flex items-center px-4 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-accent text-ink'
                    : 'border-transparent text-ink-3 hover:text-ink',
                ].join(' ')
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        {/* Right slot — placeholder utente */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-ink-4">A.A. 2025/2026</span>
          <div className="w-px h-4 bg-line" />
          <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center">
            <span className="text-accent text-xs font-semibold">S</span>
          </div>
        </div>
      </div>
    </header>
  );
}
