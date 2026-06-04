import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { it } from 'date-fns/locale/it';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '../../lib/utils';

registerLocale('it', it);

interface DatePickerProps {
    value: string;
    onChange: (v: string) => void;
    min?: string;
    max?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    filterDate?: (d: Date) => boolean;
}

function toDate(s: string): Date | null {
    if (!s) return null;
    const d = new Date(s + 'T12:00:00');
    return isNaN(d.getTime()) ? null : d;
}

function toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function DatePicker({ value, onChange, min, max, placeholder = 'Seleziona data…', className, disabled, filterDate }: DatePickerProps) {
    return (
        <ReactDatePicker
            selected={toDate(value)}
            onChange={(d: Date | null) => d && onChange(toISO(d))}
            minDate={min ? toDate(min) ?? undefined : undefined}
            maxDate={max ? toDate(max) ?? undefined : undefined}
            filterDate={filterDate}
            dateFormat="dd/MM/yyyy"
            locale="it"
            placeholderText={placeholder}
            disabled={disabled}
            autoComplete="off"
            calendarClassName="dp-calendar"
            wrapperClassName="w-full"
            className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'ring-offset-background placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
        />
    );
}
