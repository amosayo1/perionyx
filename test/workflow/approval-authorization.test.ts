/**
 * P0-2: Workflow Approval Authorization Tests
 *
 * Verifies that respondToApproval enforces role-based authorization.
 * Before the fix, any user with a valid TenantContext could approve any
 * approval step, regardless of their role.
 */
import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "@/server/db/prisma";
import { WorkflowEngine } from "@/modules/workflow/engine";
import { track, cleanup } from "../helpers/db";
import type { TenantContext } from "@/server/context/tenant-context";
import type { StepDefinition } from "@/modules/workflow/types";

// ── Helpers ────────────────────────────────────────────────────────────

let seq = 0;
function tag(name: string): string {
  seq++;
  return `test-${name}-${Date.now()}-${seq}-${Math.random().toString(36).slice(2, 6)}`;
}

async function createCompany(name?: string) {
  const slug = tag("co");
  const company = await prisma.company.create({
    data: {
      name: name ?? `Approval Auth Test ${slug}`,
      slug,
    },
  });
  track("company", company.id);
  return company;
}

async function createUser(email?: string) {
  const e = email ?? tag("user") + "@test.com";
  const user = await prisma.user.create({
    data: { name: `Test User ${e}`, email: e },
  });
  track("user", user.id);
  return user;
}

async function createMembership(userId: string, companyId: string, role: "OWNER" | "ADMIN" | "TREASURER" | "MEMBER" | "VIEWER") {
  const m = await prisma.companyMembership.create({
    data: { userId, companyId, role },
  });
  track("companyMembership", m.id);
  return m;
}

function ctx(userId: string, companyId: string, role: TenantContext["role"]): TenantContext {
  return { userId, companyId, role };
}

// ── Test Setup ─────────────────────────────────────────────────────────

describe("P0-2: Workflow Approval Authorization", () => {
  let engine: WorkflowEngine;
  let company: Awaited<ReturnType<typeof createCompany>>;
  let ownerUser: Awaited<ReturnType<typeof createUser>>;
  let adminUser: Awaited<ReturnType<typeof createUser>>;
  let treasurerUser: Awaited<ReturnType<typeof createUser>>;
  let memberUser: Awaited<ReturnType<typeof createUser>>;
  let viewerUser: Awaited<ReturnType<typeof createUser>>;

  beforeAll(async () => {
    engine = WorkflowEngine.getInstance();
    company = await createCompany("Approval Auth Co");
    ownerUser = await createUser("owner@test.com");
    adminUser = await createUser("admin@test.com");
    treasurerUser = await createUser("treasurer@test.com");
    memberUser = await createUser("member@test.com");
    viewerUser = await createUser("viewer@test.com");

    await createMembership(ownerUser.id, company.id, "OWNER");
    await createMembership(adminUser.id, company.id, "ADMIN");
    await createMembership(treasurerUser.id, company.id, "TREASURER");
    await createMembership(memberUser.id, company.id, "MEMBER");
    await createMembership(viewerUser.id, company.id, "VIEWER");
  });

  afterAll(cleanup);

  /** Create a workflow definition with an approval step requiring CFO role. */
  async function createApprovalWorkflow(requiredRoles: string[]) {
    const steps: StepDefinition[] = [
      {
        id: "step-1",
        type: "notification",
        label: "Pre-approval notification",
        config: { title: "Approval needed", message: "Please review" },
      },
      {
        id: "step-approval",
        type: "approval",
        label: "CFO Approval",
        config: {
          requiredApprovers: requiredRoles,
          requiredApproverCount: 1,
          approvalMode: "any",
          timeoutMinutes: 1440,
        },
      },
      {
        id: "step-3",
        type: "notification",
        label: "Post-approval notification",
        config: { title: "Approved", message: "Done" },
        dependsOn: ["step-approval"],
      },
    ];

    const def = await engine.createDefinition(ctx(ownerUser.id, company.id, "OWNER"), {
      name: `Approval Auth WF ${tag("wf")}`,
      description: "Test workflow for approval authorization",
      category: "security-test",
      steps,
    });
    return def;
  }

  /**
   * Create a workflow instance, start it, and return the instance
   * with the approval step in WAITING_APPROVAL status.
   */
  async function createWaitingApprovalInstance(requiredRoles: string[]) {
    const def = await createApprovalWorkflow(requiredRoles);
    const instance = await engine.createInstance(
      ctx(ownerUser.id, company.id, "OWNER"),
      def.id,
    );
    const started = await engine.startInstance(ctx(ownerUser.id, company.id, "OWNER"), instance.id);

    // The instance should now be waiting at the approval step
    const current = await prisma.workflowInstance.findUnique({
      where: { id: instance.id },
      include: { steps: true },
    });
    expect(current).not.toBeNull();
    expect(current!.status).toBe("WAITING");

    const approvalStep = current!.steps.find((s) => s.stepId === "step-approval");
    expect(approvalStep).toBeDefined();
    expect(approvalStep!.status).toBe("WAITING_APPROVAL");

    return { instance: current!, approvalStep: approvalStep! };
  }

  // ── Authorization Tests ─────────────────────────────────────────────

  it("allows a user with a matching required role to approve", async () => {
    const { instance } = await createWaitingApprovalInstance(["ADMIN"]);

    const result = await engine.respondToApproval(
      ctx(adminUser.id, company.id, "ADMIN"),
      instance.id,
      "step-approval",
      true,
      "Approved by admin",
    );

    expect(result.approved).toBe(true);
  });

  it("rejects a user whose role is NOT in requiredApprovers", async () => {
    // Create a new workflow requiring TREASURER role
    const def = await createApprovalWorkflow(["TREASURER"]);
    const instance = await engine.createInstance(
      ctx(ownerUser.id, company.id, "OWNER"),
      def.id,
    );
    await engine.startInstance(ctx(ownerUser.id, company.id, "OWNER"), instance.id);

    // MEMBER tries to approve a step that requires TREASURER
    await expect(
      engine.respondToApproval(
        ctx(memberUser.id, company.id, "MEMBER"),
        instance.id,
        "step-approval",
        true,
      ),
    ).rejects.toThrow("not authorized");
  });

  it("rejects a VIEWER trying to approve any step", async () => {
    const { instance } = await createWaitingApprovalInstance(["ADMIN"]);

    await expect(
      engine.respondToApproval(
        ctx(viewerUser.id, company.id, "VIEWER"),
        instance.id,
        "step-approval",
        true,
      ),
    ).rejects.toThrow("not authorized");
  });

  it("allows OWNER to approve when OWNER is in requiredApprovers", async () => {
    const { instance } = await createWaitingApprovalInstance(["OWNER"]);

    const result = await engine.respondToApproval(
      ctx(ownerUser.id, company.id, "OWNER"),
      instance.id,
      "step-approval",
      true,
    );

    expect(result.approved).toBe(true);
  });

  it("rejects OWNER when OWNER is NOT in requiredApprovers", async () => {
    const { instance } = await createWaitingApprovalInstance(["TREASURER"]);

    await expect(
      engine.respondToApproval(
        ctx(ownerUser.id, company.id, "OWNER"),
        instance.id,
        "step-approval",
        true,
      ),
    ).rejects.toThrow("not authorized");
  });

  it("auto-completes when requiredApprovers is empty (no approval needed)", async () => {
    const def = await createApprovalWorkflow([]);
    const instance = await engine.createInstance(
      ctx(ownerUser.id, company.id, "OWNER"),
      def.id,
    );
    await engine.startInstance(ctx(ownerUser.id, company.id, "OWNER"), instance.id);

    // When requiredApprovers is empty, the ApprovalStepExecutor auto-completes
    // the step — it never enters WAITING_APPROVAL. Verify the workflow
    // progressed past the approval step.
    const current = await prisma.workflowInstance.findUnique({
      where: { id: instance.id },
      include: { steps: true },
    });
    const approvalStep = current!.steps.find((s) => s.stepId === "step-approval");
    expect(approvalStep).toBeDefined();
    expect(approvalStep!.status).not.toBe("WAITING_APPROVAL");
  });

  it("rejects approval on a step that is not in WAITING_APPROVAL status", async () => {
    const def = await createApprovalWorkflow(["ADMIN"]);
    const instance = await engine.createInstance(
      ctx(ownerUser.id, company.id, "OWNER"),
      def.id,
    );
    // Don't start — step is still PENDING

    await expect(
      engine.respondToApproval(
        ctx(adminUser.id, company.id, "ADMIN"),
        instance.id,
        "step-approval",
        true,
      ),
    ).rejects.toThrow();
  });

  it("allows multiple roles in requiredApprovers", async () => {
    const { instance } = await createWaitingApprovalInstance(["ADMIN", "TREASURER"]);

    // ADMIN should work
    const result1 = await engine.respondToApproval(
      ctx(adminUser.id, company.id, "ADMIN"),
      instance.id,
      "step-approval",
      true,
    );
    expect(result1.approved).toBe(true);
  });

  it("rejects rejection from unauthorized role", async () => {
    const { instance } = await createWaitingApprovalInstance(["OWNER"]);

    await expect(
      engine.respondToApproval(
        ctx(memberUser.id, company.id, "MEMBER"),
        instance.id,
        "step-approval",
        false,
        "I disagree",
      ),
    ).rejects.toThrow("not authorized");
  });

  it("cross-tenant approval is blocked (existing check)", async () => {
    const otherCompany = await createCompany("Other Co");
    const otherUser = await createUser("other-admin@test.com");
    await createMembership(otherUser.id, otherCompany.id, "ADMIN");

    const { instance } = await createWaitingApprovalInstance(["ADMIN"]);

    // User from other company cannot approve
    await expect(
      engine.respondToApproval(
        ctx(otherUser.id, otherCompany.id, "ADMIN"),
        instance.id,
        "step-approval",
        true,
      ),
    ).rejects.toThrow("not found");
  });
});
