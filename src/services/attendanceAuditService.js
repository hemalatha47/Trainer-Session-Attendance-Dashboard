/**
 * attendanceAuditService.js
 * Audit trail service for all attendance mutations.
 * Module: 6.8 — Task 6
 *
 * RESPONSIBILITIES:
 *  - Log every attendance action (create, update, correct, delete, export).
 *  - Store audit events in an in-memory log (sessionStorage-backed for refresh
 *    persistence in development; migrates to /api/audit in production).
 *  - Provide query methods to retrieve the audit log.
 *  - Compare before/after states for correction events.
 *
 * AUDIT EVENT STRUCTURE:
 *  {
 *    id:         string,      // unique event ID
 *    action:     string,      // AUDIT_ACTIONS.*
 *    entityType: string,      // 'AttendanceRecord' | 'AttendanceSession' | ...
 *    entityId:   string,      // composite key or record ID
 *    userId:     string,      // user who performed the action
 *    userName:   string,      // resolved display name
 *    timestamp:  string,      // ISO datetime
 *    before:     object|null, // state snapshot before mutation
 *    after:      object|null, // state snapshot after mutation
 *    meta:       object,      // additional context (batchId, date, rowCount, etc.)
 *  }
 *
 * ARCHITECTURE RULES:
 *  - No JSX / React.
 *  - Never imports from pages or hooks.
 *  - Returns standard { success, data, meta, error } where applicable.
 *  - logAuditEvent is fire-and-forget safe — it never throws to the caller.
 */

import { mockUsers }          from '@data/mockUsers';
import { ok, fail, tryCatch } from '@utils/serviceResponse';

// ── Action constants ──────────────────────────────────────────────────────────

export const AUDIT_ACTIONS = Object.freeze({
  CREATED:   'CREATED',
  UPDATED:   'UPDATED',
  CORRECTED: 'CORRECTED',
  DELETED:   'DELETED',
  EXPORTED:  'EXPORTED',
});

// ── In-memory audit store ─────────────────────────────────────────────────────

/** @type {AuditEvent[]} */
let _auditLog = [];

// ── Helpers ───────────────────────────────────────────────────────────────────

const _resolveUserName = (userId) => {
  const user = mockUsers.find((u) => u.id === userId);
  return user?.name ?? userId ?? 'Unknown';
};

const _generateEventId = () =>
  `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Log an audit event. Never throws — errors are suppressed to avoid breaking
 * the calling mutation flow. Returns a resolved { success, data } envelope.
 *
 * @param {{
 *   action:      string,          // AUDIT_ACTIONS.*
 *   entityType:  string,          // 'AttendanceRecord' | 'AttendanceSession' | 'AttendanceHistory' | 'BatchAttendance'
 *   entityId:    string,          // Record ID or composite key
 *   userId:      string,          // Performing user
 *   before?:     object | null,   // State before mutation
 *   after?:      object | null,   // State after mutation
 *   meta?:       object,          // Additional metadata
 * }} params
 *
 * @returns {Promise<{ success: boolean, data: AuditEvent | null, error: any }>}
 */
export const logAuditEvent = async ({
  action,
  entityType,
  entityId,
  userId,
  before  = null,
  after   = null,
  meta    = {},
}) => {
  try {
    const event = {
      id:         _generateEventId(),
      action:     action ?? 'UNKNOWN',
      entityType: entityType ?? 'Unknown',
      entityId:   String(entityId ?? ''),
      userId:     userId ?? 'unknown',
      userName:   _resolveUserName(userId),
      timestamp:  new Date().toISOString(),
      before:     before ? { ...before } : null,
      after:      after  ? { ...after  } : null,
      meta:       { ...meta },
    };

    _auditLog.unshift(event); // newest first

    // Keep log size bounded (last 500 events in memory)
    if (_auditLog.length > 500) {
      _auditLog = _auditLog.slice(0, 500);
    }

    return ok(event, { totalEvents: _auditLog.length });
  } catch (err) {
    // Audit log failure must NEVER surface to the user or break the flow
    console.warn('[AuditService] Failed to log event:', err);
    return ok(null);
  }
};

/**
 * Retrieve audit log entries, optionally filtered.
 *
 * @param {{
 *   entityType?: string,
 *   entityId?:   string,
 *   action?:     string,
 *   userId?:     string,
 *   limit?:      number,
 * }} [filters]
 *
 * @returns {Promise<{ success, data: AuditEvent[], meta: { total, filtered }, error }>}
 */
export const getAuditLog = async (filters = {}) => {
  return tryCatch(() => {
    const { entityType, entityId, action, userId, limit = 100 } = filters;

    let events = [..._auditLog];

    if (entityType) events = events.filter((e) => e.entityType === entityType);
    if (entityId)   events = events.filter((e) => e.entityId   === entityId);
    if (action)     events = events.filter((e) => e.action     === action);
    if (userId)     events = events.filter((e) => e.userId     === userId);

    const total    = events.length;
    const filtered = events.slice(0, limit);

    return ok(filtered, { total, filtered: filtered.length });
  });
};

/**
 * Retrieve all audit events for a specific attendance session (batchId + date).
 *
 * @param {string} batchId
 * @param {string} date     YYYY-MM-DD
 * @returns {Promise<{ success, data: AuditEvent[], meta, error }>}
 */
export const getSessionAuditLog = async (batchId, date) => {
  return tryCatch(() => {
    const entityId = `${batchId}::${date}`;
    const events   = _auditLog.filter((e) => e.entityId === entityId || e.meta?.date === date);
    return ok(events, { batchId, date, count: events.length });
  });
};

/**
 * Compare two attendance record states and build a diff summary.
 *
 * @param {object} before
 * @param {object} after
 * @returns {{ changed: boolean, changes: Array<{ field, before, after }> }}
 */
export const diffAttendanceRecord = (before, after) => {
  if (!before || !after) return { changed: true, changes: [] };
  const fields  = ['status', 'remarks', 'markedBy'];
  const changes = [];
  for (const field of fields) {
    if (before[field] !== after[field]) {
      changes.push({ field, before: before[field], after: after[field] });
    }
  }
  return { changed: changes.length > 0, changes };
};

/**
 * Clear the audit log. Development utility only.
 */
export const _clearAuditLog = () => {
  _auditLog = [];
};

/**
 * Get current log size (for diagnostics).
 * @returns {number}
 */
export const getAuditLogSize = () => _auditLog.length;
