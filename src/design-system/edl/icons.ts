/**
 * Phase 22.0B — EDL Canonical Iconography Tokens
 *
 * Lucide icons ONLY. 20px default. Consistent stroke width.
 * No custom SVGs in component code — icons come from Lucide or @lucide/lab.
 */

import type { LucideIcon } from "lucide-react";

// ── Icon Sizes ───────────────────────────────────────────────────────────────

export const ICON_SIZE = {
  /** 16px — tight spaces, badges, tags */
  xs: 16,
  /** 20px — default for all UI controls */
  sm: 20,
  /** 24px — standalone icons, nav items */
  md: 24,
  /** 32px — feature tiles, hero icons */
  lg: 32,
  /** 48px — onboarding, empty states */
  xl: 48,
} as const;

// ── Stroke Width ─────────────────────────────────────────────────────────────

export const ICON_STROKE = {
  /** Thin — decorative only */
  thin: 1,
  /** Default — all interactive icons */
  default: 1.5,
  /** Bold — emphasis, key indicators */
  bold: 2,
} as const;

// ── Icon Colors ──────────────────────────────────────────────────────────────
// Icons inherit their parent text color by default.
// These are explicit overrides for semantic meaning.

export const ICON_COLOR = {
  default: "currentColor",
  gold: "#d4af37",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  muted: "#71717a",
} as const;

// ── Icon Map (Feature Icons) ─────────────────────────────────────────────────
// These are the primary icons used in navigation, feature tiles, and dashboards.
// When adding a new feature, pick from this list first.

export const FEATURE_ICONS = {
  // Core modules
  dashboard: "LayoutDashboard",
  analytics: "BarChart3",
  settings: "Settings",
  users: "Users",
  company: "Building2",

  // Financial
  ledger: "BookOpen",
  transactions: "ArrowLeftRight",
  wallet: "Wallet",
  invoice: "FileText",
  payment: "CreditCard",
  treasury: "Landmark",
  bank: "Building",

  // Workflow
  approval: "CheckCircle",
  workflow: "GitBranch",
  automation: "Zap",
  scheduler: "Clock",
  template: "LayoutTemplate",

  // AI & Intelligence
  ai: "Brain",
  intelligence: "Sparkles",
  insight: "Lightbulb",

  // Operations
  connector: "Plug",
  health: "Heart",
  monitoring: "Activity",
  alerts: "Bell",

  // Governance
  compliance: "Shield",
  audit: "ScrollText",
  policy: "BookMarked",
  risk: "AlertTriangle",

  // Identity
  role: "UserCog",
  permission: "Key",
  group: "Users",
  sso: "Fingerprint",

  // AP/Procurement
  vendor: "Truck",
  purchaseOrder: "ShoppingCart",
  credit: "RefreshCw",
  reconciliation: "Scale",

  // CRM
  contact: "Contact",
  deal: "Target",
  opportunity: "TrendingUp",

  // Reports
  report: "FileBarChart",
  export: "Download",
  calendar: "Calendar",

  // System
  system: "Server",
  database: "Database",
  deployment: "Rocket",
  security: "Shield",
} as const;

// ── Icon Component Props ─────────────────────────────────────────────────────

export interface IconProps {
  /** Icon size in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** CSS color */
  color?: string;
  /** Accessible label — REQUIRED for interactive icons */
  "aria-label"?: string;
  /** Optional class name */
  className?: string;
}
