/**
 * AvatarSystem.jsx
 * Business-aware avatar wrappers (Module 3.4, Task 3/8).
 *
 * DOES NOT rebuild Avatar — composes the existing Module 3.2 Avatar component.
 *
 * Exports:
 *   UserAvatar        — trainer/manager with name + role subtitle
 *   InitialAvatar     — initials-only display (alias with explicit intent)
 *   AttendanceAvatar  — student avatar with attendance status dot
 *
 * AvatarGroup is re-exported from Module 3.2 — no rebuild needed.
 */

import { Avatar, AvatarGroup } from '@components/ui/Avatar';
import { StatusBadge } from '../StatusBadge';
import { cn } from '@utils/componentUtils';

// ── UserAvatar ────────────────────────────────────────────────────────────────

/**
 * Trainer / manager avatar with stacked name + role text.
 *
 * @param {object}  props
 * @param {string}  props.name
 * @param {string}  [props.role]       — e.g. "Training Manager"
 * @param {string}  [props.src]        — image URL
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {'online'|'offline'|'away'|'busy'} [props.status]
 * @param {string}  [props.className]
 */
const UserAvatar = ({ name, role, src, size = 'md', status, className }) => (
  <div className={cn('flex items-center gap-2.5', className)}>
    <Avatar name={name} src={src} size={size} status={status} />
    <div className="flex flex-col min-w-0">
      <span className="text-sm font-medium text-textPrimary leading-snug truncate">{name}</span>
      {role && (
        <span className="text-xs text-textMuted leading-snug truncate">{role}</span>
      )}
    </div>
  </div>
);

UserAvatar.displayName = 'UserAvatar';

// ── InitialAvatar ─────────────────────────────────────────────────────────────

/**
 * Explicit initials-only avatar — no image fallback intended.
 * Thin alias to make intent clear in code that always wants initials.
 *
 * @param {object}  props — same as Avatar, src intentionally omitted
 */
const InitialAvatar = ({ name, size = 'md', status, className }) => (
  <Avatar name={name} size={size} status={status} className={className} />
);

InitialAvatar.displayName = 'InitialAvatar';

// ── AttendanceAvatar ──────────────────────────────────────────────────────────

/**
 * Student avatar with attendance StatusBadge below.
 *
 * @param {object}  props
 * @param {string}  props.name
 * @param {string}  [props.src]
 * @param {'present'|'absent'|'late'|'leave'} [props.attendanceStatus]
 * @param {'sm'|'md'} [props.size='sm']
 * @param {string}  [props.className]
 */
const AttendanceAvatar = ({ name, src, attendanceStatus, size = 'sm', className }) => (
  <div className={cn('flex flex-col items-center gap-1', className)}>
    <Avatar name={name} src={src} size={size} />
    {attendanceStatus && (
      <StatusBadge type="attendance" status={attendanceStatus} size="sm" dot={false} />
    )}
  </div>
);

AttendanceAvatar.displayName = 'AttendanceAvatar';

// Re-export AvatarGroup directly from Module 3.2
export { AvatarGroup } from '@components/ui/Avatar';
export { UserAvatar, InitialAvatar, AttendanceAvatar };
export default UserAvatar;
