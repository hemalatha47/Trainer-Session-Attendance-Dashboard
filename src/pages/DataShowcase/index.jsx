/**
 * DataShowcase/index.jsx
 * Visual testing reference for all Module 3.4 Data Components.
 * Development-only — accessible at /data-showcase.
 */

import { motion } from 'framer-motion';
import { pageTransition } from '@constants/animations';
import {
  DataTable, AdvancedTable, StatCard, MetricCard, KPIWidget,
  InfoCard, KeyValueDisplay, SummaryCard, DataList, SearchResultItem,
  StatusBadge, UserAvatar, AttendanceAvatar, AvatarGroup,
  ProgressBar, CircularProgress, PercentageIndicator,
  TrendIndicator, Timeline, TimelineItem, ActivityItem,
  EmptyDataView, NoResultsView, NoRecordsView,
} from '@components/data';
import { Avatar } from '@components/ui/Avatar';
import { Badge } from '@components/ui/Badge';
import { Divider } from '@components/ui/Divider';
import { Button } from '@components/ui/Button';
import {
  Users, Layers, ClipboardCheck, FileText, BarChart2,
  Edit, Trash2, Eye, CheckCircle2,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <section className="flex flex-col gap-5">
    <h2 className="text-lg font-semibold text-primary-600 border-b border-border pb-2">{title}</h2>
    {children}
  </section>
);

const Row = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    {label && <p className="text-xs font-medium text-textMuted uppercase tracking-wide">{label}</p>}
    <div className="flex flex-wrap gap-3 items-center">{children}</div>
  </div>
);

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
  { id: 's1', name: 'Arun Kumar',  code: 'NM2026001', batch: 'Batch B', attendance: 88, status: 'active' },
  { id: 's2', name: 'Divya Priya', code: 'NM2026002', batch: 'Batch B', attendance: 62, status: 'active' },
  { id: 's3', name: 'Manoj Raj',   code: 'NM2026003', batch: 'Batch B', attendance: 45, status: 'inactive' },
  { id: 's4', name: 'Preethi S',   code: 'NM2026004', batch: 'Batch B', attendance: 91, status: 'active' },
  { id: 's5', name: 'Karthik V',   code: 'NM2026005', batch: 'Batch B', attendance: 78, status: 'active' },
];

const STUDENT_COLUMNS = [
  {
    key: 'name', label: 'Student', sortable: true,
    render: (v) => (
      <UserAvatar name={v} size="sm" />
    ),
  },
  { key: 'code', label: 'ID', sortable: true },
  { key: 'batch', label: 'Batch', sortable: true },
  {
    key: 'attendance', label: 'Attendance %', sortable: true,
    render: (v) => <PercentageIndicator value={v} showBar />,
  },
  {
    key: 'status', label: 'Status',
    render: (v) => <StatusBadge type="student" status={v} />,
  },
  {
    key: 'id', label: 'Actions', isAction: true,
    render: (_, row) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" aria-label="View"><Eye className="w-4 h-4" /></Button>
        <Button variant="ghost" size="sm" aria-label="Edit"><Edit className="w-4 h-4" /></Button>
      </div>
    ),
  },
];

// ── Component ────────────────────────────────────────────────────────────────
const DataShowcase = () => (
  <motion.div className="min-h-screen bg-background p-6 lg:p-10" {...pageTransition}>
    <div className="max-w-6xl mx-auto space-y-12">

      <div>
        <h1 className="text-2xl font-bold text-primary-600">Data Component Library</h1>
        <p className="mt-1 text-sm text-textMuted">
          Module 3.4 — Development showcase. All data presentation components.
        </p>
      </div>

      {/* ── Stat / Metric / KPI Cards ─────────────────────────────────── */}
      <Section title="StatCard">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Students" value={243} icon={<Users className="w-5 h-5" />} trend={5.2} trendLabel="vs last batch" status="default" />
          <StatCard label="Active Batches"  value={3}   icon={<Layers className="w-5 h-5" />} trend={0} status="success" />
          <StatCard label="Avg Attendance"  value="78%" icon={<ClipboardCheck className="w-5 h-5" />} trend={-2.1} trendLabel="vs last week" status="warning" />
          <StatCard label="Low Attendance Alerts" value={5} icon={<FileText className="w-5 h-5" />} status="danger" description="Below 75%" />
        </div>
        <StatCard label="Loading state" loading className="max-w-xs" />
      </Section>

      <Section title="MetricCard">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <MetricCard label="Overall Attendance Rate" value="84.3" unit="%" trend={+3.1} trendLabel="this week" comparisonLabel="Batch avg: 78%" icon={<BarChart2 className="w-5 h-5" />} />
          <MetricCard label="Sessions Held" value={42} trend={0} comparisonLabel="Target: 60 sessions" icon={<ClipboardCheck className="w-5 h-5" />} />
        </div>
      </Section>

      <Section title="KPIWidget">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIWidget title="Attendance Rate" value="84.3" unit="%" trend={+3.1} trendLabel="vs last week" status="success" icon={<BarChart2 className="w-5 h-5" />} />
          <KPIWidget title="Total Students" value={243} trend={+5} trendLabel="new this month" status="default" icon={<Users className="w-5 h-5" />} />
          <KPIWidget title="At Risk Students" value={5} status="danger" comparisonValue="Below 75% threshold" icon={<FileText className="w-5 h-5" />} />
          <KPIWidget title="Sessions Held" value={42} trend={0} status="warning" comparisonValue="Target: 60" />
        </div>
      </Section>

      <Divider />

      {/* ── DataTable ─────────────────────────────────────────────────── */}
      <Section title="DataTable">
        <DataTable
          columns={STUDENT_COLUMNS}
          data={MOCK_STUDENTS}
          caption="Student attendance table"
          emptyTitle="No students"
          emptyActionLabel="Add Student"
        />
      </Section>

      <Section title="AdvancedTable (with search + column toggle + pagination)">
        <AdvancedTable
          columns={STUDENT_COLUMNS}
          data={MOCK_STUDENTS}
          searchable
          searchPlaceholder="Search students…"
          selectable
          page={1}
          pageSize={3}
          totalCount={MOCK_STUDENTS.length}
          onPageChange={() => {}}
        />
      </Section>

      <Section title="DataTable States">
        <Row label="Loading">
          <div className="w-full"><DataTable columns={STUDENT_COLUMNS} data={[]} loading /></div>
        </Row>
        <Row label="Empty (with action)">
          <DataTable columns={STUDENT_COLUMNS} data={[]} emptyTitle="No students in this batch" emptyDescription="Add a student to mark attendance." emptyActionLabel="Add Student" emptyIcon={<Users className="w-8 h-8" />} />
        </Row>
        <Row label="Error">
          <DataTable columns={STUDENT_COLUMNS} data={[]} error="Failed to load students. Please retry." onRetry={() => {}} />
        </Row>
      </Section>

      <Divider />

      {/* ── StatusBadge ───────────────────────────────────────────────── */}
      <Section title="StatusBadge">
        <Row label="Attendance">
          <StatusBadge type="attendance" status="present" />
          <StatusBadge type="attendance" status="absent" />
          <StatusBadge type="attendance" status="late" />
          <StatusBadge type="attendance" status="leave" />
        </Row>
        <Row label="Batch">
          <StatusBadge type="batch" status="active" />
          <StatusBadge type="batch" status="completed" />
          <StatusBadge type="batch" status="upcoming" />
          <StatusBadge type="batch" status="archived" />
        </Row>
        <Row label="Student">
          <StatusBadge type="student" status="active" />
          <StatusBadge type="student" status="inactive" />
        </Row>
        <Row label="Sizes">
          <StatusBadge type="attendance" status="present" size="sm" />
          <StatusBadge type="attendance" status="present" size="md" />
          <StatusBadge type="attendance" status="present" size="lg" />
        </Row>
      </Section>

      <Divider />

      {/* ── Avatar System ─────────────────────────────────────────────── */}
      <Section title="Avatar System">
        <Row label="UserAvatar">
          <UserAvatar name="Arun Kumar" role="Student" size="sm" />
          <UserAvatar name="Training Manager" role="Manager" size="md" status="online" />
          <UserAvatar name="Trainer One" role="Trainer" size="lg" />
        </Row>
        <Row label="AttendanceAvatar">
          <AttendanceAvatar name="Arun Kumar" attendanceStatus="present" />
          <AttendanceAvatar name="Divya Priya" attendanceStatus="absent" />
          <AttendanceAvatar name="Manoj Raj" attendanceStatus="late" />
          <AttendanceAvatar name="Preethi S" attendanceStatus="leave" />
        </Row>
        <Row label="AvatarGroup">
          <AvatarGroup max={4} size="sm">
            {MOCK_STUDENTS.map((s) => (
              <Avatar key={s.id} name={s.name} size="sm" />
            ))}
          </AvatarGroup>
        </Row>
      </Section>

      <Divider />

      {/* ── Progress ──────────────────────────────────────────────────── */}
      <Section title="Progress Components">
        <div className="flex flex-col gap-4 max-w-md">
          <ProgressBar value={88} label="Arun Kumar" showValue color="auto" />
          <ProgressBar value={62} label="Divya Priya" showValue color="auto" />
          <ProgressBar value={45} label="Manoj Raj" showValue color="auto" />
          <ProgressBar value={100} label="Complete" showValue color="success" size="lg" />
          <ProgressBar value={30} label="Low" showValue color="danger" size="sm" />
        </div>

        <Row label="CircularProgress">
          <CircularProgress value={88} size={64} color="auto" />
          <CircularProgress value={62} size={64} color="auto" />
          <CircularProgress value={45} size={64} color="auto" />
          <CircularProgress value={100} size={80} color="success" showValue />
          <CircularProgress value={0} size={48} color="danger" />
        </Row>

        <Row label="PercentageIndicator">
          <PercentageIndicator value={88} showBar />
          <PercentageIndicator value={62} showBar />
          <PercentageIndicator value={45} showBar />
          <PercentageIndicator value={100} />
        </Row>
      </Section>

      <Divider />

      {/* ── TrendIndicator ────────────────────────────────────────────── */}
      <Section title="TrendIndicator">
        <Row>
          <TrendIndicator value={5.2} label="vs last batch" />
          <TrendIndicator value={-2.1} label="vs last week" />
          <TrendIndicator value={0} label="no change" />
          <TrendIndicator value={12.4} size="lg" />
          <TrendIndicator value={-8.0} size="sm" showIcon={false} />
        </Row>
      </Section>

      <Divider />

      {/* ── Timeline ──────────────────────────────────────────────────── */}
      <Section title="Timeline">
        <div className="max-w-md">
          <Timeline>
            <TimelineItem
              title="Attendance marked — Batch B"
              description="24 students marked present by Training Manager"
              timestamp="14 Jun 2026, 9:30 AM"
              icon={<CheckCircle2 className="w-4 h-4 text-success-DEFAULT" />}
            />
            <ActivityItem
              title="Student added — Arun Kumar"
              description="Added to Batch B"
              timestamp="10 Jun 2026"
              badgeType="student"
              badgeStatus="active"
            />
            <ActivityItem
              title="Batch B created"
              timestamp="7 Apr 2026"
              badgeType="batch"
              badgeStatus="active"
              isLast
            />
          </Timeline>
        </div>
      </Section>

      <Divider />

      {/* ── InfoCard / KeyValueDisplay / SummaryCard / DataList ───────── */}
      <Section title="Info Components">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="Batch Details" subtitle="Batch B – Apr 2026" headerRight={<StatusBadge type="batch" status="active" />}>
            <KeyValueDisplay items={[
              { label: 'Start Date', value: '7 Apr 2026' },
              { label: 'End Date', value: '27 Jun 2026' },
              { label: 'Trainer', value: 'Trainer One' },
              { label: 'Students', value: 5 },
              { label: 'Description', value: 'Oracle DB Fundamentals + GST Filing', span: true },
            ]} />
          </InfoCard>

          <SummaryCard
            title="Batch B Attendance Summary"
            metrics={[
              { label: 'Total Sessions', value: 42 },
              { label: 'Avg Attendance', value: '78%', color: 'text-success-DEFAULT' },
              { label: 'Students < 75%', value: 2, color: 'text-danger-DEFAULT' },
              { label: 'Perfect Attendance', value: 1, color: 'text-accent-600' },
            ]}
          />
        </div>

        <div className="max-w-sm">
          <InfoCard title="Student Profile">
            <DataList items={[
              { label: 'Student ID',  value: 'NM2026001' },
              { label: 'Email',       value: 'arun@mail.com' },
              { label: 'Phone',       value: '9876500001' },
              { label: 'Batch',       value: 'Batch B' },
              { label: 'Status',      value: <StatusBadge type="student" status="active" size="sm" /> },
            ]} />
          </InfoCard>
        </div>

        <Row label="SearchResultItem">
          <div className="w-full max-w-md border border-border rounded-md overflow-hidden bg-white divide-y divide-border">
            {MOCK_STUDENTS.slice(0,3).map((s) => (
              <SearchResultItem
                key={s.id}
                avatar={<Avatar name={s.name} size="sm" />}
                title={s.name}
                subtitle={`${s.code} · ${s.batch}`}
                meta={`${s.attendance}%`}
                badge={<StatusBadge type="student" status={s.status} size="sm" />}
                onClick={() => {}}
              />
            ))}
          </div>
        </Row>
      </Section>

      <Divider />

      {/* ── Empty Data Views ───────────────────────────────────────────── */}
      <Section title="Empty Data Views">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-border rounded-md bg-white">
            <EmptyDataView entity="students" actionLabel="Add Student" />
          </div>
          <div className="border border-border rounded-md bg-white">
            <NoResultsView query="xyz123" onClear={() => {}} />
          </div>
          <div className="border border-border rounded-md bg-white">
            <NoRecordsView entity="attendance" actionLabel="Mark Attendance" />
          </div>
        </div>
      </Section>

      <Divider spacing="xl" />

      <p className="text-center text-xs text-textMuted pb-6">
        Module 3.4 — Data Component Library — Naan Mudhalvan Internship 2026
      </p>

    </div>
  </motion.div>
);

export default DataShowcase;
