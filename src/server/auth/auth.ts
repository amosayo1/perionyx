import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { verifyCredentials } from "@/modules/users/users.service";
import { logger } from "@/lib/logger";
import "@/modules/identity/register-defaults";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
if (!authSecret) {
  throw new Error("AUTH_SECRET or NEXTAUTH_SECRET must be set.");
}

const authUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;
export const useSecureCookie =
  process.env.NODE_ENV === "production" || authUrl?.startsWith("https://");
if (process.env.NODE_ENV === "production" && !authUrl) {
  logger.warn(
    "NEXTAUTH_URL is not set. In production, set NEXTAUTH_URL or AUTH_URL to the public application URL."
  );
}
export const sessionTokenName = useSecureCookie
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret: authSecret,
  cookies: {
    sessionToken: {
      name: sessionTokenName,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookie,
      },
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) return null;
          const result = await verifyCredentials(parsed.data.email, parsed.data.password);
          if (!result) return null;
          if ("locked" in result) {
            throw new Error(`ACCOUNT_LOCKED:${result.remainingMinutes}`);
          }
          return result;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const userId = user?.id ?? token.sub;
      if (!userId) {
        return token;
      }
      token.sub = userId;

      if (trigger === "update" && session) {
        const desired = (session as { activeCompanyId?: string | null }).activeCompanyId;
        if (desired) {
          const membership = await prisma.companyMembership.findFirst({
            where: { userId, companyId: desired },
          });
          if (membership) {
            token.activeCompanyId = membership.companyId;
            token.companyRole = membership.role;
            const company = await prisma.company.findUnique({ where: { id: membership.companyId }, select: { sandbox: true } });
            token.isSandbox = company?.sandbox ?? false;
          }
        } else {
          const membership = await prisma.companyMembership.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
          });
          token.activeCompanyId = membership?.companyId ?? null;
          token.companyRole = membership?.role ?? null;
          if (membership) {
            const company = await prisma.company.findUnique({ where: { id: membership.companyId }, select: { sandbox: true } });
            token.isSandbox = company?.sandbox ?? false;
          }
        }
        return token;
      }

      // On initial sign-in, query DB for membership — cached in JWT for subsequent requests
      if (user) {
        const membership = await prisma.companyMembership.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
        token.activeCompanyId = membership?.companyId ?? null;
        token.companyRole = membership?.role ?? null;
        if (membership) {
          const company = await prisma.company.findUnique({ where: { id: membership.companyId }, select: { sandbox: true } });
          token.isSandbox = company?.sandbox ?? false;
        }
        // Fetch tokenVersion for session invalidation support
        const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { tokenVersion: true } });
        token.tokenVersion = dbUser?.tokenVersion ?? 1;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.activeCompanyId =
          (token.activeCompanyId as string | null | undefined) ?? null;
        session.user.companyRole =
          (token.companyRole as string | null | undefined) ?? null;
        session.user.isSandbox =
          (token.isSandbox as boolean | undefined) ?? false;
        session.user.tokenVersion =
          (token.tokenVersion as number | undefined) ?? 1;
      }
      return session;
    },
  },
});
