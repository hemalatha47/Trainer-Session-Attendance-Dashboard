/**
 * attendanceDashboardService.js
 * Centralized KPI metric calculations for the Attendance Dashboard page.
 * Module: 6.1
 *
 * Blueprint Sections: 4.3, 6.2, 9.1–9.5, 10.5
 *
 * ARCHITECTURE RULES:
 *  - Pages and hooks NEVER compute metrics inline — this service owns all formulas.
 *  - All methods return the { success, data, meta, error } shape.
 *  - All methods are async for API-migration safety.
 *  - USE_MOCK flag controls data source.
 *
 * KPI FORMULAS (locked):
 *  Today Attendance %  = present today / total expected today × 100
 *  Total Marked Today  = count(all attendance records for today)
 *  Absent Today        = count(absent records for today)
 *  Pending Batches     = active batches with no attendance record for today
 */

import { mockBatches }    from '@data/mockBatches';
import { mockStudents }   from '@data/mockStudents';
import { mockAttendance } from '@data/mockAttendance';
import { mockUsers }      from '@data/mockUsers';
import { BATCH_STATUS }   from '@constants/batchStatus';
import { ATTENDANCE_STATUS } from '@constants/attendanceStatus';
import { ok, fail, tryCatch } from '@utils/serviceResponse';
import { getToday, formatDate, getDistinctAttendanceDates } from '@utils/dateUtils';
import {
  calculateAttendancePercentage,
  calculatePresentCount,
  calculateAbsentCount,
} from '@utils/calcUtils';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ── Internal helpers ───────────────────────────────────────────────────────

/**
 * Returns a display name for a user ID by looking up mockUsers.
 * Falls back to the raw ID if not found.
 */
const _resolveUserName = (userId) => {
  const user = mockUsers.find((u) => u.id === userId);
  return user ? user.name : userId;
};

/**
 * Returns a batch's display name by ID.
 */
const _resolveBatchName = (batchId) => {
  const batch = mockBatches.find((b) => b.id === batchId);
  return batch ? batch.batchName : batchId;
};

/**
 * Returns the active students for a given batchId.
 */
const _getActiveStudentsForBatch = (batchId) =>
  mockStudents.filter((s) => s.batchId === batchId && s.status !== 'inactive');

// ── Public service methods ─────────────────────────────────────────────────

/**
 * getAttendanceDashboardMetrics()
 *
 * Aggregated KPI metrics for the Attendance Dashboard landing page.
 *
 * Returns:
 *  - todayRate          : overall present % today (0–100, 0 if no data)
 *  - totalMarkedToday   : total attendance records submitted today
 *  - presentToday       : present count today
 *  - absentToday        : absent count today
 *  - pendingBatches     : active batches without any attendance record today
 *  - activeBatchCount   : total active batches
 *  - todayBatchStatuses : per-batch status for active batches (for Today panel)
 *
 * Blueprint Sections: 6.2, 10.5
 *
 * @returns {Promise<ServiceResponse>}
 */
export const getAttendanceDashboardMetrics = async () => {
  return tryCatch(() => {
    const today = getToday();

    if (USE_MOCK) {
      // Active batches only
      const activeBatches = mockBatches.filter(
        (b) => b.status === BATCH_STATUS.ACTIVE
      );

      // All attendance records for today across active batches
      const activeBatchIds = activeBatches.map((b) => b.id);
      const todayRecords   = mockAttendance.filter(
        (r) => r.date === today && activeBatchIds.includes(r.batchId)
      );

      // Batches that have at least one record for today
      const batchesMarkedToday = new Set(todayRecords.map((r) => r.batchId));

      // KPI formula: present today / total expected today × 100
      // "Total expected today" = total active students in batches that have
      //  already submitted attendance for today (i.e. among marked batches).
      const markedBatchStudentCount = activeBatches
        .filter((b) => batchesMarkedToday.has(b.id))
        .reduce((acc, b) => acc + _getActiveStudentsForBatch(b.id).length, 0);

      const presentToday  = calculatePresentCount(todayRecords);
      const absentToday   = calculateAbsentCount(todayRecords);
      const totalMarked   = todayRecords.length;

      // Divide-by-zero guard
      const todayRate = markedBatchStudentCount > 0
        ? calculateAttendancePercentage(presentToday, markedBatchStudentCount)
        : 0;

      // Pending batches = active batches with no records today
      const pendingBatches = activeBatches
        .filter((b) => !batchesMarkedToday.has(b.id))
        .map((b) => ({
          batchId:    b.id,
          batchName:  b.batchName,
          batchCode:  b.batchCode,
          trainerId:  b.trainerId,
          trainerName: b.trainerName,
        }));

      // Per-batch today status for TodayStatusPanel
      const todayBatchStatuses = activeBatches.map((b) => {
        const batchTodayRecs = todayRecords.filter((r) => r.batchId === b.id);
        const activeStudents = _getActiveStudentsForBatch(b.id);
        const expectedCount  = activeStudents.length;
        const markedCount    = batchTodayRecs.length;
        const batchPresent   = calculatePresentCount(batchTodayRecs);
        const batchAbsent    = calculateAbsentCount(batchTodayRecs);
        const isMarked       = markedCount > 0;
        const isComplete     = isMarked && markedCount >= expectedCount;

        let statusLabel;
        if (isComplete)    statusLabel = 'completed';
        else if (isMarked) statusLabel = 'in_progress';
        else               statusLabel = 'pending';

        return {
          batchId:      b.id,
          batchName:    b.batchName,
          batchCode:    b.batchCode,
          trainerName:  b.trainerName,
          statusLabel,
          markedCount,
          expectedCount,
          presentCount: batchPresent,
          absentCount:  batchAbsent,
          rate: isMarked
            ? calculateAttendancePercentage(batchPresent, markedCount)
            : 0,
        };
      });

      return ok(
        {
          todayRate,
          totalMarkedToday:  totalMarked,
          presentToday,
          absentToday,
          pendingBatches,
          pendingCount:      pendingBatches.length,
          activeBatchCount:  activeBatches.length,
          todayBatchStatuses,
        },
        { date: today }
      );
    }

    // Future: GET /api/dashboard/summary
    return fail('ATTENDANCE_DASHBOARD_NOT_IMPL', 'Live API not implemented');
  });
};

/**
 * getRecentAttendanceSessions()
 *
 * Returns the 5 most recently submitted attendance sessions.
 * Each entry represents one batch+date submission.
 *
 * Blueprint Section 6.2, 10.5
 *
 * @param {number} [limit=5]
 * @returns {Promise<ServiceResponse>}
 */
export const getRecentAttendanceSessions = async (limit = 5) => {
  return tryCatch(() => {
    if (USE_MOCK) {
      // Group attendance records by (batchId + date) to represent sessions
      const sessionMap = {};
      for (const r of mockAttendance) {
        const key = `${r.batchId}::${r.date}`;
        if (!sessionMap[key]) {
          sessionMap[key] = {
            key,
            batchId:      r.batchId,
            batchName:    _resolveBatchName(r.batchId),
            date:         r.date,
            markedBy:     r.markedBy,
            markedByName: _resolveUserName(r.markedBy),
            markedAt:     r.createdAt || r.date,
            presentCount: 0,
            absentCount:  0,
            totalCount:   0,
          };
        }
        const s = sessionMap[key];
        s.totalCount++;
        if (r.status === ATTENDANCE_STATUS.PRESENT) s.presentCount++;
        else s.absentCount++;

        // Track latest markedAt for sorting
        const rAt = r.updatedAt || r.createdAt || '';
        if (rAt > s.markedAt) s.markedAt = rAt;
      }

      const sessions = Object.values(sessionMap)
        .sort((a, b) => {
          // Sort by date descending, then markedAt descending
          if (b.date !== a.date) return b.date.localeCompare(a.date);
          return b.markedAt.localeCompare(a.markedAt);
        })
        .slice(0, limit)
        .map((s) => ({
          ...s,
          attendanceRate: calculateAttendancePercentage(s.presentCount, s.totalCount),
          formattedDate:  formatDate(s.date),
        }));

      return ok(sessions, { count: sessions.length, limit });
    }

    // Future: GET /api/dashboard/recent?limit=
    return fail('ATTENDANCE_DASHBOARD_NOT_IMPL', 'Live API not implemented');
  });
};
