import {
  Activity, ArrowLeftRight, BarChart3, Bell, BookOpen, BookOpenCheck, Building2,
  Bot, Cable, Calendar, Command, Cpu, Database, FileCheck, FileText,
  GitBranch, Key, Landmark, LayoutDashboard, List, ListTodo, LogOut, MessageSquareText,
  Monitor, RefreshCw, ScrollText, Search, Settings, Shield, ShieldCheck,
  Terminal, AlertTriangle, TrendingUp, UserCircle, Wallet, Globe, PiggyBank, ShieldAlert, Calculator,
  DollarSign, Target, LineChart, Workflow, PieChart, Layers, Users,
  ShoppingCart, Truck, FileSignature, Receipt, CheckSquare, FileSpreadsheet, LineChart as ChartLine,
  Eye, Percent, FolderOpen, ArrowUpDown, ReceiptText, Briefcase, BrainCircuit, Scale, GanttChartSquare, Lightbulb,
  ClipboardList, Wrench, GraduationCap, Brain, ThumbsUp, Phone, HardDrive, Trash2, ArrowRightLeft, Timer,
  Banknote, Droplets, Sun, CreditCard,
  Network, FileSearch, Clock, Package, Lock, CheckCircle,
  SlidersHorizontal, Crown, ListOrdered, Play, Rocket, Share2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  minRole?: string;
  badge?: "pending-approvals";
  disabled?: boolean;
  keywords?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const ALL_NAV: NavItem[] = [
  { href: "/dashboard", label: "Executive Overview", icon: LayoutDashboard },
  { href: "/work-queue", label: "Work Queue", icon: ListTodo, keywords: "work queue tasks pending review" },
  { href: "/command-center", label: "Command Center", icon: Command, minRole: "ADMIN" },
  { href: "/executive/dashboard", label: "Executive Command Center", icon: Crown, permission: "executive.view", minRole: "ADMIN" },
  { href: "/executive/kpis", label: "KPI Explorer", icon: BarChart3, permission: "executive.view", minRole: "ADMIN" },
  { href: "/executive/alerts", label: "Enterprise Alerts", icon: Bell, permission: "executive.view", minRole: "ADMIN" },
  { href: "/morning-briefing", label: "Morning Briefing", icon: Sun, minRole: "ADMIN", keywords: "briefing morning daily" },
  { href: "/insights", label: "Executive Insights", icon: BarChart3, minRole: "ADMIN" },
  { href: "/cfo", label: "CFO Advisor", icon: Brain, permission: "admin.manage_roles", minRole: "ADMIN", keywords: "cfo advisor executive finance" },
  { href: "/cfo/dashboard", label: "CFO Dashboard", icon: LayoutDashboard, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/cfo/briefing", label: "CFO Briefing", icon: FileText, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/cfo/recommendations", label: "CFO Recommendations", icon: ThumbsUp, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/cfo/scenarios", label: "CFO Scenarios", icon: Calculator, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/executive-ai/overview", label: "Executive AI", icon: Brain, permission: "executive-ai.view", minRole: "ADMIN" },
  { href: "/copilot", label: "Copilot", icon: MessageSquareText, minRole: "ADMIN" },

  { href: "/general-ledger", label: "General Ledger", icon: BookOpenCheck, permission: "gl.view", minRole: "MEMBER", keywords: "general ledger gl accounting journals posting coa chart of accounts periods" },
  { href: "/financial-close", label: "Financial Close", icon: FileCheck, permission: "fc.view", minRole: "ADMIN", keywords: "financial close month end quarter end year end reconciliation period close" },
  { href: "/reconciliation", label: "Reconciliation", icon: RefreshCw, permission: "reconciliation.run", minRole: "TREASURER" },
  { href: "/fixed-assets", label: "Fixed Assets", icon: HardDrive, permission: "fa.view", minRole: "ADMIN", keywords: "fixed assets capital equipment depreciation asset register" },
  { href: "/consolidation", label: "Consolidation", icon: Layers, permission: "cons.view", minRole: "ADMIN", keywords: "consolidation group reporting intercompany elimination minority interest" },
  { href: "/order-to-cash", label: "Order-to-Cash", icon: Receipt, permission: "ordertocash.view", minRole: "MEMBER", keywords: "order to cash o2c revenue billing collections credit" },
  { href: "/accounts-receivable", label: "Accounts Receivable", icon: DollarSign, permission: "ar.view", minRole: "TREASURER", keywords: "accounts receivable ar invoices collections customers credit cash application disputes" },
  { href: "/invoices", label: "Invoices", icon: ReceiptText, keywords: "invoices billing payments vendor invoices" },
  { href: "/procurement", label: "Procurement", icon: ShoppingCart, permission: "procurement.view", minRole: "MEMBER", keywords: "procurement p2p sourcing vendors purchase" },
  { href: "/procurement/exceptions", label: "Exception Queue", icon: AlertTriangle, permission: "ap.exceptions.view", minRole: "MEMBER", keywords: "ap exceptions queue errors variance duplicate" },
  { href: "/procurement/reports", label: "AP Reports", icon: BarChart3, permission: "ap.reports.view", minRole: "MEMBER", keywords: "ap reports aging payment calendar cash requirements duplicates analytics" },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, permission: "transactions.transfer", minRole: "TREASURER" },
  { href: "/ledger", label: "Ledger", icon: BookOpen, permission: "audit.view", minRole: "ADMIN" },

  { href: "/treasury/dashboard", label: "Treasury Overview", icon: Landmark, permission: "treasury.manage", minRole: "ADMIN", keywords: "treasury cash liquidity" },
  { href: "/treasury/cash", label: "Cash Position", icon: Banknote, permission: "treasury.manage", minRole: "ADMIN" },
  { href: "/treasury/liquidity", label: "Liquidity", icon: Droplets, permission: "treasury.manage", minRole: "ADMIN" },
  { href: "/treasury/forecasts", label: "Cash Forecast", icon: LineChart, permission: "treasury.manage", minRole: "ADMIN" },
  { href: "/treasury/fx", label: "FX Exposure", icon: ArrowLeftRight, permission: "treasury.manage", minRole: "ADMIN" },
  { href: "/treasury/banking", label: "Banking", icon: Building2, permission: "treasury.manage", minRole: "ADMIN" },
  { href: "/treasury/debt", label: "Debt Management", icon: CreditCard, permission: "treasury.manage", minRole: "ADMIN" },
  { href: "/investments/overview", label: "Investments", icon: Briefcase, permission: "treasury.manage", minRole: "TREASURER" },
  { href: "/treasury/payments", label: "Payments", icon: Wallet, permission: "treasury.manage", minRole: "ADMIN" },
  { href: "/treasury/risks", label: "Treasury Risk", icon: ShieldAlert, permission: "treasury.manage", minRole: "ADMIN" },
  { href: "/wallets", label: "Wallets", icon: Wallet, permission: "wallet.view", minRole: "TREASURER" },
  { href: "/accounts", label: "Accounts", icon: Landmark, permission: "treasury.manage", minRole: "TREASURER" },

  { href: "/fpa/dashboard", label: "Planning Overview", icon: Target, permission: "fpa.manage", minRole: "ADMIN", keywords: "fpa planning budget forecast" },
  { href: "/fpa/budgets", label: "Budgets", icon: Wallet, permission: "fpa.manage", minRole: "ADMIN" },
  { href: "/fpa/forecasts", label: "Forecasts", icon: TrendingUp, permission: "fpa.manage", minRole: "ADMIN" },
  { href: "/fpa/scenarios", label: "Scenarios", icon: GitBranch, permission: "fpa.manage", minRole: "ADMIN" },
  { href: "/fpa/variance", label: "Variance Analysis", icon: BarChart3, permission: "fpa.manage", minRole: "ADMIN" },
  { href: "/fpa/capital", label: "Capital Planning", icon: DollarSign, permission: "fpa.manage", minRole: "ADMIN" },
  { href: "/fpa/drivers", label: "Driver Planning", icon: SlidersHorizontal, permission: "fpa.manage", minRole: "ADMIN" },
  { href: "/fpa/executive", label: "Executive Planning", icon: Crown, permission: "fpa.manage", minRole: "ADMIN" },
  { href: "/tax/dashboard", label: "Tax Overview", icon: Receipt, permission: "tax.manage", minRole: "ADMIN", keywords: "tax provision indirect" },
  { href: "/tax/provisions", label: "Tax Provisions", icon: Calculator, permission: "tax.manage", minRole: "ADMIN" },
  { href: "/tax/calendar", label: "Tax Calendar", icon: Calendar, permission: "tax.manage", minRole: "ADMIN" },
  { href: "/tax/planning", label: "Tax Planning", icon: Target, permission: "tax.manage", minRole: "ADMIN" },
  { href: "/tax/transfer-pricing", label: "Transfer Pricing", icon: ArrowRightLeft, permission: "tax.manage", minRole: "ADMIN" },

  { href: "/risk", label: "Risk Center", icon: AlertTriangle, permission: "risk.manage", minRole: "TREASURER", keywords: "risk overview alerts incidents" },
  { href: "/audit/dashboard", label: "Audit Dashboard", icon: ShieldCheck, permission: "audit.manage", minRole: "ADMIN", keywords: "audit controls findings" },
  { href: "/audit/controls", label: "Controls", icon: Lock, permission: "audit.manage", minRole: "ADMIN" },
  { href: "/audit/findings", label: "Findings", icon: AlertTriangle, permission: "audit.manage", minRole: "ADMIN" },
  { href: "/audit/readiness", label: "Audit Readiness", icon: CheckCircle, permission: "audit.manage", minRole: "ADMIN" },
  { href: "/audit-trail", label: "Audit Trail", icon: ScrollText, keywords: "audit trail activity log changes history" },
  { href: "/compliance/dashboard", label: "Compliance Dashboard", icon: ShieldAlert, permission: "compliance.manage", minRole: "ADMIN", keywords: "compliance regulatory policy" },
  { href: "/compliance/policies", label: "Policies", icon: BookOpen, permission: "compliance.manage", minRole: "ADMIN" },
  { href: "/compliance/violations", label: "Violations", icon: AlertTriangle, permission: "compliance.manage", minRole: "ADMIN" },
  { href: "/compliance/obligations", label: "Obligations", icon: ClipboardList, permission: "compliance.manage", minRole: "ADMIN" },
  { href: "/compliance/calendar", label: "Compliance Calendar", icon: Calendar, permission: "compliance.manage", minRole: "ADMIN" },
  { href: "/governance/dashboard", label: "Board Governance", icon: Crown, permission: "governance.manage", minRole: "ADMIN", keywords: "governance board" },
  { href: "/governance/board", label: "Board Center", icon: Users, permission: "governance.manage", minRole: "ADMIN" },
  { href: "/governance/meetings", label: "Meetings", icon: Calendar, permission: "governance.manage", minRole: "ADMIN" },
  { href: "/governance/resolutions", label: "Resolutions", icon: Scale, permission: "governance.manage", minRole: "ADMIN" },
  { href: "/approvals", label: "Approvals", icon: Bell, permission: "approvals.approve", minRole: "ADMIN", badge: "pending-approvals" },

  { href: "/intelligence", label: "Intelligence Platform", icon: Brain, minRole: "ADMIN", keywords: "intelligence analytics insights" },
  { href: "/crm", label: "Relationship Intelligence", icon: Users, permission: "crm.view", minRole: "ADMIN", keywords: "crm contacts relationships intelligence voc pain points discovery knowledge graph" },
  { href: "/crm/contacts", label: "Contacts", icon: UserCircle, permission: "crm.view", minRole: "ADMIN", keywords: "crm contacts leads pipeline" },
  { href: "/crm/voice-of-customer", label: "Voice of Customer", icon: MessageSquareText, permission: "crm.view", minRole: "ADMIN", keywords: "voc insights feedback interviews" },
  { href: "/crm/pain-points", label: "Pain Points", icon: AlertTriangle, permission: "crm.view", minRole: "ADMIN", keywords: "pain points problems challenges" },
  { href: "/crm/discovery", label: "Product Discovery", icon: Search, permission: "crm.view", minRole: "ADMIN", keywords: "discovery sessions interviews product" },
  { href: "/crm/knowledge-graph", label: "Knowledge Graph", icon: Share2, permission: "crm.view", minRole: "ADMIN", keywords: "knowledge graph connections network" },
  { href: "/agents/dashboard", label: "Agent Dashboard", icon: LayoutDashboard, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/agents/registry", label: "Agent Registry", icon: List, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/automation-studio", label: "Automation Studio", icon: GitBranch, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/automation-studio/designer", label: "Workflow Designer", icon: Workflow, permission: "admin.manage_roles", minRole: "ADMIN" },
  { href: "/orchestration", label: "Orchestration", icon: Network, minRole: "ADMIN", keywords: "orchestration workflows automation" },
  { href: "/finance/dashboard", label: "Finance Collaboration", icon: Network, permission: "finance.manage", minRole: "ADMIN" },
  { href: "/finance/memory", label: "Enterprise Memory", icon: Brain, permission: "finance.manage", minRole: "ADMIN" },

  { href: "/platform", label: "Platform Health", icon: Activity, minRole: "ADMIN" },
  { href: "/reports", label: "Reports", icon: BarChart3, keywords: "reports analytics export" },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/company", label: "Company Profile", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: UserCircle, permission: "admin.manage_users", minRole: "OWNER" },
  { href: "/admin/roles", label: "Roles", icon: Shield, permission: "admin.manage_roles", minRole: "OWNER" },
  { href: "/connectors", label: "Connectors", icon: Cable, permission: "connectors.manage", minRole: "ADMIN" },
  { href: "/integrations", label: "Integrations", icon: GitBranch, minRole: "ADMIN" },
  { href: "/developer", label: "Developer Portal", icon: Terminal, minRole: "ADMIN" },
  { href: "/system/status", label: "System Status", icon: Monitor, minRole: "ADMIN", keywords: "system status health" },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Executive Office",
    items: [
      { href: "/dashboard", label: "Executive Overview", icon: LayoutDashboard },
      { href: "/work-queue", label: "Work Queue", icon: ListTodo, keywords: "work queue tasks pending review" },
      { href: "/command-center", label: "Command Center", icon: Command, minRole: "ADMIN" },
      { href: "/executive/dashboard", label: "Executive Command Center", icon: Crown, permission: "executive.view", minRole: "ADMIN" },
      { href: "/executive/kpis", label: "Executive Insights", icon: BarChart3, permission: "executive.view", minRole: "ADMIN" },
      { href: "/executive/alerts", label: "Enterprise Alerts", icon: Bell, permission: "executive.view", minRole: "ADMIN" },
      { href: "/morning-briefing", label: "Morning Briefing", icon: Sun, minRole: "ADMIN", keywords: "briefing morning daily" },
      { href: "/cfo/dashboard", label: "CFO Advisor", icon: LayoutDashboard, permission: "admin.manage_roles", minRole: "ADMIN" },
      { href: "/cfo/briefing", label: "CFO Briefing", icon: FileText, permission: "admin.manage_roles", minRole: "ADMIN" },
      { href: "/cfo/recommendations", label: "CFO Recommendations", icon: ThumbsUp, permission: "admin.manage_roles", minRole: "ADMIN" },
      { href: "/cfo/scenarios", label: "CFO Scenarios", icon: Calculator, permission: "admin.manage_roles", minRole: "ADMIN" },
      { href: "/executive-ai/overview", label: "Executive AI", icon: Brain, permission: "executive-ai.view", minRole: "ADMIN" },
      { href: "/copilot", label: "Copilot", icon: MessageSquareText, minRole: "ADMIN" },
    ],
  },
  {
    title: "Financial Operations",
    items: [
      { href: "/general-ledger", label: "General Ledger", icon: BookOpenCheck, permission: "gl.view", minRole: "MEMBER" },
      { href: "/financial-close", label: "Financial Close", icon: FileCheck, permission: "fc.view", minRole: "ADMIN" },
      { href: "/reconciliation", label: "Reconciliation", icon: RefreshCw, permission: "reconciliation.run", minRole: "TREASURER" },
      { href: "/fixed-assets", label: "Fixed Assets", icon: HardDrive, permission: "fa.view", minRole: "ADMIN" },
      { href: "/consolidation", label: "Consolidation", icon: Layers, permission: "cons.view", minRole: "ADMIN" },
      { href: "/order-to-cash", label: "Order-to-Cash", icon: Receipt, permission: "ordertocash.view", minRole: "MEMBER" },
      { href: "/accounts-receivable", label: "Accounts Receivable", icon: DollarSign, permission: "ar.view", minRole: "TREASURER" },
      { href: "/invoices", label: "Invoices", icon: ReceiptText, keywords: "invoices billing payments vendor invoices" },
      { href: "/procurement", label: "Procurement", icon: ShoppingCart, permission: "procurement.view", minRole: "MEMBER" },
      { href: "/procurement/exceptions", label: "Exception Queue", icon: AlertTriangle, permission: "ap.exceptions.view", minRole: "MEMBER", keywords: "ap exceptions queue errors variance duplicate" },
      { href: "/procurement/reports", label: "AP Reports", icon: BarChart3, permission: "ap.reports.view", minRole: "MEMBER", keywords: "ap reports aging payment calendar cash requirements duplicates analytics" },
      { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, permission: "transactions.transfer", minRole: "TREASURER" },
      { href: "/ledger", label: "Ledger", icon: BookOpen, permission: "audit.view", minRole: "ADMIN" },
    ],
  },
  {
    title: "Treasury",
    items: [
      { href: "/treasury/dashboard", label: "Treasury Overview", icon: Landmark, permission: "treasury.manage", minRole: "ADMIN" },
      { href: "/treasury/cash", label: "Cash Position", icon: Banknote, permission: "treasury.manage", minRole: "ADMIN" },
      { href: "/treasury/liquidity", label: "Liquidity", icon: Droplets, permission: "treasury.manage", minRole: "ADMIN" },
      { href: "/treasury/forecasts", label: "Cash Forecast", icon: LineChart, permission: "treasury.manage", minRole: "ADMIN" },
      { href: "/treasury/fx", label: "FX Exposure", icon: ArrowLeftRight, permission: "treasury.manage", minRole: "ADMIN" },
      { href: "/treasury/banking", label: "Banking", icon: Building2, permission: "treasury.manage", minRole: "ADMIN" },
      { href: "/treasury/debt", label: "Debt Management", icon: CreditCard, permission: "treasury.manage", minRole: "ADMIN" },
      { href: "/investments/overview", label: "Investments", icon: Briefcase, permission: "treasury.manage", minRole: "TREASURER" },
      { href: "/treasury/payments", label: "Payments", icon: Wallet, permission: "treasury.manage", minRole: "ADMIN" },
      { href: "/treasury/risks", label: "Treasury Risk", icon: ShieldAlert, permission: "treasury.manage", minRole: "ADMIN" },
    ],
  },
  {
    title: "Planning & Strategy",
    items: [
      { href: "/fpa/dashboard", label: "Planning Overview", icon: Target, permission: "fpa.manage", minRole: "ADMIN" },
      { href: "/fpa/budgets", label: "Budgets", icon: Wallet, permission: "fpa.manage", minRole: "ADMIN" },
      { href: "/fpa/forecasts", label: "Forecasts", icon: TrendingUp, permission: "fpa.manage", minRole: "ADMIN" },
      { href: "/fpa/scenarios", label: "Scenarios", icon: GitBranch, permission: "fpa.manage", minRole: "ADMIN" },
      { href: "/fpa/variance", label: "Variance Analysis", icon: BarChart3, permission: "fpa.manage", minRole: "ADMIN" },
      { href: "/fpa/capital", label: "Capital Planning", icon: DollarSign, permission: "fpa.manage", minRole: "ADMIN" },
      { href: "/fpa/drivers", label: "Driver Planning", icon: SlidersHorizontal, permission: "fpa.manage", minRole: "ADMIN" },
      { href: "/fpa/executive", label: "Executive Planning", icon: Crown, permission: "fpa.manage", minRole: "ADMIN" },
      { href: "/tax/dashboard", label: "Tax Overview", icon: Receipt, permission: "tax.manage", minRole: "ADMIN" },
      { href: "/tax/provisions", label: "Tax Provisions", icon: Calculator, permission: "tax.manage", minRole: "ADMIN" },
      { href: "/tax/calendar", label: "Tax Calendar", icon: Calendar, permission: "tax.manage", minRole: "ADMIN" },
      { href: "/tax/planning", label: "Tax Planning", icon: Target, permission: "tax.manage", minRole: "ADMIN" },
      { href: "/tax/transfer-pricing", label: "Transfer Pricing", icon: ArrowRightLeft, permission: "tax.manage", minRole: "ADMIN" },
    ],
  },
  {
    title: "Governance, Risk & Compliance",
    items: [
      { href: "/risk", label: "Risk Center", icon: AlertTriangle, permission: "risk.manage", minRole: "TREASURER" },
      { href: "/audit/dashboard", label: "Audit Dashboard", icon: ShieldCheck, permission: "audit.manage", minRole: "ADMIN" },
      { href: "/audit/controls", label: "Controls", icon: Lock, permission: "audit.manage", minRole: "ADMIN" },
      { href: "/audit/findings", label: "Findings", icon: AlertTriangle, permission: "audit.manage", minRole: "ADMIN" },
      { href: "/audit/readiness", label: "Audit Readiness", icon: CheckCircle, permission: "audit.manage", minRole: "ADMIN" },
      { href: "/audit-trail", label: "Audit Trail", icon: ScrollText, keywords: "audit trail activity log changes history" },
      { href: "/compliance/dashboard", label: "Compliance Dashboard", icon: ShieldAlert, permission: "compliance.manage", minRole: "ADMIN" },
      { href: "/compliance/policies", label: "Policies", icon: BookOpen, permission: "compliance.manage", minRole: "ADMIN" },
      { href: "/compliance/violations", label: "Violations", icon: AlertTriangle, permission: "compliance.manage", minRole: "ADMIN" },
      { href: "/compliance/obligations", label: "Obligations", icon: ClipboardList, permission: "compliance.manage", minRole: "ADMIN" },
      { href: "/compliance/calendar", label: "Compliance Calendar", icon: Calendar, permission: "compliance.manage", minRole: "ADMIN" },
      { href: "/governance/dashboard", label: "Board Governance", icon: Crown, permission: "governance.manage", minRole: "ADMIN" },
      { href: "/governance/board", label: "Board Center", icon: Users, permission: "governance.manage", minRole: "ADMIN" },
      { href: "/governance/meetings", label: "Meetings", icon: Calendar, permission: "governance.manage", minRole: "ADMIN" },
      { href: "/governance/resolutions", label: "Resolutions", icon: Scale, permission: "governance.manage", minRole: "ADMIN" },
      { href: "/approvals", label: "Approvals", icon: Bell, permission: "approvals.approve", minRole: "ADMIN", badge: "pending-approvals" },
    ],
  },
  {
    title: "Relationship Intelligence",
    items: [
      { href: "/crm", label: "CRM Dashboard", icon: Users, permission: "crm.view", minRole: "ADMIN" },
      { href: "/crm/contacts", label: "Contacts", icon: UserCircle, permission: "crm.view", minRole: "ADMIN" },
      { href: "/crm/voice-of-customer", label: "Voice of Customer", icon: MessageSquareText, permission: "crm.view", minRole: "ADMIN" },
      { href: "/crm/pain-points", label: "Pain Points", icon: AlertTriangle, permission: "crm.view", minRole: "ADMIN" },
      { href: "/crm/discovery", label: "Product Discovery", icon: Search, permission: "crm.view", minRole: "ADMIN" },
      { href: "/crm/knowledge-graph", label: "Knowledge Graph", icon: Share2, permission: "crm.view", minRole: "ADMIN" },
    ],
  },
  {
    title: "Intelligence & Automation",
    items: [
      { href: "/intelligence", label: "Intelligence Platform", icon: Brain, minRole: "ADMIN" },
      { href: "/agents/dashboard", label: "Agent Framework", icon: LayoutDashboard, permission: "admin.manage_roles", minRole: "ADMIN" },
      { href: "/agents/registry", label: "Agent Registry", icon: List, permission: "admin.manage_roles", minRole: "ADMIN" },
      { href: "/automation-studio", label: "Automation Studio", icon: GitBranch, permission: "admin.manage_roles", minRole: "ADMIN" },
      { href: "/automation-studio/designer", label: "Workflow Designer", icon: Workflow, permission: "admin.manage_roles", minRole: "ADMIN" },
      { href: "/orchestration", label: "Orchestration", icon: Network, minRole: "ADMIN" },
      { href: "/finance/dashboard", label: "Finance Collaboration", icon: Network, permission: "finance.manage", minRole: "ADMIN" },
      { href: "/finance/memory", label: "Enterprise Memory", icon: Brain, permission: "finance.manage", minRole: "ADMIN" },
    ],
  },
  {
    title: "Administration & Settings",
    items: [
      { href: "/platform", label: "Platform Health", icon: Activity, minRole: "ADMIN" },
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/settings/company", label: "Company Profile", icon: Building2 },
      { href: "/admin/users", label: "Users", icon: UserCircle, permission: "admin.manage_users", minRole: "OWNER" },
      { href: "/admin/roles", label: "Roles", icon: Shield, permission: "admin.manage_roles", minRole: "OWNER" },
      { href: "/connectors", label: "Connectors", icon: Cable, permission: "connectors.manage", minRole: "ADMIN" },
      { href: "/integrations", label: "Integrations", icon: GitBranch, minRole: "ADMIN" },
      { href: "/developer", label: "Developer Portal", icon: Terminal, minRole: "ADMIN" },
      { href: "/system/status", label: "System Status", icon: Monitor, minRole: "ADMIN" },
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/calendar", label: "Calendar", icon: Calendar },
    ],
  },
];

export const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 5, ADMIN: 4, TREASURER: 3, MEMBER: 2, VIEWER: 1,
};

export function filterNavByRole(items: NavItem[], role: string): NavItem[] {
  const userLevel = ROLE_HIERARCHY[role] ?? 0;
  return items.filter((item) => {
    if (!item.minRole) return true;
    return userLevel >= (ROLE_HIERARCHY[item.minRole] ?? 0);
  });
}

export function filterNavByPermissions(items: NavItem[], permissions: string[]): NavItem[] {
  const set = new Set(permissions);
  return items.filter((item) => {
    if (!item.permission) return true;
    return set.has(item.permission);
  });
}

export const SANDBOX_RESTRICTED: string[] = [
  "/settings/api-keys", "/settings/company", "/settings/webhooks",
  "/integrations", "/developer", "/admin/analytics", "/admin/rules",
  "/admin/roles", "/admin/approvers", "/admin/users", "/admin/rates",
  "/admin/fx", "/admin/queue",
];
