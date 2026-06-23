/**
 * batchDashboardService.js
 * Centralized KPI metric calculations for Batch Management Dashboard.
 * All formulas are defined here — no duplicate logic in UI layers.
 */

import { mockBatches } from '../data/mockBatches';
import { mockStudents } from '../data/mockStudents';
import { mockAttendance } from '../data/mockAttendance';
import { BATCH_STATUS } from '../constants/batchStatus';
import { ATTENDANCE_STATUS } from '../constants/attendanceStatus';
import { calcAttendancePercentage, getDistinctDates } from '../utils/calcUtils';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns attendance % for a single batch.
 * Formula: avg of per-student attendance percentages.
 */
function _calcBatchAttendancePct(batchId) {
  const batchStudents = mockStudents.filter(
    (s) => s.batchId === batchId && s.isActive
  );
  if (!batchStudents.length) return 0;

  const batchRecords = mockAttendance.filter((r) => r.batchId === batchId);
  const totalSessions = getDistinctDates(batchRecords, batchId).length;
  if (!totalSessions) return 0;

  const studentPcts = batchStudents.map((s) => {
    const presentCount = batchRecords.filter(
      (r) => r.studentId === s.id && r.status === ATTENDANCE_STATUS.PRESENT
    ).length;
    return calcAttendancePercentage(presentCount, totalSessions);
  });

  return studentPcts.reduce((sum, p) => sum + p, 0) / studentPcts.length;
}

/**
 * Counts students with attendance below a threshold across all batches.
 */
function _countLowAttendanceStudents(threshold = 75) {
  const studentIds = [...new Set(mockStudents.filter((s) => s.isActive).map((s) => s.id))];
  let count = 0;
  studentIds.forEach((sid) => {
    const records = mockAttendance.filter((r) => r.studentId === sid);
    if (!records.length) return;
    const batchId = mockStudents.find((s) => s.id === sid)?.batchId;
    if (!batchId) return;
    const batchRecords = mockAttendance.filter((r) => r.batchId === batchId);
    const totalSessions = getDistinctDates(batchRecords, batchId).length;
    const present = records.filter((r) => r.status === ATTENDANCE_STATUS.PRESENT).length;
    const pct = calcAttendancePercentage(present, totalSessions);
    if (pct < threshold) count++;
  });
  return count;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * getBatchDashboardMetrics()
 * Returns all KPI values for the Batch Dashboard Cards section.
 *
 * @param {object} options
 * @param {Batch[]} [options.batches]   - Optional pre-filtered batch list.
 *                                        Defaults to ALL batches (global dataset).
 * @param {number}  [options.threshold] - Low-attendance threshold (default 75).
 * @returns {BatchDashboardMetrics}
 */
export async function getBatchDashboardMetrics({ batches, threshold = 75 } = {}) {
  if (USE_MOCK) {
    return _getMockMetrics({ batches, threshold });
  }
  // Future: replace with axios call to /api/dashboard/batch-metrics
  const res = await fetch('/api/dashboard/batch-metrics');
  return res.json();
}

function _getMockMetrics({ batches, threshold }) {
  const allBatches = batches ?? mockBatches;

  // --- Batch counts ---
  const totalBatches = allBatches.length;
  const activeBatches = allBatches.filter((b) => b.status === BATCH_STATUS.ACTIVE).length;
  const completedBatches = allBatches.filter((b) => b.status === BATCH_STATUS.COMPLETED).length;
  const upcomingBatches = allBatches.filter((b) => b.status === BATCH_STATUS.UPCOMING).length;

  // --- Student counts ---
  const batchIds = allBatches.map((b) => b.id);
  const allStudents = mockStudents.filter(
    (s) => s.isActive && batchIds.includes(s.batchId)
  );
  const totalStudents = allStudents.length;
  const avgStudentsPerBatch = totalBatches > 0
    ? Math.round(totalStudents / totalBatches)
    : 0;

  // --- Capacity (blueprint does not define a capacity field on Batch,
  //     so we use a sensible default: 30 students/batch max) ---
  const DEFAULT_BATCH_CAPACITY = 30;
  const totalCapacity = totalBatches * DEFAULT_BATCH_CAPACITY;
  const capacityUtilization = totalCapacity > 0
    ? Math.round((totalStudents / totalCapacity) * 100)
    : 0;

  // --- Completion rate ---
  const completionRate = totalBatches > 0
    ? Math.round((completedBatches / totalBatches) * 100)
    : 0;

  // --- Attendance ---
  const activeBatchList = allBatches.filter((b) => b.status === BATCH_STATUS.ACTIVE);
  const activeBatchPcts = activeBatchList.map((b) => _calcBatchAttendancePct(b.id));
  const avgAttendance = activeBatchPcts.length
    ? Math.round(activeBatchPcts.reduce((s, p) => s + p, 0) / activeBatchPcts.length)
    : 0;

  const lowAttendanceCount = _countLowAttendanceStudents(threshold);

  return {
    totalBatches,
    activeBatches,
    completedBatches,
    upcomingBatches,
    totalStudents,
    avgStudentsPerBatch,
    capacityUtilization,
    completionRate,
    avgAttendance,
    lowAttendanceCount,
    // Raw arrays for optional deep-drill use
    activeBatchAttendances: activeBatchPcts,
  };
}

/**
 * getCapacityUtilization(batchId)
 * Per-batch capacity utilization.
 */
export async function getCapacityUtilization(batchId, capacity = 30) {
  if (USE_MOCK) {
    const count = mockStudents.filter(
      (s) => s.batchId === batchId && s.isActive
    ).length;
    return Math.round((count / capacity) * 100);
  }
  const res = await fetch(`/api/batches/${batchId}/capacity`);
  return res.json();
}

/**
 * getCompletionRate()
 * Global batch completion rate.
 */
export async function getCompletionRate() {
  if (USE_MOCK) {
    const total = mockBatches.length;
    const done = mockBatches.filter((b) => b.status === BATCH_STATUS.COMPLETED).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }
  const res = await fetch('/api/analytics/completion-rate');
  return res.json();
}

/**
 * getAttendanceAverage()
 * Average attendance % across all active batches.
 */
export async function getAttendanceAverage() {
  if (USE_MOCK) {
    const activeBatches = mockBatches.filter((b) => b.status === BATCH_STATUS.ACTIVE);
    if (!activeBatches.length) return 0;
    const pcts = activeBatches.map((b) => _calcBatchAttendancePct(b.id));
    return Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
  }
  const res = await fetch('/api/analytics/attendance-average');
  return res.json();
}
