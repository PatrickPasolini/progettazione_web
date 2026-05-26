import { useState } from 'react';
import {
  parseISO, toISO, addMonths, startOfMonth, endOfMonth, isWeekend,
} from '../shared/date-utils';
import { HOLIDAYS_2026, fmtMonth, fmtDow, getTodayISO } from '../shared/data';
import { Chevron } from '../shared/ui/icons';
import type { Exam, Session } from '../shared/types';

interface CalendarGridProps {
  session: Session | null;
  exams: Exam[];
  currentUserId: number;
  onCellClick: (date: string, exam?: Exam) => void;
}

export function CalendarGrid({ session, exams, currentUserId, onCellClick }: CalendarGridProps) {
  const today = getTodayISO();
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (session) return parseISO(session.startDate);
    return new Date();
  });

  const byDate = new Map<string, Exam>();
  for (const e of exams) byDate.set(e.examDate, e);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);

  const sessionStart = session ? parseISO(session.startDate) : null;
  const sessionEnd = session ? parseISO(session.endDate) : null;

  // pad cells before first day (Mon=0...Sun=6)
  const firstDow = (monthStart.getDay() + 6) % 7;
  const cells: (Date | null)[] = [
    ...Array(firstDow).fill(null),
  ];
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    cells.push(new Date(d));
  }
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function cellClass(d: Date | null): string {
    if (!d) return 'cal-cell out';
    const iso = toISO(d);
    if (isWeekend(d)) return 'cal-cell weekend';
    if (HOLIDAYS_2026[iso]) return 'cal-cell holiday';
    if (sessionStart && sessionEnd && (d < sessionStart || d > sessionEnd)) {
      return 'cal-cell outofsession';
    }
    if (byDate.has(iso)) return 'cal-cell has-appello';
    return 'cal-cell';
  }

  function handleClick(d: Date | null) {
    if (!d) return;
    const iso = toISO(d);
    if (isWeekend(d) || HOLIDAYS_2026[iso]) return;
    if (sessionStart && sessionEnd && (d < sessionStart || d > sessionEnd)) return;
    const exam = byDate.get(iso);
    onCellClick(iso, exam);
  }

  const monthLabel = `${fmtMonth[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  const totalDays = exams.length;
  const myDays = exams.filter(e => e.teacher.id === currentUserId).length;

  return (
    <>
      <div className="cal-header">
        <div className="cal-nav">
          <button onClick={() => setViewDate(d => addMonths(d, -1))} aria-label="Mese precedente">
            <Chevron dir="left" size={14} />
          </button>
          <button onClick={() => setViewDate(d => addMonths(d, 1))} aria-label="Mese successivo">
            <Chevron dir="right" size={14} />
          </button>
        </div>
        <span className="cal-month serif">{monthLabel}</span>
        <div className="cal-stats">
          <span><b>{myDays}</b> miei appelli</span>
          <span><b>{totalDays}</b> totali</span>
        </div>
      </div>

      <div className="cal-grid">
        {fmtDow.map(d => (
          <div key={d} className="cal-dow">{d}</div>
        ))}

        {cells.map((d, i) => {
          const iso = d ? toISO(d) : null;
          const exam = iso ? byDate.get(iso) : undefined;
          const isHoliday = iso ? !!HOLIDAYS_2026[iso] : false;
          const isToday = iso === today;
          const isMine = exam ? exam.teacher.id === currentUserId : false;

          return (
            <div
              key={i}
              className={cellClass(d)}
              onClick={() => handleClick(d)}
            >
              {d && (
                <>
                  <div className="cell-head">
                    <span className={`cell-day${isToday ? ' today' : ''}`}>
                      {d.getDate()}
                    </span>
                    {isHoliday && (
                      <span className="cell-label holiday">{HOLIDAYS_2026[iso!].split(' ').slice(0, 1).join(' ')}</span>
                    )}
                  </div>

                  {exam && (
                    <div className={`appello-chip${isMine ? ' mine' : ''}`}>
                      <span className="chip-course">{exam.course.courseName}</span>
                      <span className="chip-prof">{exam.teacher.name} {exam.teacher.surname}</span>
                      <span className="chip-meta">{exam.startTime}–{exam.endTime}</span>
                    </div>
                  )}

                  {!exam && !isWeekend(d) && !isHoliday && (
                    <div className="cell-add">+ Aggiungi</div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
