import type { AssistantResponse, UserContext, Citation, SuggestedAction, EntityRef } from "./types";

export class PermissionAwareResponder {
  filterResponse(
    response: AssistantResponse,
    user: UserContext,
  ): AssistantResponse {
    const rolePermissions = this.getRoleAccess(user.roles);

    const filteredCitations = response.citations.filter((c) => {
      return this.hasModuleAccess(c.module, rolePermissions);
    });

    const filteredActions = response.suggestedActions.filter((a) => {
      return this.hasActionAccess(a, rolePermissions);
    });

    const filteredEntities = response.context.entitiesReferenced.filter((e) => {
      return this.hasEntityAccess(e, rolePermissions);
    });

    return {
      ...response,
      citations: filteredCitations,
      suggestedActions: filteredActions,
      context: {
        ...response.context,
        entitiesReferenced: filteredEntities,
      },
    };
  }

  checkPermission(
    module: string,
    user: UserContext,
  ): "PASS" | "BLOCK" | "PARTIAL" {
    const permissions = this.getRoleAccess(user.roles);

    if (permissions.has("admin")) return "PASS";

    if (permissions.has("all_modules")) return "PASS";

    if (permissions.has(`module:${module}`)) return "PASS";

    const restrictedModules = ["audit", "compliance", "risk"];
    if (restrictedModules.includes(module)) {
      return permissions.has(`module:${module}`) ? "PASS" : "BLOCK";
    }

    return "PARTIAL";
  }

  private getRoleAccess(roles: string[]): Set<string> {
    const access = new Set<string>();

    const rolePermissions: Record<string, string[]> = {
      CFO: ["all_modules", "module:treasury", "module:payments", "module:analytics", "module:reports", "module:approvals", "module:policies", "module:risk"],
      Treasurer: ["module:treasury", "module:payments", "module:approvals", "module:analytics"],
      Controller: ["module:compliance", "module:audit", "module:reports", "module:risk", "module:approvals"],
      FinanceManager: ["module:payments", "module:approvals", "module:workflows", "module:reports"],
      Auditor: ["module:audit", "module:compliance", "module:policies", "module:risk"],
      Administrator: ["admin"],
      Operations: ["module:workflows", "module:automation", "module:notifications", "module:users"],
    };

    for (const role of roles) {
      const perms = rolePermissions[role];
      if (perms) {
        for (const p of perms) access.add(p);
      }
    }

    return access;
  }

  private hasModuleAccess(module: string, permissions: Set<string>): boolean {
    if (permissions.has("admin") || permissions.has("all_modules")) return true;
    return permissions.has(`module:${module.toLowerCase()}`);
  }

  private hasActionAccess(_action: SuggestedAction, _permissions: Set<string>): boolean {
    return true;
  }

  private hasEntityAccess(_entity: EntityRef, _permissions: Set<string>): boolean {
    return true;
  }
}

export const permissionAwareResponder = new PermissionAwareResponder();
