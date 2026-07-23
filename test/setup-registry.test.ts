import { describe, it, expect, beforeEach } from "vitest";
import { SetupRegistry } from "@/modules/onboarding/setup-registry";
import type { OnboardingStepExecutor, OnboardingStepDefinition, OnboardingStepId } from "@/modules/onboarding/types";

describe("SetupRegistry", () => {
  let registry: SetupRegistry;

  beforeEach(() => {
    registry = new SetupRegistry();
  });

  describe("getAllDefinitions", () => {
    it("returns all 10 step definitions", () => {
      const defs = registry.getAllDefinitions();
      expect(defs).toHaveLength(10);
    });

    it("includes all expected step IDs", () => {
      const ids = registry.getAllDefinitions().map((d) => d.id);
      expect(ids).toEqual([
        "company-setup",
        "org-structure",
        "users",
        "treasury-setup",
        "integrations",
        "governance",
        "workflows",
        "ai",
        "operations",
        "intelligence",
      ]);
    });
  });

  describe("step definitions metadata", () => {
    it("company-setup has no prerequisites and is required", () => {
      const def = registry.getDefinition("company-setup")!;
      expect(def.prerequisiteIds).toEqual([]);
      expect(def.isRequired).toBe(true);
      expect(def.category).toBe("core");
    });

    it("org-structure depends on company-setup", () => {
      const def = registry.getDefinition("org-structure")!;
      expect(def.prerequisiteIds).toEqual(["company-setup"]);
      expect(def.isRequired).toBe(true);
    });

    it("users depends on company-setup", () => {
      const def = registry.getDefinition("users")!;
      expect(def.prerequisiteIds).toEqual(["company-setup"]);
      expect(def.isRequired).toBe(true);
    });

    it("treasury-setup depends on org-structure", () => {
      const def = registry.getDefinition("treasury-setup")!;
      expect(def.prerequisiteIds).toEqual(["org-structure"]);
      expect(def.isRequired).toBe(true);
    });

    it("integrations depends on company-setup", () => {
      const def = registry.getDefinition("integrations")!;
      expect(def.prerequisiteIds).toEqual(["company-setup"]);
      expect(def.isRequired).toBe(true);
    });

    it("governance depends on users and treasury-setup", () => {
      const def = registry.getDefinition("governance")!;
      expect(def.prerequisiteIds).toEqual(["users", "treasury-setup"]);
      expect(def.isRequired).toBe(true);
    });

    it("workflows depends on governance", () => {
      const def = registry.getDefinition("workflows")!;
      expect(def.prerequisiteIds).toEqual(["governance"]);
      expect(def.isRequired).toBe(true);
    });

    it("ai depends on workflows and is optional", () => {
      const def = registry.getDefinition("ai")!;
      expect(def.prerequisiteIds).toEqual(["workflows"]);
      expect(def.isRequired).toBe(false);
    });

    it("operations depends on integrations and workflows", () => {
      const def = registry.getDefinition("operations")!;
      expect(def.prerequisiteIds).toEqual(["integrations", "workflows"]);
      expect(def.isRequired).toBe(true);
    });

    it("intelligence depends on ai and is optional", () => {
      const def = registry.getDefinition("intelligence")!;
      expect(def.prerequisiteIds).toEqual(["ai"]);
      expect(def.isRequired).toBe(false);
    });
  });

  describe("categories", () => {
    it("has correct category for each step", () => {
      const categories = registry.getAllDefinitions().reduce(
        (acc, d) => ({ ...acc, [d.id]: d.category }),
        {} as Record<string, string>,
      );
      expect(categories["company-setup"]).toBe("core");
      expect(categories["org-structure"]).toBe("core");
      expect(categories["users"]).toBe("core");
      expect(categories["treasury-setup"]).toBe("core");
      expect(categories["integrations"]).toBe("integration");
      expect(categories["governance"]).toBe("governance");
      expect(categories["workflows"]).toBe("automation");
      expect(categories["ai"]).toBe("analytics");
      expect(categories["operations"]).toBe("integration");
      expect(categories["intelligence"]).toBe("analytics");
    });
  });

  describe("estimated minutes", () => {
    it("total estimated minutes is 66", () => {
      expect(registry.getTotalEstimatedMinutes()).toBe(66);
    });

    it("each step has positive estimated minutes", () => {
      const defs = registry.getAllDefinitions();
      for (const def of defs) {
        expect(def.estimatedMinutes).toBeGreaterThan(0);
      }
    });
  });

  describe("getExecutor", () => {
    it("returns executor for each registered step", () => {
      const ids = registry.getAllDefinitions().map((d) => d.id);
      for (const id of ids) {
        const executor = registry.getExecutor(id);
        expect(executor).toBeDefined();
        expect(executor!.stepId).toBe(id);
      }
    });

    it("returns undefined for unknown step", () => {
      expect(registry.getExecutor("unknown" as any)).toBeUndefined();
    });
  });

  describe("getPrerequisites", () => {
    it("returns empty array for company-setup", () => {
      expect(registry.getPrerequisites("company-setup")).toEqual([]);
    });

    it("returns prerequisites for governance", () => {
      expect(registry.getPrerequisites("governance")).toEqual(["users", "treasury-setup"]);
    });

    it("returns empty array for unknown step", () => {
      expect(registry.getPrerequisites("unknown" as any)).toEqual([]);
    });
  });

  describe("getNextSteps", () => {
    it("returns company-setup as first step when none completed", () => {
      const next = registry.getNextSteps([]);
      expect(next).toContain("company-setup");
    });

    it("returns org-structure and users after company-setup", () => {
      const next = registry.getNextSteps(["company-setup"]);
      expect(next).toContain("org-structure");
      expect(next).toContain("users");
      expect(next).toContain("integrations");
    });

    it("returns treasury-setup after org-structure", () => {
      const next = registry.getNextSteps(["company-setup", "org-structure"]);
      expect(next).toContain("treasury-setup");
    });

    it("returns governance after users and treasury-setup", () => {
      const completed = ["company-setup", "org-structure", "users", "treasury-setup"] as OnboardingStepId[];
      const next = registry.getNextSteps(completed);
      expect(next).toContain("governance");
    });

    it("chain: company-setup -> org-structure -> treasury-setup -> governance -> workflows -> ai -> intelligence", () => {
      const chain = ["company-setup", "org-structure", "treasury-setup", "governance", "workflows", "ai"] as OnboardingStepId[];
      const next = registry.getNextSteps(chain);
      expect(next).toContain("intelligence");
    });

    it("returns empty when nothing is available", () => {
      const allIds = registry.getAllDefinitions().map((d) => d.id);
      const next = registry.getNextSteps(allIds);
      expect(next).toEqual([]);
    });
  });

  describe("getBlockedSteps", () => {
    it("returns blocked steps with unmet prerequisites", () => {
      const blocked = registry.getBlockedSteps(["company-setup"]);
      expect(blocked.length).toBeGreaterThan(0);
      const governance = blocked.find((b) => b.stepId === "governance");
      expect(governance).toBeDefined();
      expect(governance!.prerequisites).toEqual(["users", "treasury-setup"]);
    });

    it("does not include steps whose prerequisites are met", () => {
      const blocked = registry.getBlockedSteps(["company-setup"]);
      const companySetup = blocked.find((b) => b.stepId === "company-setup");
      expect(companySetup).toBeUndefined();
    });

    it("returns empty when all steps are completed", () => {
      const allIds = registry.getAllDefinitions().map((d) => d.id);
      expect(registry.getBlockedSteps(allIds)).toEqual([]);
    });
  });

  describe("register and unregister", () => {
    it("can register a custom executor", () => {
      const mockExecutor: OnboardingStepExecutor = {
        stepId: "company-setup",
        validate: () => Promise.resolve({ valid: true, errors: [], warnings: [] }),
        execute: () => Promise.resolve({ success: true, status: "COMPLETED", error: null, metadata: {} }),
        skip: () => Promise.resolve({ success: true, status: "SKIPPED", error: null, metadata: {} }),
        getProgress: () => ({ stepId: "company-setup", completed: 1, total: 1, label: "test" }),
      };
      registry.register(mockExecutor);
      expect(registry.getExecutor("company-setup")).toBe(mockExecutor);
    });

    it("can unregister an executor", () => {
      registry.unregister("ai");
      expect(registry.getExecutor("ai")).toBeUndefined();
    });

    it("replacing an executor changes getAllEntries", () => {
      const orig = registry.getExecutor("company-setup");
      const mockExecutor: OnboardingStepExecutor = {
        stepId: "company-setup",
        validate: () => Promise.resolve({ valid: true, errors: [], warnings: [] }),
        execute: () => Promise.resolve({ success: true, status: "COMPLETED", error: null, metadata: {} }),
        skip: () => Promise.resolve({ success: true, status: "SKIPPED", error: null, metadata: {} }),
        getProgress: () => ({ stepId: "company-setup", completed: 1, total: 1, label: "test" }),
      };
      registry.register(mockExecutor);
      const entry = registry.getAllEntries().find((e) => e.definition.id === "company-setup");
      expect(entry!.executor).toBe(mockExecutor);
      expect(entry!.executor).not.toBe(orig);
    });
  });

  describe("prerequisite graph validation", () => {
    it("prerequisite graph has no cycles (topological sanity)", () => {
      const visited = new Set<string>();
      const visiting = new Set<string>();
      const defs = registry.getAllDefinitions();

      function visit(id: string): boolean {
        if (visiting.has(id)) return false;
        if (visited.has(id)) return true;
        visiting.add(id);
        const def = defs.find((d) => d.id === id);
        if (def) {
          for (const prereq of def.prerequisiteIds) {
            if (!visit(prereq)) return false;
          }
        }
        visiting.delete(id);
        visited.add(id);
        return true;
      }

      for (const def of defs) {
        expect(visit(def.id)).toBe(true);
      }
    });

    it("every prerequisite ID is a valid step ID", () => {
      const allIds = new Set(registry.getAllDefinitions().map((d) => d.id));
      for (const def of registry.getAllDefinitions()) {
        for (const prereq of def.prerequisiteIds) {
          expect(allIds.has(prereq)).toBe(true);
        }
      }
    });
  });
});
