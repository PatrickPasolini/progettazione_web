# Frontend — Utilities

**Percorso**: `apps/ui/src/utils/`

## calendar.utils.ts

Funzioni per la costruzione del calendario e gestione festività.

### Funzioni principali

| Funzione | Descrizione |
|----------|-------------|
| `buildHolidaysMap(year)` | Ritorna `{ [dateISO]: true }` per le festività italiane dell'anno |
| `getCalendarDays(month, year)` | Array di date per il mese, incluse celle vuote per allineamento settimana |
| `isWeekend(date)` | `true` se sabato o domenica |
| `isHoliday(date, holidays)` | `true` se la data è nella mappa festività |
| `isDateInRange(date, start, end)` | `true` se `start <= date <= end` |

### Festività gestite

Festività fisse italiane (es. 1 gennaio, 25 aprile, 1 maggio, 15 agosto, 25-26 dicembre) più Pasqua e Pasquetta calcolate algoritmicamente per l'anno corrente.

### Uso in EsamiPage

```typescript
const holidays = buildHolidaysMap(viewMonth.getFullYear());

// Nel render del CalendarGrid:
const isBlocked = isWeekend(day) || isHoliday(day, holidays);
const isInSession = isDateInRange(day, session.startDate, session.endDate);
```

---

## date.utils.ts

Funzioni di formattazione e conversione date.

| Funzione | Descrizione |
|----------|-------------|
| `toISODate(date)` | Converte `Date` in stringa `YYYY-MM-DD` |
| `formatDisplayDate(isoDate)` | Formatta ISO string in formato leggibile (es. `"22 giu 2026"`) |
| `formatTime(isoTimestamp)` | Estrae orario da timestamp ISO (es. `"14:30"`) |
| `parseISODate(isoDate)` | Converte stringa `YYYY-MM-DD` in `Date` locale (evita shift UTC) |

### Problema UTC shift

Le date PostgreSQL arrivano come stringhe ISO `"2026-06-22"`. Se si usa `new Date("2026-06-22")` in JS, il risultato è interpretato come UTC mezzanotte e visualizzato come giorno precedente nei fusi orari negativi. `parseISODate` aggiunge il fuso locale per evitare questo:

```typescript
function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day); // costruttore locale, non UTC
}
```
