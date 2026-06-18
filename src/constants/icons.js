/**
 * icons.js
 * Centralized icon registry (Phase 3, Module 3.1).
 *
 * Single icon library: lucide-react. No other icon library may be
 * imported anywhere in the project — this prevents inconsistent
 * stroke widths/visual styles across components.
 *
 * Components should consume icons via the `ICONS` registry below
 * (semantic name → component), not by importing from 'lucide-react'
 * directly. This allows swapping an icon project-wide by changing
 * one line here.
 *
 * Default sizing/stroke is applied by the future <Icon> wrapper
 * component (Module 3.2) — this file only maps names to components.
 */

import {
  // Navigation
  LayoutDashboard,
  Layers,
  Users,
  ClipboardCheck,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,

  // Actions
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  MoreVertical,

  // Status / feedback
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  CalendarDays,

  // Attendance-specific
  UserCheck,
  UserX,
  CalendarCheck,
  CalendarX,

  // Analytics
  TrendingUp,
  TrendingDown,
  Activity,
  Trophy,

  // Auth
  LogOut,
  LogIn,
  Lock,
  Mail,
  ShieldCheck,

  // Misc
  Bell,
  User,
  Building2,
  FileText,
  Loader2,
} from 'lucide-react';

export const ICONS = {
  // Navigation (Sidebar — Section 7.1)
  dashboard: LayoutDashboard,
  batches: Layers,
  students: Users,
  attendance: ClipboardCheck,
  reports: BarChart3,
  analytics: PieChartIcon,
  settings: Settings,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  menu: Menu,
  close: X,

  // Actions
  add: Plus,
  edit: Pencil,
  delete: Trash2,
  search: Search,
  filter: Filter,
  export: Download,
  import: Upload,
  refresh: RefreshCw,
  save: Save,
  show: Eye,
  hide: EyeOff,
  moreVertical: MoreVertical,

  // Status / feedback (Toast, Badge — Section 7.3)
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  alert: AlertCircle,
  clock: Clock,
  calendar: CalendarDays,

  // Attendance-specific (Section 6.6, 16.2)
  present: UserCheck,
  absent: UserX,
  attendanceMarked: CalendarCheck,
  attendanceMissing: CalendarX,

  // Analytics (Section 6.8)
  trendUp: TrendingUp,
  trendDown: TrendingDown,
  activity: Activity,
  leaderboard: Trophy,

  // Auth (Module 2.4)
  logout: LogOut,
  login: LogIn,
  lock: Lock,
  email: Mail,
  shield: ShieldCheck,

  // Misc / layout
  notification: Bell,
  user: User,
  organization: Building2,
  document: FileText,
  spinner: Loader2,
};

/** Default stroke width used across the app — pass to <Icon strokeWidth>. */
export const ICON_STROKE_WIDTH = 2;

/** Default sizes (px) mapped to common usage contexts. */
export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export default ICONS;
