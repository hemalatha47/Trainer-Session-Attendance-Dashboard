/**
 * exportUtils.js
 * Browser-compatible CSV export utilities for the Reports module.
 * Blueprint Section 4.8, 15.2 — CSV only in V1.
 *
 * Scope:
 *  - CSV generation from column + row definitions
 *  - Browser download trigger via Blob + <a> tag
 *
 * Out of scope (future — Section 14):
 *  - PDF export (jsPDF / react-pdf)
 *  - Excel export (SheetJS / xlsx)
 */

import { getToday } from './dateUtils';

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Escapes a cell value for CSV:
 *  - Wraps in double-quotes if it contains commas, quotes, or newlines.
 *  - Escapes any internal double-quote characters by doubling them.
 * @param {*} value
 * @returns {string}
 */
const escapeCSVCell = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// ── Core CSV functions ────────────────────────────────────────────────────────

/**
 * Converts column definitions and data rows into a CSV string.
 *
 * @param {Array<{key: string, label: string, format?: (value: any, row: any) => string}>} columns
 *   Column definitions. Each column must have a `key` (field accessor) and `label` (header).
 *   Optionally provide a `format` function for custom cell rendering.
 *
 * @param {Array<Record<string, any>>} rows
 *   Array of data objects. Each row is accessed by column `key`.
 *
 * @returns {string}  Complete CSV string including header row and all data rows.
 */
export const generateCSVString = (columns, rows) => {
  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error('generateCSVString: columns must be a non-empty array');
  }
  if (!Array.isArray(rows)) {
    throw new Error('generateCSVString: rows must be an array');
  }

  // Header row
  const header = columns.map((col) => escapeCSVCell(col.label)).join(',');

  // Data rows
  const dataRows = rows.map((row) =>
    columns
      .map((col) => {
        const rawValue = row[col.key];
        const formatted = typeof col.format === 'function'
          ? col.format(rawValue, row)
          : rawValue;
        return escapeCSVCell(formatted);
      })
      .join(',')
  );

  return [header, ...dataRows].join('\r\n');
};

/**
 * Triggers a browser download of the given CSV content.
 * Creates a temporary <a> element, sets a Blob URL, and clicks it.
 *
 * @param {string} filename   Desired filename WITHOUT the .csv extension.
 * @param {string} csvContent CSV string to download (from generateCSVString).
 * @returns {void}
 */
export const downloadCSV = (filename, csvContent) => {
  if (typeof csvContent !== 'string') {
    throw new Error('downloadCSV: csvContent must be a string');
  }
  if (!filename || typeof filename !== 'string') {
    throw new Error('downloadCSV: filename must be a non-empty string');
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Convenience function that generates and immediately downloads a CSV file.
 * Combines generateCSVString + downloadCSV into a single call.
 *
 * @param {string}   filename  Filename WITHOUT the .csv extension.
 * @param {Array}    columns   Column definitions (see generateCSVString).
 * @param {Array}    rows      Data rows (see generateCSVString).
 * @returns {void}
 */
export const exportToCSV = (filename, columns, rows) => {
  const csvContent = generateCSVString(columns, rows);
  downloadCSV(filename, csvContent);
};

// ── Report-specific export helpers ────────────────────────────────────────────

/**
 * Generates a timestamped filename for a batch attendance report.
 * Format: `attendance-report-{batchName}-{YYYY-MM-DD}`
 *
 * @param {string} batchName
 * @returns {string}  e.g. "attendance-report-Batch-A-Jan-2026-2026-06-16"
 */
export const buildReportFilename = (batchName) => {
  const safeName = (batchName || 'batch')
    .replace(/[^a-zA-Z0-9\s-]/g, '')   // remove special characters
    .replace(/\s+/g, '-')               // spaces to hyphens
    .toLowerCase();
  return `attendance-report-${safeName}-${getToday()}`;
};

/**
 * Standard column definitions for the attendance report CSV export.
 * Mirrors the table columns defined in Blueprint Section 6.7.
 *
 * @type {Array<{key: string, label: string, format?: Function}>}
 */
export const ATTENDANCE_REPORT_CSV_COLUMNS = [
  { key: 'studentName',   label: 'Student Name'    },
  { key: 'studentCode',   label: 'Student ID'      },
  { key: 'totalSessions', label: 'Total Sessions'  },
  { key: 'presentCount',  label: 'Present'         },
  { key: 'absentCount',   label: 'Absent'          },
  {
    key: 'percentage',
    label: 'Attendance %',
    format: (val) => (typeof val === 'number' ? `${val.toFixed(1)}%` : '0.0%'),
  },
  {
    key: 'statusColor',
    label: 'Status',
    format: (val) => {
      if (val === 'success') return 'Good Standing';
      if (val === 'warning') return 'Warning';
      return 'Low Attendance';
    },
  },
];
