import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  ProductGuidanceData,
  UserGuidanceProgressData,
  GuidanceStepData,
} from "./types";

interface TourDefinition {
  slug: string;
  title: string;
  description: string;
  triggerOn: string;
  targetRole?: string;
  priority: number;
  steps: Omit<GuidanceStepData, "id" | "guidanceId">[];
}

const DEFAULT_TOURS: TourDefinition[] = [
  {
    slug: "welcome",
    title: "Welcome to Vault",
    description: "Get an overview of the platform and key navigation",
    triggerOn: "page:dashboard",
    priority: 1,
    steps: [
      { order: 0, title: "Welcome", content: "Welcome to Vault! Let's take a quick tour of the platform.", placement: "center", targetElement: "#app-shell" },
      { order: 1, title: "Sidebar Navigation", content: "Use the sidebar to access Treasury, Approvals, Reports, and more.", placement: "right", targetElement: "#sidebar" },
      { order: 2, title: "Quick Actions", content: "Perform common tasks quickly from the top bar.", placement: "bottom", targetElement: "#topbar" },
      { order: 3, title: "Your Dashboard", content: "Your dashboard shows key metrics and pending items at a glance.", placement: "top", targetElement: "#dashboard-content" },
      { order: 4, title: "Need Help?", content: "Access documentation and support from the help menu.", placement: "bottom", targetElement: "#help-menu", actionLabel: "Open Help", actionUrl: "/help" },
    ],
  },
  {
    slug: "first-integration",
    title: "Connect Your First Integration",
    description: "Learn how to connect your ERP system",
    triggerOn: "page:integration-platform",
    targetRole: "administrator",
    priority: 2,
    steps: [
      { order: 0, title: "Integration Platform", content: "This is where you connect external systems like ERPs and banks.", placement: "center", targetElement: "#integration-platform" },
      { order: 1, title: "Choose a Connector", content: "Select from available connectors like QuickBooks, SAP, or NetSuite.", placement: "bottom", targetElement: "#connector-list" },
      { order: 2, title: "Configure Connection", content: "Enter your credentials and configure the connection settings.", placement: "top", targetElement: "#connector-config" },
      { order: 3, title: "Test & Save", content: "Test the connection and save. Your data will start syncing automatically.", placement: "top", targetElement: "#connector-save", actionLabel: "Try It Now", actionUrl: "/integration-platform/new" },
    ],
  },
  {
    slug: "first-reconciliation",
    title: "Run Your First Reconciliation",
    description: "Learn how to reconcile bank transactions",
    triggerOn: "feature:reconciliation",
    targetRole: "controller",
    priority: 3,
    steps: [
      { order: 0, title: "Reconciliation Dashboard", content: "Track the status of all reconciliations from this dashboard.", placement: "center", targetElement: "#reconciliation-dashboard" },
      { order: 1, title: "Import Transactions", content: "Import bank statements or connect directly for auto-sync.", placement: "bottom", targetElement: "#import-transactions" },
      { order: 2, title: "Match Transactions", content: "Review suggested matches between bank and ledger transactions.", placement: "top", targetElement: "#match-queue" },
      { order: 3, title: "Review & Approve", content: "Approve matched transactions and resolve any exceptions.", placement: "top", targetElement: "#review-results", actionLabel: "Start Reconciliation", actionUrl: "/reconciliation/new" },
    ],
  },
  {
    slug: "first-approval",
    title: "Approve Your First Transaction",
    description: "Learn how to review and approve transactions",
    triggerOn: "page:approvals",
    targetRole: "finance-manager",
    priority: 4,
    steps: [
      { order: 0, title: "Approvals Queue", content: "All pending approvals are shown here, sorted by priority.", placement: "center", targetElement: "#approval-queue" },
      { order: 1, title: "Review Details", content: "Click any item to see transaction details, history, and supporting documents.", placement: "top", targetElement: "#approval-item" },
      { order: 2, title: "Approve or Reject", content: "Use the action buttons to approve, reject, or request more information.", placement: "bottom", targetElement: "#approval-actions", actionLabel: "Go to Approvals", actionUrl: "/approvals" },
    ],
  },
  {
    slug: "dashboard-customization",
    title: "Personalize Your Dashboard",
    description: "Customize your dashboard layout and KPIs",
    triggerOn: "feature:dashboard-customization",
    priority: 5,
    steps: [
      { order: 0, title: "Dashboard Settings", content: "Open settings to customize your dashboard layout.", placement: "bottom", targetElement: "#dashboard-settings" },
      { order: 1, title: "Choose Widgets", content: "Add, remove, or rearrange widgets to match your workflow.", placement: "top", targetElement: "#widget-palette" },
      { order: 2, title: "Configure KPIs", content: "Select the KPIs most relevant to your role and save your layout.", placement: "top", targetElement: "#kpi-config", actionLabel: "Customize Now", actionUrl: "/settings/dashboard" },
    ],
  },
];

export class ProductGuidanceService {
  static async initialize(ctx: TenantContext): Promise<ProductGuidanceData[]> {
    const results: ProductGuidanceData[] = [];
    for (const tour of DEFAULT_TOURS) {
      const { steps: stepDefs, ...guidanceData } = tour;
      const record = await prisma.productGuidance.upsert({
        where: { companyId_slug: { companyId: ctx.companyId, slug: tour.slug } },
        create: {
          companyId: ctx.companyId,
          slug: tour.slug,
          title: tour.title,
          description: tour.description,
          triggerOn: tour.triggerOn,
          targetRole: tour.targetRole,
          priority: tour.priority,
          isActive: true,
        },
        update: {
          title: tour.title,
          description: tour.description,
          triggerOn: tour.triggerOn,
          targetRole: tour.targetRole,
          priority: tour.priority,
        },
      });

      for (const step of stepDefs) {
        await prisma.guidanceStep.upsert({
          where: { guidanceId_order: { guidanceId: record.id, order: step.order } },
          create: {
            guidanceId: record.id,
            order: step.order,
            title: step.title,
            content: step.content,
            targetElement: step.targetElement,
            placement: step.placement,
            mediaUrl: step.mediaUrl,
            actionLabel: step.actionLabel,
            actionUrl: step.actionUrl,
          },
          update: {
            title: step.title,
            content: step.content,
            targetElement: step.targetElement,
            placement: step.placement,
            mediaUrl: step.mediaUrl,
            actionLabel: step.actionLabel,
            actionUrl: step.actionUrl,
          },
        });
      }

      const full = await prisma.productGuidance.findUnique({
        where: { id: record.id },
        include: { steps: { orderBy: { order: "asc" } } },
      });
      results.push(full as unknown as ProductGuidanceData);
    }
    return results;
  }

  static async getActiveTours(ctx: TenantContext, trigger: string, role: string): Promise<ProductGuidanceData[]> {
    const records = await prisma.productGuidance.findMany({
      where: {
        companyId: ctx.companyId,
        isActive: true,
        triggerOn: trigger,
      },
      include: { steps: { orderBy: { order: "asc" } } },
      orderBy: { priority: "asc" },
    });
    return (records as unknown as ProductGuidanceData[]).filter(
      (g) => !g.targetRole || g.targetRole === role,
    );
  }

  static async getTour(ctx: TenantContext, slug: string): Promise<ProductGuidanceData | null> {
    const record = await prisma.productGuidance.findUnique({
      where: { companyId_slug: { companyId: ctx.companyId, slug } },
      include: { steps: { orderBy: { order: "asc" } } },
    });
    return record as unknown as ProductGuidanceData | null;
  }

  static async recordProgress(
    ctx: TenantContext,
    userId: string,
    guidanceId: string,
    stepIndex: number,
    completed: boolean,
  ): Promise<UserGuidanceProgressData> {
    const record = await prisma.userGuidanceProgress.upsert({
      where: { userId_guidanceId: { userId, guidanceId } },
      create: {
        userId,
        guidanceId,
        stepIndex,
        isCompleted: completed,
        completedAt: completed ? new Date() : null,
      },
      update: {
        stepIndex,
        isCompleted: completed || undefined,
        completedAt: completed ? new Date() : undefined,
      },
    });
    return record as unknown as UserGuidanceProgressData;
  }

  static async getUserProgress(
    ctx: TenantContext,
    userId: string,
    guidanceId: string,
  ): Promise<UserGuidanceProgressData | null> {
    const record = await prisma.userGuidanceProgress.findUnique({
      where: { userId_guidanceId: { userId, guidanceId } },
    });
    return record as unknown as UserGuidanceProgressData | null;
  }
}
