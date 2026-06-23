/**
 * attendanceHistoryService.js
 * Service layer for attendance history, sessions list, and timeline data.
 * Module: 6.6
 *
 * Responsibilities:
 *  - Build a flat "sessions" list grouped by (batchId + date).
 *  - Filter sessions by batch, date range, or status threshold.
 *  - Paginate session results.
 *  - Build a chronological activity timeline from session data.
 *
 * Architecture rules:
 *  - No JSX / React — pure async service.
 *  - Reads from attendanceService (which owns the mock store); never imports
 *    mock data files directly.
 *  - Returns the standard { success, data, meta, error } shape.
 *  - All date handling delegates to dateUtils.
 */

import { getAttendanceByBatch } from '@services/attendanceService';
import { getBatches }           from '@services/batchService';
import { mockUsers }            from '@data/mockUsers';
import { ok, fail, tryCatch }   from '@utils/serviceResponse';
import { paginate }             from '@utils/pagination';
import {
  getDistinctAttendanceDates,
  formatDate,
  formatDateTime,
  compareAttendanceDates,
} from '@utils/dateUtils';
import {
  calculatePresentCount,
  calculateAbsentCount,
  calculateAttendancePercentage,
} from '@utils/calcUtils';
import { getAttendanceColor }   from '@constants/attendanceStatus';
import { DEFAULT_ATTENDANCE_THRESHOLD } from '@constants/validation';

// ── Error codes ───────────────────────────────────────────────────────────────

export const HISTORY_ERRORS = Object.freeze({
  LOAD_FAILED:    'HISTORY_LOAD_FAILED',
  INVALID_FILTER: 'HISTORY_INVALID_FILTER',
  UNEXPECTED:     'HISTORY_UNEXPECTED',
});

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Look up a display name for a userId. */
const _resolveMarkedBy = (userId) => {
  const user = mockUsers.find((u) => u.id === userId);
  return user?.name ?? userId ?? 'Unknown';
};

/**
 * Aggregates a flat array of attendance records into one session object
 * per (batchId + date) pair.
 *
 * @param {object[]} records       - Raw attendance records for a batch.
 * @param {object}   batch         - Batch reference { id, batchName, trainerName }.
 * @param {number}   threshold
 * @returns {object[]} sessions
 */
const _buildSessions = (records, batch, threshold) => {
  const distinctDates = getDistinctAttendanceDates(records);

  return distinctDates.map((date) => {
    const dayRecords    = records.filter((r) => r.date === date);
    const presentCount  = calculatePresentCount(dayRecords);
    const absentCount   = calculateAbsentCount(dayRecords);
    const totalCount    = dayRecords.length;
    const percentage    = calculateAttendancePercentage(presentCount, totalCount);
    const statusColor   = getAttendanceColor(percentage, threshold);

    // Latest markedAt for this session
    const markedAt = dayRecords
      .map((r) => r.updatedAt ?? r.createdAt ?? '')
      .sort()
      .reverse()[0] ?? '';

    const markedById = dayRecords[0]?.markedBy ?? '';

    return {
      id:           `session-${batch.id}-${date}`,
      batchId:      batch.id,
      batchName:    batch.batchName ?? batch.name ?? batch.id,
      trainerName:  batch.trainerName ?? 'Unknown',
      date,
      displayDate:  formatDate(date),
      presentCount,
      absentCount,
      totalCount,
      percentage,
      statusColor,
      markedBy:     markedById,
      markedByName: _resolveMarkedBy(markedById),
      markedAt,
      displayMarkedAt: markedAt ? formatDateTime(markedAt) : '',
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC SERVICE METHODS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns paginated attendance session history across all (or a filtered set of) batches.
 *
 * @param {{
 *   batchId?:    string,   — filter to one batch
 *   from?:       string,   — YYYY-MM-DD
 *   to?:         string,   — YYYY-MM-DD
 *   statusColor?: 'success'|'warning'|'danger',  — filter by risk level
 *   search?:     string,   — search by batchName
 *   page?:       number,
 *   pageSize?:   number,
 *   threshold?:  number,
 * }} [filters]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: object[] | null,
 *   meta: {
 *     total, page, pageSize, totalPages, from, to, hasNext, hasPrev,
 *     totalSessions, batchCount,
 *   },
 *   error: { code, message } | null,
 * }>}
 */
export const getAttendanceHistory = async (filters = {}) => {
  return tryCatch(async () => {
    const {
      batchId,
      from,
      to,
      statusColor,
      search,
      page       = 1,
      pageSize   = 10,
      threshold  = DEFAULT_ATTENDANCE_THRESHOLD,
    } = filters;

    // ── 1. Fetch all batches (we need names / trainerName) ──────────────────
    const batchRes = await getBatches();
    if (!batchRes.success) {
      return fail(HISTORY_ERRORS.LOAD_FAILED, 'Failed to load batch list');
    }

    const allBatches = batchRes.data ?? [];

    // Narrow to requested batch if a filter is supplied
    const batches = batchId
      ? allBatches.filter((b) => b.id === batchId)
      : allBatches;

    // ── 2. For each batch, fetch records and build sessions ──────────────────
    let allSessions = [];

    for (const batch of batches) {
      const recRes = await getAttendanceByBatch(batch.id, { from, to });
      if (!recRes.success || !recRes.data?.length) continue;

      const sessions = _buildSessions(recRes.data, batch, threshold);
      allSessions = allSessions.concat(sessions);
    }

    // ── 3. Sort: newest first ────────────────────────────────────────────────
    allSessions.sort((a, b) => compareAttendanceDates(b.date, a.date));

    // ── 4. Apply optional filters ────────────────────────────────────────────
    if (statusColor) {
      allSessions = allSessions.filter((s) => s.statusColor === statusColor);
    }

    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      allSessions = allSessions.filter(
        (s) =>
          s.batchName.toLowerCase().includes(q) ||
          s.trainerName.toLowerCase().includes(q)
      );
    }

    // ── 5. Paginate ──────────────────────────────────────────────────────────
    const { data, meta } = paginate(allSessions, page, pageSize);

    return ok(data, {
      ...meta,
      totalSessions: allSessions.length,
      batchCount:    batches.length,
    });
  });
};

/**
 * Returns a summary metrics object for the history page KPI cards.
 *
 * @param {{
 *   batchId?: string,
 *   from?:    string,
 *   to?:      string,
 *   threshold?: number,
 * }} [filters]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     totalSessions:    number,
 *     averageAttendance: number,
 *     updatedSessions:  number,
 *     lowAttendanceCount: number,
 *   } | null,
 *   meta: {},
 *   error: { code, message } | null,
 * }>}
 */
export const getHistorySummary = async (filters = {}) => {
  return tryCatch(async () => {
    const { batchId, from, to, threshold = DEFAULT_ATTENDANCE_THRESHOLD } = filters;

    const batchRes = await getBatches();
    if (!batchRes.success) {
      return fail(HISTORY_ERRORS.LOAD_FAILED, 'Failed to load batch list');
    }

    const allBatches = batchRes.data ?? [];
    const batches    = batchId ? allBatches.filter((b) => b.id === batchId) : allBatches;

    let allSessions = [];

    for (const batch of batches) {
      const recRes = await getAttendanceByBatch(batch.id, { from, to });
      if (!recRes.success || !recRes.data?.length) continue;
      const sessions = _buildSessions(recRes.data, batch, threshold);
      allSessions = allSessions.concat(sessions);
    }

    if (allSessions.length === 0) {
      return ok({
        totalSessions:      0,
        averageAttendance:  0,
        updatedSessions:    0,
        lowAttendanceCount: 0,
      });
    }

    const totalSessions      = allSessions.length;
    const avgSum             = allSessions.reduce((acc, s) => acc + s.percentage, 0);
    const averageAttendance  = Math.round((avgSum / totalSessions) * 10) / 10;
    const updatedSessions    = allSessions.filter(
      (s) => s.markedAt && s.markedAt !== ''
    ).length;
    const lowAttendanceCount = allSessions.filter(
      (s) => s.statusColor === 'danger'
    ).length;

    return ok({ totalSessions, averageAttendance, updatedSessions, lowAttendanceCount });
  });
};

/**
 * Builds chronological timeline entries from session history.
 * Newest entries first (descending date order).
 *
 * @param {object[]} sessions  — from getAttendanceHistory().data
 * @param {number}   [limit]   — optional cap
 * @returns {object[]} timeline entries
 */
export const buildAttendanceTimeline = (sessions, limit) => {
  if (!Array.isArray(sessions)) return [];

  const entries = sessions.map((s) => ({
    id:          s.id,
    type:        'attendance_session',
    batchId:     s.batchId,
    batchName:   s.batchName,
    trainerName: s.trainerName,
    date:        s.date,
    displayDate: s.displayDate,
    timestamp:   s.displayMarkedAt || s.displayDate,
    summary:     `${s.presentCount}P / ${s.absentCount}A — ${s.percentage}%`,
    percentage:  s.percentage,
    statusColor: s.statusColor,
    markedByName: s.markedByName,
  }));

  // Newest first
  entries.sort((a, b) => compareAttendanceDates(b.date, a.date));

  return limit ? entries.slice(0, limit) : entries;
};

/**
 * Returns full details for a single session by its composite key.
 *
 * @param {string} batchId
 * @param {string} date     YYYY-MM-DD
 * @param {number} [threshold]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: object | null,
 *   meta: {},
 *   error: { code, message } | null,
 * }>}
 */
export const getSessionDetails = async (batchId, date, threshold = DEFAULT_ATTENDANCE_THRESHOLD) => {
  return tryCatch(async () => {
    if (!batchId || !date) {
      return fail(HISTORY_ERRORS.INVALID_FILTER, 'batchId and date are required');
    }

    const batchRes = await getBatches();
    if (!batchRes.success) {
      return fail(HISTORY_ERRORS.LOAD_FAILED, 'Failed to load batch data');
    }

    const batch = (batchRes.data ?? []).find((b) => b.id === batchId);
    if (!batch) {
      return fail(HISTORY_ERRORS.INVALID_FILTER, `Batch "${batchId}" not found`);
    }

    const recRes = await getAttendanceByBatch(batchId, { from: date, to: date });
    if (!recRes.success) {
      return fail(HISTORY_ERRORS.LOAD_FAILED, 'Failed to load attendance records');
    }

    const records      = recRes.data ?? [];
    const sessions     = _buildSessions(records, batch, threshold);
    const session      = sessions.find((s) => s.date === date);

    if (!session) {
      return fail(HISTORY_ERRORS.INVALID_FILTER, 'No attendance found for this date');
    }

    // Enrich with per-student records
    const enrichedRecords = records.map((r) => ({
      ...r,
      markedByName: _resolveMarkedBy(r.markedBy),
    }));

    return ok({ ...session, records: enrichedRecords });
  });
};
