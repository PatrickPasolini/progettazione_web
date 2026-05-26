import { toISO } from './date-utils';

export const HOLIDAYS_2026: Record<string, string> = {
  '2026-01-01': 'Capodanno',
  '2026-01-06': 'Epifania',
  '2026-04-05': 'Pasqua',
  '2026-04-06': 'Lunedì dell\'Angelo',
  '2026-04-25': 'Festa della Liberazione',
  '2026-05-01': 'Festa del Lavoro',
  '2026-06-02': 'Festa della Repubblica',
  '2026-08-15': 'Ferragosto',
  '2026-11-01': 'Ognissanti',
  '2026-12-08': 'Immacolata Concezione',
  '2026-12-25': 'Natale',
  '2026-12-26': 'Santo Stefano',
};

export const fmtMonth = [
  'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre',
];

export const fmtDow = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];

export const fmtDowFull = [
  'Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica',
];

export function getTodayISO(): string {
  return toISO(new Date());
}

export function degreeLabel(degreeName: string, degreeType: string, degreeYear: string): string {
  const typeMap: Record<string, string> = { LT: 'Triennale', LM: 'Magistrale', LMCU: 'Ciclo Unico' };
  return `${degreeName} · ${typeMap[degreeType] ?? degreeType} · Anno ${degreeYear}`;
}

export function degreeCode(degreeName: string, degreeType: string, degreeYear: string): string {
  const abbr = degreeName.substring(0, 3).toUpperCase();
  const typeMap: Record<string, string> = { LT: 'LT', LM: 'LM', LMCU: 'LMCU' };
  return `${abbr}${typeMap[degreeType] ?? degreeType}-${degreeYear}`;
}
