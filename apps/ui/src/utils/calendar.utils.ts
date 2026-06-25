import Holidays from 'date-holidays';
import { SessionListItem, DegreeType } from '@server/entities/frontend';
import { toISO, isWeekend } from './date.utils';

export const DOW_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const MONTH_LABELS_IT = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

export const DOW_FULL = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export const DEGREE_TYPE_LABEL: Record<DegreeType, string> = {
    [DegreeType.BACHELOR]: 'Triennale',
    [DegreeType.MASTER]: 'Magistrale',
    [DegreeType.SINGLE_CYCLE]: 'Magistrale a ciclo unico',
};

export function buildHolidayMap(startDate: Date, endDate: Date): Record<string, string> {
    const hd = new Holidays('IT');
    const map: Record<string, string> = {};
    for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
        for (const h of hd.getHolidays(y)) {
            if (h.type === 'public') {
                map[h.date.substring(0, 10)] = h.name;
            }
        }
    }
    return map;
}

export function countSessionDays(session: SessionListItem, holidays: Record<string, string>): number {
    const s = new Date(session.startDate);
    const e = new Date(session.endDate);
    let n = 0;
    const d = new Date(s);
    while (d <= e) {
        if (!isWeekend(d) && !holidays[toISO(d)]) n++;
        d.setDate(d.getDate() + 1);
    }
    return n;
}
