/**
 * analyticsExportService.js
 * Module 8.4 — Analytics Export & Final Polish
 *
 * Responsibilities:
 *  - Generate CSV exports for all analytics data types:
 *    trend data, batch comparison, student risk.
 *  - Safe UTF-8 CSV with escaped commas, quotes, and newlines.
 *  - Standardized filename: analytics_<type>_<YYYY-MM-DD>.csv
 *  - Trigger browser download.
 *
 * Architecture rules:
 *  - No JSX / React — pure async service.
 *  - Delegates CSV primitives to @utils/exportUtils (no duplication).
 *  - Delegates data fetching to analyticsInsightsService.
 *  - Returns standard { success, data, meta, error } shapes.
 *  - All date handling uses dateUtils.
 *
 * Blueprint Section 4.8, 8.4
 */

import {
  getAttendanceTrendData,
  getBatchComparisonData,
  getStudentRiskSummary,
} from '@services/analyticsInsightsService';
import {
  generateCSVString,
  downloadCSV,
} from '@utils/exportUtils';
import { ok, fail, tryCatch } from '@utils/serviceResponse';
import { getToday }           from '@utils/dateUtils';

// ── Error codes ───────────────────────────────────────────────────────────────

export const ANALYTICS_EXPORT_ERRORS = Object.freeze({
  NO_DATA:       'ANALYTICS_EXPORT_NO_DATA',
  GENERATE_FAIL: 'ANALYTICS_EXPORT_GENERATE_FAIL',
  DOWNLOAD_FAIL: 'ANALYTICS_EXPORT_DOWNLOAD_FAIL',
  FETCH_FAIL:    'ANALYTICS_EXPORT_FETCH_FAIL',
  UNEXPECTED:    'ANALYTICS_EXPORT_UNEXPECTED',
});

// ── Filename builder ──────────────────────────────────────────────────────────

/**
 * Builds a standardised filename: analytics_<type>_<YYYY-MM-DD>.csv
 * Special chars stripped; spaces replaced by hyphens; lowercased.
 *
 * @param {'trend'|'batch'|'risk'|string} type
 * @returns {string}  e.g. "analytics_trend_2026-06-24"
 */
export const buildAnalyticsFilename = (type = 'analytics') => {
  const safeType = String(type)
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  return `analytics_${safeType}_${getToday()}`;
};

// ── Column definitions ────────────────────────────────────────────────────────

/**
 * Trend data CSV columns.
 * Matches the row shape returned by getAttendanceTrendData().
 */
export const TREND_EXPORT_COLUMNS = [
  { key: 'date',        label: 'Date' },
  { key: 'displayDate', label: 'Display Date' },
  {
    key:    'rate',
    label:  'Attendance Rate (%)',
    format: (v) => (typeof v === 'number' ? v.toFixed(1) : '0.0'),
  },
  {
    key:    'trend',
    label:  'Trend Direction',
    format: (v) => v ?? 'flat',
  },
  {
    key:    'highPoint',
    label:  'High Point',
    format: (v) => (v ? 'Yes' : 'No'),
  },
  {
    key:    'lowPoint',
    label:  'Low Point',
    format: (v) => (v ? 'Yes' : 'No'),
  },
];

/**
 * Batch comparison CSV columns.
 * Matches the row shape returned by getBatchComparisonData().
 */
export const BATCH_COMPARISON_EXPORT_COLUMNS = [
  { key: 'rank',       label: 'Rank' },
  { key: 'batchName',  label: 'Batch Name' },
  {
    key:    'averageRate',
    label:  'Average Attendance (%)',
    format: (v) => (typeof v === 'number' ? v.toFixed(1) : '0.0'),
  },
  { key: 'risk',       label: 'Risk Level' },
  {
    key:    'isTop',
    label:  'Top Performer',
    format: (v) => (v ? 'Yes' : 'No'),
  },
  {
    key:    'isBottom',
    label:  'Needs Attention',
    format: (v) => (v ? 'Yes' : 'No'),
  },
];

/**
 * Student risk CSV columns.
 * Flattened from the grouped risk summary shape.
 */
export const RISK_EXPORT_COLUMNS = [
  { key: 'studentName',  label: 'Student Name' },
  { key: 'studentCode',  label: 'Student ID' },
  { key: 'batchName',    label: 'Batch Name' },
  {
    key:    'percentage',
    label:  'Attendance (%)',
    format: (v) => (typeof v === 'number' ? v.toFixed(1) : '0.0'),
  },
  { key: 'riskLevel',    label: 'Risk Level' },
  { key: 'riskLabel',    label: 'Risk Status' },
];

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Flattens the grouped risk summary into a flat array of student rows
 * suitable for CSV export.
 *
 * @param {object} riskSummary  — { groups: [{label, riskLevel, students: [...]}] }
 * @returns {Array<object>}
 */
const flattenRiskGroups = (riskSummary) => {
  if (!riskSummary?.groups || !Array.isArray(riskSummary.groups)) return [];

  const rows = [];
  for (const group of riskSummary.groups) {
    const { label: riskLabel = '', riskLevel = '', students = [] } = group;
    for (const student of students) {
      rows.push({
        studentName: student.studentName ?? student.name ?? '',
        studentCode: student.studentCode ?? '',
        batchName:   student.batchName   ?? '',
        percentage:  student.percentage  ?? student.attendancePercentage ?? 0,
        riskLevel,
        riskLabel,
      });
    }
  }
  return rows;
};

// ── Public export methods ─────────────────────────────────────────────────────

/**
 * exportTrendCSV()
 *
 * Fetches trend data (optionally filtered by batchId / date range)
 * and exports it as a CSV download.
 *
 * @param {object} [options]
 * @param {string|null} [options.batchId]
 * @param {string|null} [options.from]
 * @param {string|null} [options.to]
 * @returns {Promise<ServiceResponse>}
 */
export const exportTrendCSV = async (options = {}) =>
  tryCatch(async () => {
    const { batchId = null, from = null, to = null } = options;

    const result = await getAttendanceTrendData({ batchId, from, to });
    if (!result.success) {
      return fail(
        ANALYTICS_EXPORT_ERRORS.FETCH_FAIL,
        result.error?.message ?? 'Failed to load trend data for export'
      );
    }

    const rows = result.data ?? [];
    if (rows.length === 0) {
      return fail(
        ANALYTICS_EXPORT_ERRORS.NO_DATA,
        'No trend data available to export for the selected filters.'
      );
    }

    const csvContent = generateCSVString(TREND_EXPORT_COLUMNS, rows);
    const filename   = buildAnalyticsFilename('trend');
    downloadCSV(filename, csvContent);

    return ok(
      { filename: `${filename}.csv`, rowCount: rows.length },
      { type: 'trend', exportedAt: new Date().toISOString() }
    );
  });

/**
 * exportBatchCSV()
 *
 * Fetches batch comparison data (optionally filtered by batchId)
 * and exports it as a CSV download.
 *
 * @param {object} [options]
 * @param {string|null} [options.batchId]
 * @returns {Promise<ServiceResponse>}
 */
export const exportBatchCSV = async (options = {}) =>
  tryCatch(async () => {
    const { batchId = null } = options;

    const result = await getBatchComparisonData({ batchId });
    if (!result.success) {
      return fail(
        ANALYTICS_EXPORT_ERRORS.FETCH_FAIL,
        result.error?.message ?? 'Failed to load batch comparison data for export'
      );
    }

    const rows = result.data ?? [];
    if (rows.length === 0) {
      return fail(
        ANALYTICS_EXPORT_ERRORS.NO_DATA,
        'No batch comparison data available to export.'
      );
    }

    const csvContent = generateCSVString(BATCH_COMPARISON_EXPORT_COLUMNS, rows);
    const filename   = buildAnalyticsFilename('batch');
    downloadCSV(filename, csvContent);

    return ok(
      { filename: `${filename}.csv`, rowCount: rows.length },
      { type: 'batch', exportedAt: new Date().toISOString() }
    );
  });

/**
 * exportRiskCSV()
 *
 * Fetches student risk summary (optionally filtered by batchId / threshold)
 * and exports it as a CSV download.
 *
 * @param {object} [options]
 * @param {string|null} [options.batchId]
 * @param {number}      [options.threshold=75]
 * @returns {Promise<ServiceResponse>}
 */
export const exportRiskCSV = async (options = {}) =>
  tryCatch(async () => {
    const { batchId = null, threshold = 75 } = options;

    const result = await getStudentRiskSummary({ batchId, threshold });
    if (!result.success) {
      return fail(
        ANALYTICS_EXPORT_ERRORS.FETCH_FAIL,
        result.error?.message ?? 'Failed to load risk data for export'
      );
    }

    const rows = flattenRiskGroups(result.data);
    if (rows.length === 0) {
      return fail(
        ANALYTICS_EXPORT_ERRORS.NO_DATA,
        'No student risk data available to export.'
      );
    }

    const csvContent = generateCSVString(RISK_EXPORT_COLUMNS, rows);
    const filename   = buildAnalyticsFilename('risk');
    downloadCSV(filename, csvContent);

    return ok(
      { filename: `${filename}.csv`, rowCount: rows.length },
      { type: 'risk', exportedAt: new Date().toISOString() }
    );
  });

/**
 * generateCSV()
 *
 * Universal CSV generator for an arbitrary data type.
 * Dispatches to the correct typed exporter based on `type`.
 *
 * @param {'trend'|'batch'|'risk'} type
 * @param {object}                 [options]  — forwarded to typed exporter
 * @returns {Promise<ServiceResponse>}
 */
export const generateCSV = async (type, options = {}) => {
  switch (type) {
    case 'trend': return exportTrendCSV(options);
    case 'batch': return exportBatchCSV(options);
    case 'risk':  return exportRiskCSV(options);
    default:
      return fail(
        ANALYTICS_EXPORT_ERRORS.UNEXPECTED,
        `Unknown analytics export type: "${type}"`
      );
  }
};
