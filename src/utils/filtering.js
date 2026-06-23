/**
 * filtering.js
 * Reusable, stateless data filtering utility.
 * Module: B3.4
 *
 * Supports status, batch, date, numeric range, and custom predicate filtering.
 * All functions are composable — chain multiple filters using filterDataMulti.
 */

import { isValidDateString } from '@utils/dateUtils';

// ── Single-field filters ──────────────────────────────────────────────────────

/**
 * Filters an array by a single field's equality to a value.
 * Case-insensitive string comparison.
 *
 * @template T
 * @param {T[]}    items
 * @param {string} field
 * @param {any}    value   - Pass null/undefined/''/[] to return all items unfiltered
 * @returns {T[]}
 *
 * @example
 *   filterByField(batches, 'status', 'active')
 *   filterByField(students, 'batchId', 'b4')
 */
export const filterByField = (items, field, value) => {
  if (!Array.isArray(items)) return [];
  if (value === null || value === undefined || value === '') return [...items];

  const target = typeof value === 'string' ? value.toLowerCase() : value;

  return items.filter((item) => {
    const fieldVal = item?.[field];
    if (fieldVal === null || fieldVal === undefined) return false;
    const normalized = typeof fieldVal === 'string' ? fieldVal.toLowerCase() : fieldVal;
    return normalized === target;
  });
};

/**
 * Filters an array by a field matching any of the provided values.
 *
 * @template T
 * @param {T[]}    items
 * @param {string} field
 * @param {any[]}  values   - Empty array returns all items unfiltered
 * @returns {T[]}
 *
 * @example
 *   filterByValues(batches, 'status', ['active', 'upcoming'])
 */
export const filterByValues = (items, field, values) => {
  if (!Array.isArray(items)) return [];
  if (!Array.isArray(values) || values.length === 0) return [...items];

  const targets = values.map((v) =>
    typeof v === 'string' ? v.toLowerCase() : v
  );

  return items.filter((item) => {
    const fieldVal = item?.[field];
    if (fieldVal === null || fieldVal === undefined) return false;
    const normalized = typeof fieldVal === 'string' ? fieldVal.toLowerCase() : fieldVal;
    return targets.includes(normalized);
  });
};

// ── Date range filter ─────────────────────────────────────────────────────────

/**
 * Filters an array by a date field within an inclusive [from, to] range.
 * Both bounds are optional — omit from/to to leave that bound open.
 *
 * @template T
 * @param {T[]}    items
 * @param {string} dateField     - Object key holding the YYYY-MM-DD date
 * @param {string} [from]        - YYYY-MM-DD, inclusive lower bound
 * @param {string} [to]          - YYYY-MM-DD, inclusive upper bound
 * @returns {T[]}
 *
 * @example
 *   filterByDateRange(records, 'date', '2026-04-01', '2026-04-30')
 */
export const filterByDateRange = (items, dateField, from, to) => {
  if (!Array.isArray(items)) return [];

  const hasFrom = from && isValidDateString(from);
  const hasTo   = to   && isValidDateString(to);

  if (!hasFrom && !hasTo) return [...items];

  return items.filter((item) => {
    const d = item?.[dateField];
    if (!d || typeof d !== 'string') return false;
    if (hasFrom && d < from) return false;
    if (hasTo   && d > to)   return false;
    return true;
  });
};

// ── Numeric range filter ──────────────────────────────────────────────────────

/**
 * Filters an array by a numeric field within an inclusive [min, max] range.
 *
 * @template T
 * @param {T[]}    items
 * @param {string} field
 * @param {number} [min]    - Inclusive lower bound (omit for no lower bound)
 * @param {number} [max]    - Inclusive upper bound (omit for no upper bound)
 * @returns {T[]}
 *
 * @example
 *   filterByNumericRange(studentSummaries, 'percentage', 50, 74)  // 50–74% range
 */
export const filterByNumericRange = (items, field, min, max) => {
  if (!Array.isArray(items)) return [];

  const hasMin = typeof min === 'number' && !isNaN(min);
  const hasMax = typeof max === 'number' && !isNaN(max);

  if (!hasMin && !hasMax) return [...items];

  return items.filter((item) => {
    const v = Number(item?.[field]);
    if (isNaN(v)) return false;
    if (hasMin && v < min) return false;
    if (hasMax && v > max) return false;
    return true;
  });
};

// ── Boolean / active filter ───────────────────────────────────────────────────

/**
 * Filters an array to only items where a boolean field matches the target.
 *
 * @template T
 * @param {T[]}    items
 * @param {string} field
 * @param {boolean} value
 * @returns {T[]}
 *
 * @example
 *   filterByBoolean(students, 'isActive', true)
 */
export const filterByBoolean = (items, field, value) => {
  if (!Array.isArray(items)) return [];
  if (value === null || value === undefined) return [...items];
  return items.filter((item) => Boolean(item?.[field]) === Boolean(value));
};

// ── Custom predicate filter ───────────────────────────────────────────────────

/**
 * Filters an array using a custom predicate function.
 *
 * @template T
 * @param {T[]}                items
 * @param {(item: T) => boolean} predicate
 * @returns {T[]}
 */
export const filterByPredicate = (items, predicate) => {
  if (!Array.isArray(items)) return [];
  if (typeof predicate !== 'function') return [...items];
  return items.filter(predicate);
};

// ── Compose multiple filters ──────────────────────────────────────────────────

/**
 * Applies multiple filter functions in sequence.
 * Each filter must be a function that accepts (items) and returns filtered items.
 * Compose with arrow functions calling the individual filter helpers.
 *
 * @template T
 * @param {T[]}                  items
 * @param {((items: T[]) => T[])[]} filters   - Array of filter functions
 * @returns {T[]}
 *
 * @example
 *   const results = filterDataMulti(students, [
 *     (items) => filterByField(items, 'batchId', selectedBatch),
 *     (items) => filterByBoolean(items, 'isActive', true),
 *     (items) => filterByNumericRange(items, 'percentage', 0, 74),
 *   ]);
 */
export const filterDataMulti = (items, filters) => {
  if (!Array.isArray(items)) return [];
  if (!Array.isArray(filters) || filters.length === 0) return [...items];

  return filters.reduce(
    (current, filterFn) =>
      typeof filterFn === 'function' ? filterFn(current) : current,
    [...items]
  );
};

// ── Attendance-specific filters ───────────────────────────────────────────────

/**
 * Filters students by attendance percentage threshold category.
 * Used by Student List page filter bar (Section 4.7).
 *
 * @template T
 * @param {T[]}    items         - Student summary objects with a `percentage` field
 * @param {'all'|'above'|'below'|'warning'} category
 * @param {number} [threshold=75]
 * @returns {T[]}
 */
export const filterByAttendanceCategory = (items, category, threshold = 75) => {
  if (!Array.isArray(items) || !category || category === 'all') return [...items];

  return items.filter((item) => {
    const pct = Number(item?.percentage);
    if (isNaN(pct)) return false;

    switch (category) {
      case 'above':   return pct >= threshold;
      case 'below':   return pct < threshold;
      case 'warning': return pct >= 50 && pct < threshold;
      default:        return true;
    }
  });
};


// ── Batch-specific filter utilities (Module 4.4) ──────────────────────────────

/**
 * Filters batches by free-text search across multiple fields.
 *
 * @param {object[]} batches
 * @param {string}   query
 * @param {string[]} [fields]  - defaults to BATCH_SEARCH_FIELDS
 * @returns {object[]}
 */
export const filterBatchesBySearch = (batches, query, fields = ['batchName', 'batchCode', 'trainerName', 'description']) => {
  if (!Array.isArray(batches)) return [];
  if (!query || !query.trim()) return [...batches];
  const q = query.trim().toLowerCase();
  return batches.filter((b) =>
    fields.some((f) => {
      const v = b?.[f];
      return v != null && String(v).toLowerCase().includes(q);
    })
  );
};

/**
 * Filters batches by status value.
 * Passes when value === 'all' or value is falsy.
 *
 * @param {object[]} batches
 * @param {string}   status   - 'all' | batch status enum
 * @returns {object[]}
 */
export const filterBatchesByStatus = (batches, status) => {
  if (!Array.isArray(batches)) return [];
  if (!status || status === 'all') return [...batches];
  return batches.filter((b) => b.status === status);
};

/**
 * Filters batches by trainer name (exact match, case-insensitive).
 *
 * @param {object[]} batches
 * @param {string}   trainer  - 'all' | trainerName string
 * @returns {object[]}
 */
export const filterBatchesByTrainer = (batches, trainer) => {
  if (!Array.isArray(batches)) return [];
  if (!trainer || trainer === 'all') return [...batches];
  const t = trainer.toLowerCase();
  return batches.filter((b) => b.trainerName?.toLowerCase() === t);
};

/**
 * Filters batches by derived course key extracted from batchCode.
 * Course key = second segment of "NM-{COURSE}-{YEAR}-{SEQ}".
 *
 * @param {object[]} batches
 * @param {string}   course   - 'all' | course key (e.g. 'REACT')
 * @returns {object[]}
 */
export const filterBatchesByCourse = (batches, course) => {
  if (!Array.isArray(batches)) return [];
  if (!course || course === 'all') return [...batches];
  const target = course.toUpperCase();
  return batches.filter((b) => {
    const parts = (b.batchCode ?? '').split('-');
    return parts.length >= 2 && parts[1].toUpperCase() === target;
  });
};

/**
 * Filters batches by student capacity range (uses maxStudents field).
 * Empty string bounds are treated as open (no limit).
 *
 * @param {object[]} batches
 * @param {string|number} min   - inclusive lower bound or ''
 * @param {string|number} max   - inclusive upper bound or ''
 * @returns {object[]}
 */
export const filterBatchesByCapacity = (batches, min, max) => {
  if (!Array.isArray(batches)) return [];
  const hasMin = min !== '' && min != null && !isNaN(Number(min));
  const hasMax = max !== '' && max != null && !isNaN(Number(max));
  if (!hasMin && !hasMax) return [...batches];

  const nMin = hasMin ? Number(min) : -Infinity;
  const nMax = hasMax ? Number(max) : Infinity;

  return batches.filter((b) => {
    const cap = Number(b.maxStudents);
    if (isNaN(cap)) return false;
    return cap >= nMin && cap <= nMax;
  });
};

/**
 * Filters batches by start/end date overlap with a supplied range.
 * Passes batches whose [startDate, endDate] overlaps [from, to].
 * Open-ended: omit from/to to leave that bound unrestricted.
 *
 * @param {object[]} batches
 * @param {string}   from    - YYYY-MM-DD or ''
 * @param {string}   to      - YYYY-MM-DD or ''
 * @returns {object[]}
 */
export const filterBatchesByDateRange = (batches, from, to) => {
  if (!Array.isArray(batches)) return [];
  const hasFrom = !!from;
  const hasTo   = !!to;
  if (!hasFrom && !hasTo) return [...batches];

  return batches.filter((b) => {
    const start = b.startDate ?? '';
    const end   = b.endDate   ?? '';
    // Batch overlaps the range if: batch.start <= to AND batch.end >= from
    if (hasTo   && start > to)   return false;
    if (hasFrom && end   < from) return false;
    return true;
  });
};

/**
 * Composes all batch-specific filter functions into a single pipeline.
 * Only active (non-default) filters are applied; inactive ones pass-through.
 *
 * @param {object[]} batches     - raw batch array
 * @param {object}   filters     - filter state matching DEFAULT_BATCH_FILTERS shape
 * @returns {object[]}
 */
export const applyBatchFilters = (batches, filters) => {
  if (!Array.isArray(batches) || !filters) return batches ?? [];

  return filterDataMulti(batches, [
    (items) => filterBatchesBySearch(items, filters.search),
    (items) => filterBatchesByStatus(items, filters.status),
    (items) => filterBatchesByTrainer(items, filters.trainer),
    (items) => filterBatchesByCourse(items, filters.course),
    (items) => filterBatchesByCapacity(items, filters.capacityMin, filters.capacityMax),
    (items) => filterBatchesByDateRange(items, filters.startDate, filters.endDate),
    (items) => filters.activeOnly
      ? items.filter((b) => b.status === 'active')
      : items,
  ]);
};


// ── Student-specific filter utilities (Module 5.4) ────────────────────────────

/**
 * Filters students by free-text search across ID, name, email, and phone.
 *
 * @param {object[]} students
 * @param {string}   query
 * @returns {object[]}
 */
export const filterStudentsBySearch = (students, query) => {
  if (!Array.isArray(students)) return [];
  if (!query || !query.trim()) return [...students];
  const q = query.trim().toLowerCase();
  return students.filter((s) => {
    const fullName = `${s.firstName ?? ''} ${s.lastName ?? ''}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (s.studentCode?.toLowerCase().includes(q)) ||
      (s.email?.toLowerCase().includes(q)) ||
      (s.phone?.includes(q))
    );
  });
};

/**
 * Filters students by batchId.
 *
 * @param {object[]} students
 * @param {string}   batchId  — 'all' or specific batchId
 * @returns {object[]}
 */
export const filterStudentsByBatch = (students, batchId) => {
  if (!Array.isArray(students)) return [];
  if (!batchId || batchId === 'all') return [...students];
  return students.filter((s) => s.batchId === batchId);
};

/**
 * Filters students by status ('active' | 'inactive').
 *
 * @param {object[]} students
 * @param {string}   status  — 'all' | 'active' | 'inactive'
 * @returns {object[]}
 */
export const filterStudentsByStatus = (students, status) => {
  if (!Array.isArray(students)) return [];
  if (!status || status === 'all') return [...students];
  return students.filter((s) => s.status === status);
};

/**
 * Filters students by attendance percentage range.
 * Uses the ATTENDANCE_RANGE_OPTIONS min/max bounds.
 *
 * @param {object[]}    students
 * @param {string}      rangeKey  — 'all' | range key from ATTENDANCE_RANGE_OPTIONS
 * @param {object[]}    rangeOptions  — ATTENDANCE_RANGE_OPTIONS array
 * @returns {object[]}
 */
export const filterStudentsByAttendance = (students, rangeKey, rangeOptions) => {
  if (!Array.isArray(students)) return [];
  if (!rangeKey || rangeKey === 'all') return [...students];

  const range = rangeOptions?.find((r) => r.value === rangeKey);
  if (!range) return [...students];

  const { min, max } = range;
  return students.filter((s) => {
    const pct = Number(s.attendancePercentage);
    if (isNaN(pct)) return false;
    if (min !== null && pct < min) return false;
    if (max !== null && pct > max) return false;
    return true;
  });
};

/**
 * Filters students by risk level (derived from attendancePercentage).
 *
 * @param {object[]} students
 * @param {string}   riskLevel  — 'all' | RISK_LEVELS key
 * @param {Function} getRiskKey — getRiskLevelKey from riskUtils (injected to avoid circular)
 * @returns {object[]}
 */
export const filterStudentsByRisk = (students, riskLevel, getRiskKey) => {
  if (!Array.isArray(students)) return [];
  if (!riskLevel || riskLevel === 'all') return [...students];
  if (typeof getRiskKey !== 'function') return [...students];
  return students.filter((s) => getRiskKey(s.attendancePercentage) === riskLevel);
};

/**
 * Filters students by enrollment date within an inclusive [from, to] range.
 * Uses the enrollmentDate field (YYYY-MM-DD).
 *
 * @param {object[]} students
 * @param {string}   from   — YYYY-MM-DD or ''
 * @param {string}   to     — YYYY-MM-DD or ''
 * @returns {object[]}
 */
export const filterStudentsByJoinedDate = (students, from, to) => {
  if (!Array.isArray(students)) return [];
  const hasFrom = !!from;
  const hasTo   = !!to;
  if (!hasFrom && !hasTo) return [...students];

  return students.filter((s) => {
    const d = s.enrollmentDate ?? '';
    if (!d) return false;
    if (hasFrom && d < from) return false;
    if (hasTo   && d > to)   return false;
    return true;
  });
};

/**
 * Composes all student-specific filter functions into a single pipeline.
 * Only active (non-default) filters are applied; inactive ones pass-through.
 *
 * @param {object[]} students   — raw student array
 * @param {object}   filters    — filter state matching DEFAULT_STUDENT_FILTERS shape
 * @param {object}   deps       — { rangeOptions, getRiskKey }
 * @returns {object[]}
 */
export const applyStudentFilters = (students, filters, deps = {}) => {
  if (!Array.isArray(students) || !filters) return students ?? [];
  const { rangeOptions = [], getRiskKey } = deps;

  return filterDataMulti(students, [
    (items) => filterStudentsBySearch(items, filters.search),
    (items) => filterStudentsByBatch(items, filters.batch),
    (items) => filterStudentsByStatus(items, filters.status),
    (items) => filterStudentsByAttendance(items, filters.attendanceRange, rangeOptions),
    (items) => filterStudentsByRisk(items, filters.riskLevel, getRiskKey),
    (items) => filterStudentsByJoinedDate(items, filters.joinedFrom, filters.joinedTo),
  ]);
};
