import type { OnboardingStepId, OnboardingStepDefinition, OnboardingStepExecutor, SetupRegistryEntry } from "./types";
import { CompanySetupStep } from "./steps/company-setup-step";
import { OrgStructureStep } from "./steps/org-structure-step";
import { UsersStep } from "./steps/users-step";
import { TreasurySetupStep } from "./steps/treasury-setup-step";
import { IntegrationsStep } from "./steps/integrations-step";
import { GovernanceStep } from "./steps/governance-step";
import { WorkflowsStep } from "./steps/workflows-step";
import { AIStep } from "./steps/ai-step";
import { OperationsStep } from "./steps/operations-step";
import { IntelligenceStep } from "./steps/intelligence-step";

const STEP_DEFINITIONS: OnboardingStepDefinition[] = [
  {
    id: "company-setup",
    label: "Company Setup",
    description: "Configure company name, legal entity, branding, currencies, and regional settings",
    prerequisiteIds: [],
    isRequired: true,
    estimatedMinutes: 5,
    category: "core",
  },
  {
    id: "org-structure",
    label: "Organization Structure",
    description: "Set up subsidiaries, legal entities, business units, departments, branches, and cost centers",
    prerequisiteIds: ["company-setup"],
    isRequired: true,
    estimatedMinutes: 8,
    category: "core",
  },
  {
    id: "users",
    label: "Team & Users",
    description: "Invite team members, assign roles, and configure access permissions",
    prerequisiteIds: ["company-setup"],
    isRequired: true,
    estimatedMinutes: 5,
    category: "core",
  },
  {
    id: "treasury-setup",
    label: "Treasury Setup",
    description: "Configure bank accounts, internal wallets, cash pools, approval limits, and treasury rules",
    prerequisiteIds: ["org-structure"],
    isRequired: true,
    estimatedMinutes: 10,
    category: "core",
  },
  {
    id: "integrations",
    label: "Integration Setup",
    description: "Connect bank integrations (Plaid, Lean, Tarabut), ERP systems (SAP, NetSuite, Dynamics), and accounting tools (QuickBooks, Xero)",
    prerequisiteIds: ["company-setup"],
    isRequired: true,
    estimatedMinutes: 12,
    category: "integration",
  },
  {
    id: "governance",
    label: "Governance Framework",
    description: "Define approval frameworks, admin roles, and compliance policies",
    prerequisiteIds: ["users", "treasury-setup"],
    isRequired: true,
    estimatedMinutes: 8,
    category: "governance",
  },
  {
    id: "workflows",
    label: "Workflow Engine",
    description: "Configure default approval workflows and notification channels",
    prerequisiteIds: ["governance"],
    isRequired: true,
    estimatedMinutes: 7,
    category: "automation",
  },
  {
    id: "ai",
    label: "AI Platform",
    description: "Configure AI provider, API keys, and AI-powered features",
    prerequisiteIds: ["workflows"],
    isRequired: false,
    estimatedMinutes: 3,
    category: "analytics",
  },
  {
    id: "operations",
    label: "Operations & Monitoring",
    description: "Enable monitoring, configure alerting, and set up operational dashboards",
    prerequisiteIds: ["integrations", "workflows"],
    isRequired: true,
    estimatedMinutes: 5,
    category: "integration",
  },
  {
    id: "intelligence",
    label: "Enterprise Intelligence",
    description: "Enable enterprise intelligence features and configure data retention",
    prerequisiteIds: ["ai"],
    isRequired: false,
    estimatedMinutes: 3,
    category: "analytics",
  },
];

export class SetupRegistry {
  private executors = new Map<OnboardingStepId, OnboardingStepExecutor>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    const steps: OnboardingStepExecutor[] = [
      new CompanySetupStep(),
      new OrgStructureStep(),
      new UsersStep(),
      new TreasurySetupStep(),
      new IntegrationsStep(),
      new GovernanceStep(),
      new WorkflowsStep(),
      new AIStep(),
      new OperationsStep(),
      new IntelligenceStep(),
    ];
    for (const step of steps) {
      this.executors.set(step.stepId, step);
    }
  }

  register(executor: OnboardingStepExecutor): void {
    this.executors.set(executor.stepId, executor);
  }

  unregister(stepId: OnboardingStepId): void {
    this.executors.delete(stepId);
  }

  getExecutor(stepId: OnboardingStepId): OnboardingStepExecutor | undefined {
    return this.executors.get(stepId);
  }

  getDefinition(stepId: OnboardingStepId): OnboardingStepDefinition | undefined {
    return STEP_DEFINITIONS.find((d) => d.id === stepId);
  }

  getAllDefinitions(): OnboardingStepDefinition[] {
    return [...STEP_DEFINITIONS];
  }

  getAllEntries(): SetupRegistryEntry[] {
    return STEP_DEFINITIONS.map((def) => ({
      definition: def,
      executor: this.executors.get(def.id)!,
    }));
  }

  getPrerequisites(stepId: OnboardingStepId): OnboardingStepId[] {
    const def = this.getDefinition(stepId);
    return def?.prerequisiteIds ?? [];
  }

  getNextSteps(completedStepIds: OnboardingStepId[]): OnboardingStepId[] {
    return STEP_DEFINITIONS
      .filter((def) => !completedStepIds.includes(def.id))
      .filter((def) => def.prerequisiteIds.every((p) => completedStepIds.includes(p)))
      .map((def) => def.id);
  }

  getBlockedSteps(completedStepIds: OnboardingStepId[]): Array<{ stepId: OnboardingStepId; prerequisites: OnboardingStepId[] }> {
    return STEP_DEFINITIONS
      .filter((def) => !completedStepIds.includes(def.id))
      .filter((def) => !def.prerequisiteIds.every((p) => completedStepIds.includes(p)))
      .map((def) => ({ stepId: def.id, prerequisites: def.prerequisiteIds }));
  }

  getTotalEstimatedMinutes(): number {
    return STEP_DEFINITIONS.reduce((sum, def) => sum + def.estimatedMinutes, 0);
  }
}

export const setupRegistry = new SetupRegistry();
