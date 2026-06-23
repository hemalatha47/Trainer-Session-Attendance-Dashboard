/**
 * StudentBulkActionToolbar.jsx
 * Module 5.7 — Bulk Action Toolbar for Student List.
 *
 * Shows only when selectedStudentIds.length > 0.
 * Provides: Export Selected, Transfer Batch, Deactivate, Delete.
 *
 * Props:
 *   selectedCount    {number}    — number of selected students
 *   onExport         {function}  — trigger CSV export for selected
 *   onTransfer       {function}  — open batch transfer modal
 *   onDeactivate     {function}  — trigger deactivate flow
 *   onDelete         {function}  — trigger delete confirmation
 *   onClear          {function}  — clear all selections
 *   loading          {boolean}   — disables actions during async ops
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  ArrowRightLeft,
  UserX,
  Trash2,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { cn } from '@utils/componentUtils';

const StudentBulkActionToolbar = ({
  selectedCount = 0,
  onExport,
  onTransfer,
  onDeactivate,
  onDelete,
  onClear,
  loading = false,
}) => {
  const visible = selectedCount > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="bulk-toolbar"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className={cn(
            'flex flex-col sm:flex-row sm:items-center gap-3',
            'bg-accent-50 border border-accent-200 rounded-lg px-4 py-3',
            'shadow-sm'
          )}
          role="toolbar"
          aria-label="Bulk student actions"
        >
          {/* Selection count + clear */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent-600 text-white text-xs font-bold select-none shrink-0">
              {selectedCount}
            </span>
            <span className="text-sm font-medium text-accent-800 truncate">
              {selectedCount === 1 ? '1 student selected' : `${selectedCount} students selected`}
            </span>
            <button
              onClick={onClear}
              disabled={loading}
              aria-label="Clear selection"
              className="ml-1 p-0.5 rounded text-accent-600 hover:text-accent-800 hover:bg-accent-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              iconLeft={<Download className="w-3.5 h-3.5" aria-hidden="true" />}
              onClick={onExport}
              disabled={loading}
              aria-label="Export selected students as CSV"
            >
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              iconLeft={<ArrowRightLeft className="w-3.5 h-3.5" aria-hidden="true" />}
              onClick={onTransfer}
              disabled={loading}
              aria-label="Transfer selected students to another batch"
            >
              Transfer
            </Button>

            <Button
              variant="ghost"
              size="sm"
              iconLeft={<UserX className="w-3.5 h-3.5" aria-hidden="true" />}
              onClick={onDeactivate}
              disabled={loading}
              className="text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              aria-label="Deactivate selected students"
            >
              Deactivate
            </Button>

            <Button
              variant="ghost"
              size="sm"
              iconLeft={<Trash2 className="w-3.5 h-3.5" aria-hidden="true" />}
              onClick={onDelete}
              disabled={loading}
              className="text-danger-DEFAULT hover:bg-red-50 hover:text-red-700"
              aria-label="Delete selected students"
            >
              Delete
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

StudentBulkActionToolbar.displayName = 'StudentBulkActionToolbar';
export default StudentBulkActionToolbar;
