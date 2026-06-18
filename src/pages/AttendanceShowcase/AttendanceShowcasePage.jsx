/**
 * AttendanceShowcasePage.jsx
 * Module 3.5 — Development-only showcase (Task 10).
 *
 * Displays every attendance component in all states and variants.
 * Route: /dev/attendance-showcase (NOT in production sidebar navigation).
 * Add to AppRouter only in development: import.meta.env.DEV
 *
 * Sections:
 *   1. Status Chips (all statuses, all modes, all sizes)
 *   2. AttendanceLegend
 *   3. AttendanceToggle (all sizes, disabled)
 *   4. AttendanceStatusSelector (pill + card, V1 + all statuses)
 *   5. AttendancePercentageIndicator (bar / circular / inline)
 *   6. AttendanceSummaryCard (normal + compact + loading)
 *   7. AttendanceKPIWidget (all periods)
 *   8. AttendanceTrendCard (growth + decline)
 *   9. AttendanceRow (default + selected + disabled + remarks)
 *   10. AttendanceSheet (live mini-demo)
 *   11. AttendanceTimeline + items
 *   12. AttendanceCalendar (seeded map)
 *   13. AttendanceFilterBar (default + compact)
 *   14. BulkAttendanceToolbar (compact + full)
 *   15. Empty states (all four)
 */

import { useState } from 'react';
import { Users, BarChart2, TrendingUp, CalendarDays, UserCheck } from 'lucide-react';

import {
  AttendanceStatusChip,
  AttendanceLegend,
  AttendanceToggle,
  AttendanceStatusSelector,
  AttendancePercentageIndicator,
  AttendanceSummaryCard,
  AttendanceKPIWidget,
  AttendanceTrendCard,
  AttendanceRow,
  AttendanceSheet,
  AttendanceTimeline,
  AttendanceTimelineItem,
  AttendanceActivityItem,
  AttendanceCalendar,
  AttendanceFilterBar,
  BulkAttendanceToolbar,
  NoAttendanceData,
  NoStudentsForBatch,
  AttendanceNotMarked,
  AttendanceSearchEmpty,
} from '@components/attendance';

import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LIST, V1_ATTENDANCE_STATUSES } from '@constants/attendanceStatus';

// ── Showcase section wrapper ──────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <section className="flex flex-col gap-4">
    <h2 className="text-base font-semibold text-textPrimary border-b border-border pb-2">
      {title}
    </h2>
    {children}
  </section>
);

const Row = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    {label && <p className="text-xs font-medium text-textMuted">{label}</p>}
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </div>
);

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
  { id: 's1', name: 'Arun Kumar',  studentCode: 'NM2026001' },
  { id: 's2', name: 'Divya Priya', studentCode: 'NM2026002' },
  { id: 's3', name: 'Manoj Raj',   studentCode: 'NM2026003' },
  { id: 's4', name: 'Preethi S',   studentCode: 'NM2026004' },
  { id: 's5', name: 'Karthik V',   studentCode: 'NM2026005' },
];

const INITIAL_STATUSES = {
  s1: ATTENDANCE_STATUS.PRESENT,
  s2: ATTENDANCE_STATUS.ABSENT,
  s3: ATTENDANCE_STATUS.PRESENT,
  s4: ATTENDANCE_STATUS.PRESENT,
  s5: ATTENDANCE_STATUS.ABSENT,
};

const MOCK_CALENDAR = {
  '2026-04-07': ATTENDANCE_STATUS.PRESENT,
  '2026-04-08': ATTENDANCE_STATUS.PRESENT,
  '2026-04-09': ATTENDANCE_STATUS.ABSENT,
  '2026-04-10': ATTENDANCE_STATUS.PRESENT,
  '2026-04-11': ATTENDANCE_STATUS.ABSENT,
  '2026-04-14': ATTENDANCE_STATUS.PRESENT,
  '2026-04-15': ATTENDANCE_STATUS.PRESENT,
};

const MOCK_TIMELINE_RECORDS = [
  { id: 'r1', date: '2026-04-15', status: ATTENDANCE_STATUS.PRESENT, batchName: 'Batch B', markedBy: 'Manager' },
  { id: 'r2', date: '2026-04-14', status: ATTENDANCE_STATUS.PRESENT, batchName: 'Batch B', markedBy: 'Manager' },
  { id: 'r3', date: '2026-04-11', status: ATTENDANCE_STATUS.ABSENT,  batchName: 'Batch B', markedBy: 'Manager' },
  { id: 'r4', date: '2026-04-10', status: ATTENDANCE_STATUS.PRESENT, batchName: 'Batch B', markedBy: 'Manager' },
];

const MOCK_ACTIVITY = [
  { id: 'a1', title: 'Attendance marked — Batch B',  description: 'Apr 15, 2026', timestamp: '09:30', status: ATTENDANCE_STATUS.PRESENT },
  { id: 'a2', title: 'Attendance edited — Batch A',  description: 'Apr 11, 2026', timestamp: 'Yesterday', status: ATTENDANCE_STATUS.ABSENT },
  { id: 'a3', title: 'Attendance marked — Batch A',  description: 'Apr 10, 2026', timestamp: '2 days ago',  status: ATTENDANCE_STATUS.PRESENT },
];

const MOCK_BATCHES = [
  { id: 'b1', name: 'Batch A – Jan 2026' },
  { id: 'b2', name: 'Batch B – Apr 2026' },
];

// ── Page ──────────────────────────────────────────────────────────────────────
const AttendanceShowcasePage = () => {
  const [toggleStatus, setToggleStatus]   = useState(ATTENDANCE_STATUS.PRESENT);
  const [selectorVal,  setSelectorVal]    = useState(ATTENDANCE_STATUS.PRESENT);
  const [sheetStatuses, setSheetStatuses] = useState(INITIAL_STATUSES);
  const [filters, setFilters]             = useState({});
  const [bulkCount, setBulkCount]         = useState(3);

  const handleSheetStatus = (id, status) =>
    setSheetStatuses((p) => ({ ...p, [id]: status }));

  const handleFilter = (key, val) => setFilters((p) => ({ ...p, [key]: val }));
  const resetFilters = () => setFilters({});

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <span className="inline-block mb-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-600 uppercase tracking-wide border border-accent-200">
          Development Only
        </span>
        <h1 className="text-2xl font-bold text-textPrimary">
          Module 3.5 — Attendance Component Library
        </h1>
        <p className="mt-1 text-sm text-textMuted">
          All attendance components, all states, all variants. Not exposed in production.
        </p>
      </div>

      <div className="flex flex-col gap-10 max-w-5xl">

        {/* ── 1. Status Chips ── */}
        <Section title="1. AttendanceStatusChip">
          <Row label="All statuses — full mode">
            {ATTENDANCE_STATUS_LIST.map((s) => (
              <AttendanceStatusChip key={s} status={s} mode="full" />
            ))}
          </Row>
          <Row label="Compact mode">
            {ATTENDANCE_STATUS_LIST.map((s) => (
              <AttendanceStatusChip key={s} status={s} mode="compact" />
            ))}
          </Row>
          <Row label="Dot mode">
            {ATTENDANCE_STATUS_LIST.map((s) => (
              <AttendanceStatusChip key={s} status={s} mode="dot" size="lg" />
            ))}
          </Row>
          <Row label="Sizes (full)">
            {(['sm','md','lg']).map((sz) => (
              <AttendanceStatusChip key={sz} status={ATTENDANCE_STATUS.PRESENT} mode="full" size={sz} />
            ))}
          </Row>
        </Section>

        {/* ── 2. Legend ── */}
        <Section title="2. AttendanceLegend">
          <Row label="V1 statuses (default)">
            <AttendanceLegend />
          </Row>
          <Row label="All statuses">
            <AttendanceLegend statuses={ATTENDANCE_STATUS_LIST} />
          </Row>
          <Row label="Compact (dot + label)">
            <AttendanceLegend compact />
          </Row>
          <Row label="Vertical layout">
            <AttendanceLegend layout="vertical" statuses={ATTENDANCE_STATUS_LIST} />
          </Row>
        </Section>

        {/* ── 3. Toggle ── */}
        <Section title="3. AttendanceToggle">
          <Row label="Interactive toggle (click to cycle)">
            <AttendanceToggle
              status={toggleStatus}
              onChange={setToggleStatus}
              label="Demo student"
              size="sm"
            />
            <AttendanceToggle
              status={toggleStatus}
              onChange={setToggleStatus}
              label="Demo student"
              size="md"
            />
            <AttendanceToggle
              status={toggleStatus}
              onChange={setToggleStatus}
              label="Demo student"
              size="lg"
            />
            <span className="text-xs text-textMuted ml-2">
              Current: <strong>{toggleStatus}</strong>
            </span>
          </Row>
          <Row label="All static statuses">
            {ATTENDANCE_STATUS_LIST.map((s) => (
              <AttendanceToggle key={s} status={s} onChange={() => {}} label={s} />
            ))}
          </Row>
          <Row label="Disabled">
            <AttendanceToggle status={ATTENDANCE_STATUS.PRESENT} onChange={() => {}} disabled label="Disabled" />
            <AttendanceToggle status={ATTENDANCE_STATUS.ABSENT}  onChange={() => {}} disabled label="Disabled" />
          </Row>
        </Section>

        {/* ── 4. Status Selector ── */}
        <Section title="4. AttendanceStatusSelector">
          <Row label="Pill variant — V1 (Present / Absent)">
            <AttendanceStatusSelector
              value={selectorVal}
              onChange={setSelectorVal}
              variant="pill"
            />
          </Row>
          <Row label="Pill variant — All statuses">
            <AttendanceStatusSelector
              value={selectorVal}
              onChange={setSelectorVal}
              statuses={ATTENDANCE_STATUS_LIST}
              variant="pill"
            />
          </Row>
          <Row label="Card variant — V1">
            <AttendanceStatusSelector
              value={selectorVal}
              onChange={setSelectorVal}
              variant="card"
            />
          </Row>
          <Row label="Disabled">
            <AttendanceStatusSelector
              value={ATTENDANCE_STATUS.PRESENT}
              onChange={() => {}}
              disabled
            />
          </Row>
        </Section>

        {/* ── 5. Percentage Indicator ── */}
        <Section title="5. AttendancePercentageIndicator">
          <Row label="Bar mode — good / warning / danger">
            <div className="w-64">
              <AttendancePercentageIndicator value={88} mode="bar" size="md" showTrend trend={3.2} />
            </div>
            <div className="w-64">
              <AttendancePercentageIndicator value={62} mode="bar" size="md" />
            </div>
            <div className="w-64">
              <AttendancePercentageIndicator value={42} mode="bar" size="md" showTrend trend={-5.1} />
            </div>
          </Row>
          <Row label="Circular mode">
            <AttendancePercentageIndicator value={88} mode="circular" size="sm" />
            <AttendancePercentageIndicator value={62} mode="circular" size="md" showTrend trend={-2} />
            <AttendancePercentageIndicator value={42} mode="circular" size="lg" />
          </Row>
          <Row label="Inline mode">
            <AttendancePercentageIndicator value={88} mode="inline" />
            <AttendancePercentageIndicator value={62} mode="inline" showTrend trend={-3} />
            <AttendancePercentageIndicator value={42} mode="inline" />
          </Row>
        </Section>

        {/* ── 6. Summary Card ── */}
        <Section title="6. AttendanceSummaryCard">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AttendanceSummaryCard
              data={{ present: 18, absent: 2, total: 20, late: 1 }}
              trend={4.2}
              trendLabel="vs last week"
              title="Batch B · Apr 2026"
            />
            <AttendanceSummaryCard
              data={{ present: 11, absent: 7, total: 18 }}
              title="Batch A · Jan 2026"
            />
            <AttendanceSummaryCard
              data={{ present: 0, absent: 0, total: 0 }}
              title="No sessions yet"
            />
            <AttendanceSummaryCard
              data={{ present: 18, absent: 2, total: 20 }}
              compact
              title="Compact mode"
            />
            <AttendanceSummaryCard loading title="Loading" />
          </div>
        </Section>

        {/* ── 7. KPI Widget ── */}
        <Section title="7. AttendanceKPIWidget">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {(['daily','weekly','monthly','batch','student']).map((period) => (
              <AttendanceKPIWidget
                key={period}
                period={period}
                data={{ value: 78 + Math.round(Math.random() * 15), trend: 2.1, present: 14, total: 20 }}
              />
            ))}
          </div>
        </Section>

        {/* ── 8. Trend Card ── */}
        <Section title="8. AttendanceTrendCard">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AttendanceTrendCard data={{ current: 85, previous: 80 }} period="week" />
            <AttendanceTrendCard data={{ current: 65, previous: 72 }} period="month" />
            <AttendanceTrendCard data={{ current: 45, previous: 50 }} period="quarter" />
          </div>
        </Section>

        {/* ── 9. Attendance Row ── */}
        <Section title="9. AttendanceRow">
          <div className="flex flex-col gap-2 max-w-xl">
            <AttendanceRow
              student={MOCK_STUDENTS[0]}
              status={ATTENDANCE_STATUS.PRESENT}
              onStatusChange={() => {}}
            />
            <AttendanceRow
              student={MOCK_STUDENTS[1]}
              status={ATTENDANCE_STATUS.ABSENT}
              onStatusChange={() => {}}
              selected
              onSelect={() => {}}
            />
            <AttendanceRow
              student={MOCK_STUDENTS[2]}
              status={ATTENDANCE_STATUS.PRESENT}
              onStatusChange={() => {}}
              onSelect={() => {}}
              remarks="Joined late"
              onRemarksChange={() => {}}
            />
            <AttendanceRow
              student={MOCK_STUDENTS[3]}
              status={ATTENDANCE_STATUS.ABSENT}
              onStatusChange={() => {}}
              disabled
            />
          </div>
        </Section>

        {/* ── 10. Attendance Sheet ── */}
        <Section title="10. AttendanceSheet (live demo)">
          <AttendanceSheet
            students={MOCK_STUDENTS}
            statuses={sheetStatuses}
            onStatusChange={handleSheetStatus}
          />
        </Section>

        {/* ── 11. Timeline ── */}
        <Section title="11. AttendanceTimeline">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-textMuted mb-3">Student attendance history</p>
              <AttendanceTimeline>
                {MOCK_TIMELINE_RECORDS.map((r, i) => (
                  <AttendanceTimelineItem
                    key={r.id}
                    record={r}
                    isLast={i === MOCK_TIMELINE_RECORDS.length - 1}
                  />
                ))}
              </AttendanceTimeline>
            </div>
            <div>
              <p className="text-xs text-textMuted mb-3">Recent activity feed</p>
              <AttendanceTimeline label="Recent attendance activity">
                {MOCK_ACTIVITY.map((a, i) => (
                  <AttendanceActivityItem
                    key={a.id}
                    activity={a}
                    isLast={i === MOCK_ACTIVITY.length - 1}
                  />
                ))}
              </AttendanceTimeline>
            </div>
          </div>
        </Section>

        {/* ── 12. Calendar ── */}
        <Section title="12. AttendanceCalendar">
          <div className="max-w-xs">
            <AttendanceCalendar
              attendanceMap={MOCK_CALENDAR}
              year={2026}
              month={3}
              onDayClick={(d) => console.info('Calendar day clicked:', d)}
            />
          </div>
        </Section>

        {/* ── 13. Filter Bar ── */}
        <Section title="13. AttendanceFilterBar">
          <AttendanceFilterBar
            filters={filters}
            onFilterChange={handleFilter}
            onReset={resetFilters}
            batches={MOCK_BATCHES}
          />
          <AttendanceFilterBar
            filters={filters}
            onFilterChange={handleFilter}
            onReset={resetFilters}
            batches={MOCK_BATCHES}
            compact
          />
        </Section>

        {/* ── 14. Bulk Toolbar ── */}
        <Section title="14. BulkAttendanceToolbar">
          <Row label="Full toolbar (3 selected)">
            <BulkAttendanceToolbar
              selectedCount={bulkCount}
              onMarkPresent={() => setBulkCount(0)}
              onMarkAbsent={() => setBulkCount(0)}
              onClear={() => setBulkCount(0)}
            />
          </Row>
          <Row label="Compact mode">
            <BulkAttendanceToolbar
              selectedCount={bulkCount || 2}
              onMarkPresent={() => {}}
              onMarkAbsent={() => {}}
              onClear={() => {}}
              compact
            />
          </Row>
          <Row label="Zero count (hidden)">
            <BulkAttendanceToolbar selectedCount={0} onMarkPresent={() => {}} onClear={() => {}} />
            <span className="text-xs text-textMuted italic">(toolbar hidden when count = 0)</span>
          </Row>
        </Section>

        {/* ── 15. Empty States ── */}
        <Section title="15. Attendance Empty States">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-md border border-border overflow-hidden">
              <NoAttendanceData onAction={() => {}} />
            </div>
            <div className="rounded-md border border-border overflow-hidden">
              <NoStudentsForBatch batchName="Batch C" onAction={() => {}} />
            </div>
            <div className="rounded-md border border-border overflow-hidden">
              <AttendanceNotMarked date="Apr 15, 2026" batchName="Batch B" onMarkNow={() => {}} />
            </div>
            <div className="rounded-md border border-border overflow-hidden">
              <AttendanceSearchEmpty query="Arun" onClear={() => {}} />
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
};

export { AttendanceShowcasePage };
export default AttendanceShowcasePage;
