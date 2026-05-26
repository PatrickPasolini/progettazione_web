import { useEffect, useRef } from 'react';

interface AvatarProps {
  initials: string;
  tone?: 'dark' | 'accent';
}

export function Avatar({ initials, tone = 'dark' }: AvatarProps) {
  const bg = tone === 'accent' ? 'var(--accent)' : 'var(--ink)';
  return (
    <div
      className="avatar"
      style={{ background: bg }}
      title={initials}
    >
      {initials}
    </div>
  );
}

interface PillProps {
  children: React.ReactNode;
  tone?: 'default' | 'gold' | 'teal' | 'accent';
}

export function Pill({ children, tone = 'default' }: PillProps) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: 'var(--ink)', color: 'var(--paper)' },
    gold: { background: 'var(--gold)', color: 'var(--paper)' },
    teal: { background: 'var(--teal)', color: 'var(--paper)' },
    accent: { background: 'var(--accent)', color: 'var(--paper)' },
  };
  return (
    <span
      className="pill"
      style={{
        fontFamily: "'Geist Mono', monospace",
        fontSize: '10.5px',
        padding: '3px 8px',
        borderRadius: '999px',
        letterSpacing: '0.06em',
        ...styles[tone],
      }}
    >
      {children}
    </span>
  );
}

interface StatusPillProps {
  status: 'open' | 'draft' | 'closed';
}

const STATUS_LABEL: Record<StatusPillProps['status'], string> = {
  open: 'Aperta',
  draft: 'Bozza',
  closed: 'Chiusa',
};

const STATUS_TONE: Record<StatusPillProps['status'], PillProps['tone']> = {
  open: 'teal',
  draft: 'gold',
  closed: 'default',
};

export function StatusPill({ status }: StatusPillProps) {
  return <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  foot?: React.ReactNode;
}

export function Modal({ open, onClose, title, subtitle, children, foot }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            style={{ background: 'none', border: 'none', padding: '2px', color: 'var(--ink-3)', cursor: 'pointer', marginTop: '4px' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {foot && <div className="modal-foot">{foot}</div>}
      </div>
    </div>
  );
}
