import { useEffect, useState } from 'react';

interface CalendarPickerProps {
    value: string;
    onChange: (value: string) => void;
    minDate?: string;
    maxDate?: string;
    disabled?: boolean;
    highlightDate?: string;
}

function pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
}

function formatISO(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDisplay(d: Date): string {
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function parseDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function sameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function getMonthKey(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function dayAfter(d: string): string {
    const date = parseDate(d);
    date.setDate(date.getDate() + 1);
    return formatISO(date);
}

const DAYS = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];

const MONTHS = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

export function CalendarPicker({
    value,
    onChange,
    minDate,
    maxDate,
    disabled,
    highlightDate,
}: CalendarPickerProps) {
    const today = new Date();

    const pickInitialMonth = () => {
        if (value) return parseDate(value);
        if (minDate) return parseDate(minDate);
        return today;
    };

    const [viewMonth, setViewMonth] = useState(() => {
        const d = pickInitialMonth();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });

    useEffect(() => {
        const d = pickInitialMonth();
        setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, minDate]);

    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const startOffset = (firstDayOfWeek + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const selectedDate = value ? parseDate(value) : null;

    const currentMonthKey = getMonthKey(viewMonth);

    const canGoPrev = !minDate || currentMonthKey > getMonthKey(parseDate(minDate));
    const canGoNext = !maxDate || currentMonthKey < getMonthKey(parseDate(maxDate));

    const goPrev = () => setViewMonth(new Date(year, month - 1, 1));
    const goNext = () => setViewMonth(new Date(year, month + 1, 1));

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const isDateDisabled = (date: Date): boolean => {
        if (disabled) return true;
        const iso = formatISO(date);
        if (minDate && iso < minDate) return true;
        if (maxDate && iso > maxDate) return true;
        return false;
    };

    return (
        <div className={`w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between px-1 mb-0.5">
                <button
                    type="button"
                    onClick={goPrev}
                    disabled={!canGoPrev}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-bg text-sm text-ink-2 disabled:text-ink-4 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                >
                    ◀
                </button>
                <span className="text-sm font-semibold text-ink">
                    {MONTHS[month]} {year}
                </span>
                <button
                    type="button"
                    onClick={goNext}
                    disabled={!canGoNext}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-bg text-sm text-ink-2 disabled:text-ink-4 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                >
                    ▶
                </button>
            </div>

            <div className="grid grid-cols-7 mb-px">
                {DAYS.map((d) => (
                    <div
                        key={d}
                        className="h-7 flex items-center justify-center text-[11px] font-mono text-ink-3 uppercase"
                    >
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {cells.map((date, i) => {
                    if (!date) return <div key={`e-${i}`} className="h-9" />;

                    const disabled = isDateDisabled(date);
                    const selected = selectedDate && sameDay(date, selectedDate);
                    const isToday = sameDay(date, today);
                    const isMin = minDate && formatISO(date) === minDate;
                    const isHighlight = highlightDate && formatISO(date) === highlightDate;

                    return (
                        <button
                            key={formatISO(date)}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange(formatISO(date))}
                            className={`
                                h-9 flex items-center justify-center text-sm rounded-full transition-colors
                                ${selected
                                    ? 'bg-accent text-white font-semibold'
                                    : isHighlight
                                        ? 'bg-accent/10 text-ink font-semibold'
                                        : disabled
                                            ? 'text-ink-4 cursor-not-allowed'
                                            : isToday
                                                ? 'text-accent hover:bg-bg cursor-pointer font-semibold'
                                                : 'text-ink hover:bg-bg cursor-pointer'
                                }
                            `}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>

            {value && (
                <div className="text-center mt-1.5 text-sm text-ink-3 font-mono tracking-wide">
                    {formatDisplay(parseDate(value))}
                </div>
            )}
        </div>
    );
}
