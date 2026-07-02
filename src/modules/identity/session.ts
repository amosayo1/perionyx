export interface IdentitySession {
  userId: string;
  email: string;
  name: string | null;
  companyId: string;
  role: string;
  permissions: string[];
  providerKind: string;
  providerId: string;
  impersonating?: boolean;
}

export function createSession(params: {
  userId: string;
  email: string;
  name: string | null;
  companyId: string;
  role: string;
  permissions: string[];
  providerKind?: string;
  providerId?: string;
}): IdentitySession {
  return {
    userId: params.userId,
    email: params.email,
    name: params.name,
    companyId: params.companyId,
    role: params.role,
    permissions: params.permissions,
    providerKind: params.providerKind ?? "local",
    providerId: params.providerId ?? params.userId,
  };
}
