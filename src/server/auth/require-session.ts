import type { Session } from "next-auth";
import { auth } from "@/server/auth/auth";
import { UnauthorizedError } from "@/lib/errors/app-error";

export type SessionWithUserId = Session & {
  user: NonNullable<Session["user"]> & { id: string };
};

export async function requireSession(): Promise<SessionWithUserId> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError("Authentication required.");
  }
  return session as SessionWithUserId;
}
