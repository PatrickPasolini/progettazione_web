import { HOLIDAYS_2026 } from '../shared/data';
import { fmtItDate } from '../shared/date-utils';

export function FestivitaPanel() {
  const entries = Object.entries(HOLIDAYS_2026);

  return (
    <>
      <p style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 20 }}>
        Giorni festivi nazionali per l'anno 2026 — esclusi automaticamente dal calendario degli appelli.
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Festività</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([iso, name]) => (
            <tr key={iso}>
              <td style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>
                {fmtItDate(iso)}
              </td>
              <td>{name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
