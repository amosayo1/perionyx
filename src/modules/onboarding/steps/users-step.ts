import { BaseStep } from "./base-step";
import type { OnboardingSession, ValidationResult, StepExecutionResult, StepProgress } from "../types";
import { prisma } from "@/server/db/prisma";
import { createInvite } from "@/modules/invites/invites.service";

interface UserInviteInput {
  email: string;
  role: string;
}

export class UsersStep extends BaseStep {
  readonly stepId = "users" as const;

  async validate(session: OnboardingSession): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    const memberCount = await prisma.companyMembership.count({
      where: { companyId: session.companyId },
    });

    if (memberCount === 0) {
      errors.push({ field: "users", message: "At least one user membership required", code: "MISSING_USERS" });
    }

    const inviteCount = await prisma.invitation.count({
      where: { companyId: session.companyId, status: "PENDING" },
    });

    if (memberCount < 2 && inviteCount === 0) {
      errors.push({
        field: "invitations",
        message: "Invite at least one team member or accept pending invitations",
        code: "MINIMUM_TEAM_SIZE",
      });
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  async execute(session: OnboardingSession): Promise<StepExecutionResult> {
    const metadata = session.metadata;
    const usersInput = (metadata.usersInput as UserInviteInput[]) ?? [];
    const invitedByUserId = (metadata.adminUserId as string) ?? "system";

    const inviteResults: Array<{ email: string; role: string; success: boolean; error?: string }> = [];

    for (const user of usersInput) {
      try {
        await createInvite({
          companyId: session.companyId,
          email: user.email,
          role: user.role,
          invitedByUserId,
        });
        inviteResults.push({ email: user.email, role: user.role, success: true });
      } catch (err: any) {
        inviteResults.push({ email: user.email, role: user.role, success: false, error: err?.message ?? "Invitation failed" });
      }
    }

    const members = await prisma.companyMembership.findMany({
      where: { companyId: session.companyId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const invites = await prisma.invitation.findMany({
      where: { companyId: session.companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return this.successResult({
      invitesSent: inviteResults.filter((r) => r.success).length,
      inviteFailures: inviteResults.filter((r) => !r.success).map((r) => ({ email: r.email, error: r.error })),
      memberCount: members.length,
      members: members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
      })),
      pendingInvites: invites
        .filter((i) => i.status === "PENDING")
        .map((i) => ({ email: i.email, role: i.role, token: i.token })),
      joinMethods: {
        email: true,
        orgCode: false,
        qrLink: false,
      },
      completedAt: new Date().toISOString(),
    });
  }

  getProgress(session: OnboardingSession): StepProgress {
    const completed = session.steps.find((s) => s.stepId === "users")?.status === "COMPLETED" ? 1 : 0;
    return { stepId: "users", completed, total: 1, label: "User onboarding" };
  }
}
