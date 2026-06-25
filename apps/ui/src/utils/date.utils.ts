export function toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function isWeekend(d: Date): boolean {
    return d.getDay() === 0 || d.getDay() === 6;
}

export function startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, n: number): Date {
    return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function dateKey(v: unknown): string {
    return String(v).substring(0, 10);
}

export function fmtTime(v: unknown): string {
    const d = new Date(v as string);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateRange(start: Date, end: Date): string {
    const s = new Date(start);
    const e = new Date(end);
    const month = (d: Date) => d.toLocaleDateString('it-IT', { month: 'short' });
    const year = e.getFullYear();
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
        return `${month(e)} ${year}`;
    }
    return `${month(s)}-${month(e)} ${year}`;
}

export function daysRemaining(isoEnd: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(isoEnd);
    end.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((end.getTime() - today.getTime()) / 86400000));
}
