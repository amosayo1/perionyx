import { prisma } from "@/server/db/prisma";

type InAppInput = {
  companyId: string;
  userId?: string | null;
  eventType: string;
  title: string;
  message?: string | null;
  metadata?: Record<string, any> | null;
  link?: string | null;
};

export async function sendInApp(input: InAppInput) {
  return prisma.notification.create({
    data: {
      companyId: input.companyId,
      userId: input.userId ?? null,
      eventType: input.eventType as any,
      title: input.title,
      message: input.message,
      metadata: (input.metadata ?? null) as any,
      link: input.link,
      channel: "IN_APP",
      sentAt: new Date(),
    },
  });
}
