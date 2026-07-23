import type { DefaultSession } from "next-auth";

declare global {
  var __perionyx_startedAt: number | undefined;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      activeCompanyId: string | null;
      companyRole: string | null;
      isSandbox: boolean;
      tokenVersion?: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    activeCompanyId?: string | null;
    companyRole?: string | null;
    isSandbox?: boolean;
    tokenVersion?: number;
  }
}
