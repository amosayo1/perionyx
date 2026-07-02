import crypto from "crypto";
import { prisma } from "@/server/db/prisma";
import { recordAudit } from "@/modules/audit/audit.service";
import { sendEmail } from "@/modules/notifications/channels/email";

export type CreateInviteInput = {
  companyId: string;
  email: string;
  role: string;
  invitedByUserId: string;
};

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createInvite(input: CreateInviteInput) {
  const existing = await prisma.invitation.findFirst({
    where: { email: input.email, companyId: input.companyId, status: "PENDING" },
  });
  if (existing) throw new Error("An active invitation already exists for this email");

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await prisma.invitation.create({
    data: {
      companyId: input.companyId,
      email: input.email.toLowerCase().trim(),
      role: input.role as any,
      token,
      invitedByUserId: input.invitedByUserId,
      expiresAt,
    },
  });

  await recordAudit(prisma, {
    companyId: input.companyId,
    actorUserId: input.invitedByUserId,
    action: "INVITATION_CREATED",
    resourceType: "Invitation",
    resourceId: invitation.id,
    metadata: { email: input.email, role: input.role },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const acceptUrl = `${baseUrl}/invite/${token}`;

  await sendEmail({
    to: input.email,
    subject: "You've been invited to join Perionyx",
    text: `You've been invited to join Perionyx. Click here to accept: ${acceptUrl}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #d4af37;">You're invited to Perionyx</h2>
        <p>You've been invited to join a workspace on Perionyx — a treasury operating system for modern finance teams.</p>
        <a href="${acceptUrl}" style="display: inline-block; background: #d4af37; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Accept Invitation
        </a>
        <p style="margin-top: 24px; font-size: 14px; color: #666;">This link expires in 7 days.</p>
      </div>
    `,
  });

  return invitation;
}

export async function listInvites(companyId: string) {
  return prisma.invitation.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: { invitedBy: { select: { id: true, email: true, name: true } } },
  });
}

export async function getInviteByToken(token: string) {
  return prisma.invitation.findUnique({
    where: { token },
    include: { company: { select: { id: true, name: true, slug: true } } },
  });
}

export async function acceptInvite(token: string, userId: string, userEmail?: string) {
  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation) throw new Error("Invitation not found");
  if (invitation.status !== "PENDING") throw new Error("Invitation is no longer valid");
  if (invitation.expiresAt < new Date()) throw new Error("Invitation has expired");

  const email = invitation.email.toLowerCase().trim();
  if (userEmail && userEmail.toLowerCase().trim() !== email) {
    throw new Error("This invitation was sent to a different email address.");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.companyMembership.findFirst({
      where: { userId, companyId: invitation.companyId },
    });
    if (existing) throw new Error("You are already a member of this company");

    await tx.companyMembership.create({
      data: {
        userId,
        companyId: invitation.companyId,
        role: invitation.role,
      },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        acceptedByUserId: userId,
        acceptedAt: new Date(),
      },
    });

    await recordAudit(tx, {
      companyId: invitation.companyId,
      actorUserId: userId,
      action: "INVITATION_ACCEPTED",
      resourceType: "Invitation",
      resourceId: invitation.id,
      metadata: { email },
    });

    return invitation.companyId;
  });
}
