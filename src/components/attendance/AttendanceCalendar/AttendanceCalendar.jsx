/**
 * AttendanceCalendar.jsx
 * Visual attendance calendar foundation (Module 3.5, Task 5).
 *
 * Renders a single month grid with colour-coded day cells.
 * Architecture: receive `attendanceMap` as a plain { 'YYYY-MM-DD': status } object.
 * No heavy calendar library — pure CSS grid + Date math.
 *
 * Future integration: plug into MarkAttendancePage, student history, reports.
 *
 * @param {object}  props.attendanceMap  — { 'YYYY-MM-DD': status_string }
 * @param {number}  [props.year]         — defaults to current year
 * @param {number}  [props.month]        — 0-indexed; defaults to current month
 * @param {function} [props.onDayClick]  — (dateString) => void
 * @param {function} [props.onMonthChange] — (year, month) => void — navigation
 * @param {boolean} [props.showNav=true]
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.className]
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fadeIn, TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { AttendanceStatusChip } from '../AttendanceStatusChip';
import { AttendanceLegend } from '../AttendanceLegend';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_CHIP_CLASSES,
  ATTENDANCE_SHORT_LABEL,
} from '@constants/attendanceStatus';
import { TableSkeleton } from '@components/feedback/Skeleton';

// ── Constants ─────────────────────────────────────────────────────────────────
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES  = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ── Day cell ──────────────────────────────────────────────────────────────────
const DayCell = ({ day, dateStr, status, isToday, isFuture, isOtherMonth, onClick, reduced }) => {
  if (!day) {
    return <div className="h-9 rounded-md" aria-hidden="true" />;
  }

  const classes = status ? ATTENDANCE_CHIP_CLASSES[status] ?? {} : {};
  const isClickable = !isFuture && !isOtherMonth && onClick;
  const shortLabel  = status ? ATTENDANCE_SHORT_LABEL[status] : null;

  const Wrapper = !reduced && status ? motion.button : 'button';
  const motionProps = !reduced && status ? {
    whileHover: { scale: 1.08 },
    whileTap:   { scale: 0.95 },
    transition: TRANSITIONS.fast,
  } : {};

  return (
    <Wrapper
      type="button"
      onClick={() => isClickable && onClick(dateStr)}
      disabled={isFuture || isOtherMonth}
      aria-label={`${dateStr}${status ? `: ${ATTENDANCE_STATUS[status] ?? status}` : ''}${isToday ? ' (today)' : ''}`}
      aria-current={isToday ? 'date' : undefined}
      className={cn(
        'relative flex flex-col items-center justify-center gap-0.5',
        'h-9 w-full rounded-md border text-xs font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-1',
        status
          ? cn(classes.bg, classes.text, classes.border)
          : isToday
            ? 'border-accent-400 bg-accent-50 text-accent-700'
            : isOtherMonth
              ? 'border-transparent text-neutral-300 cursor-default'
              : isFuture
                ? 'border-dashed border-border text-neutral-300 cursor-default'
                : 'border-border bg-white text-textMuted hover:border-accent-200 hover:bg-neutral-50',
        isClickable && 'cursor-pointer',
      )}
      {...motionProps}
    >
      <span className={cn('leading-none', isToday && !status && 'font-bold')}>{day}</span>
      {shortLabel && (
        <span className="text-[9px] font-bold leading-none opacity-70">{shortLabel}</span>
      )}
    </Wrapper>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AttendanceCalendar = ({
  attendanceMap = {},
  year: initYear,
  month: initMonth,
  onDayClick,
  onMonthChange,
  showNav = true,
  loading = false,
  className,
}) => {
  const reduced = usePrefersReducedMotion();

  // Local month navigation state
  const now = new Date();
  const [viewYear,  setViewYear]  = useState(initYear  ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(initMonth ?? now.getMonth());

  const todayStr = useMemo(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Navigate months
  const goMonth = useCallback((dir) => {
    setViewYear((y) => {
      const newMonth = viewMonth + dir;
      if (newMonth < 0)  { onMonthChange?.(y - 1, 11); setViewMonth(11);  return y - 1; }
      if (newMonth > 11) { onMonthChange?.(y + 1, 0);  setViewMonth(0);   return y + 1; }
      onMonthChange?.(y, newMonth);
      setViewMonth(newMonth);
      return y;
    });
  }, [viewMonth, onMonthChange]);

  // Build calendar grid
  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const grid = [];

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) grid.push(null);

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(viewMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${viewYear}-${mm}-${dd}`;
      const status  = attendanceMap[dateStr] ?? null;
      const dayDate = new Date(viewYear, viewMonth, d);
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      grid.push({
        day: d,
        dateStr,
        status,
        isToday:  dateStr === todayStr,
        isFuture: dayDate > todayDate,
        isOtherMonth: false,
      });
    }

    // Trailing cells to complete 6×7 grid (optional — only if last row is partial)
    while (grid.length % 7 !== 0) grid.push(null);

    return grid;
  }, [viewYear, viewMonth, attendanceMap, todayStr]);

  if (loading) {
    return (
      <div className={cn('flex flex-col gap-3 rounded-md border border-border bg-white p-4', className)}>
        <TableSkeleton rows={7} cols={7} />
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={cn('flex flex-col gap-3 rounded-md border border-border bg-white p-4 shadow-card', className)}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-textPrimary">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        {showNav && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              aria-label="Previous month"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border
                text-textMuted hover:border-accent-300 hover:text-accent-600
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600
                transition-colors duration-150"
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goMonth(1)}
              aria-label="Next month"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border
                text-textMuted hover:border-accent-300 hover:text-accent-600
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600
                transition-colors duration-150"
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* ── Days-of-week header ── */}
      <div className="grid grid-cols-7 gap-1" role="row">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            role="columnheader"
            aria-label={d}
            className="h-7 flex items-center justify-center text-[10px] font-semibold text-textMuted uppercase tracking-wide"
          >
            {d.slice(0, 2)}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear} attendance`}>
        {cells.map((cell, idx) => (
          <div key={idx} role="gridcell">
            {cell ? (
              <DayCell
                day={cell.day}
                dateStr={cell.dateStr}
                status={cell.status}
                isToday={cell.isToday}
                isFuture={cell.isFuture}
                isOtherMonth={cell.isOtherMonth}
                onClick={onDayClick}
                reduced={reduced}
              />
            ) : (
              <div className="h-9" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      {/* ── Legend ── */}
      <AttendanceLegend compact className="pt-1 border-t border-border mt-1" />
    </motion.div>
  );
};

AttendanceCalendar.displayName = 'AttendanceCalendar';

export { AttendanceCalendar };
export default AttendanceCalendar;
