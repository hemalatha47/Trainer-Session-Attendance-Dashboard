/**
 * StudentAttendanceTab.jsx
 * Attendance Intelligence tab for Student Details Page (Module 5.6, Task 12).
 *
 * Layout (top to bottom):
 *   1. Attendance KPI Row (%, streaks, risk)
 *   2. Attendance Chart (trend line)
 *   3. Two-column: Timeline | Risk & Alerts
 *
 * Props:
 *   studentId  {string}
 *   batchId    {string}
 */

import { motion }   from 'framer-motion';
import { fadeIn }   from '@constants/animations';
import { ErrorState }                 from '@components/feedback/ErrorState';
import useStudentAttendance           from '@hooks/useStudentAttendance';
import StudentAttendanceKPIRow        from './StudentAttendanceKPIRow';
import StudentAttendanceTimeline      from './StudentAttendanceTimeline';
import StudentRiskAlertPanel          from './StudentRiskAlertPanel';
import { StudentAttendanceChart }     from '@components/attendance/StudentAttendanceChart';

const StudentAttendanceTab = ({ studentId, batchId }) => {
  const { analytics, loading, error, refresh } = useStudentAttendance(studentId, batchId);

  if (error && !analytics) {
    return (
      <ErrorState
        title="Failed to load attendance data"
        description={error}
        retryLabel="Try again"
        onRetry={refresh}
      />
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6"
    >
      {/* 1. KPI Row */}
      <StudentAttendanceKPIRow analytics={analytics} loading={loading} />

      {/* 2. Attendance Chart */}
      <StudentAttendanceChart
        chartSeries={analytics?.chartSeries ?? []}
        threshold={75}
        loading={loading}
      />

      {/* 3. Two-column: Timeline + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline — 2/3 width */}
        <div className="lg:col-span-2">
          <StudentAttendanceTimeline
            timeline={analytics?.timeline ?? []}
            loading={loading}
          />
        </div>

        {/* Risk alert panel — 1/3 width */}
        <div>
          <StudentRiskAlertPanel analytics={analytics} loading={loading} />
        </div>
      </div>
    </motion.div>
  );
};

StudentAttendanceTab.displayName = 'StudentAttendanceTab';

export default StudentAttendanceTab;
