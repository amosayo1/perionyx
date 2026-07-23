import type { NavigationSuggestion, ModuleFrequency } from "./types";
import { ROLE_NAVIGATION_PRIORITY } from "./types";
import { userBehaviorAnalyzer } from "./user-behavior-analyzer";

export class NavigationOptimizer {
  optimize(
    userId: string,
    companyId: string,
    roles: string[],
    allModules: { id: string; label: string; url: string }[],
  ): NavigationSuggestion[] {
    const scored = new Map<string, NavigationSuggestion>();

    for (const module of allModules) {
      scored.set(module.id, {
        module: module.id,
        label: module.label,
        score: 0,
        reason: "Default",
        url: module.url,
      });
    }

    for (const role of roles) {
      const roleModules = this.getRolePriority(role);
      for (let i = 0; i < roleModules.length; i++) {
        const existing = scored.get(roleModules[i]);
        if (existing) {
          existing.score += (roleModules.length - i) * 10;
          existing.reason = `High priority for your role`;
        }
      }
    }

    const frequentModules = userBehaviorAnalyzer.getFrequentModules(userId, companyId);
    for (const fm of frequentModules) {
      const existing = scored.get(fm.module);
      if (existing) {
        existing.score += Math.min(fm.visits, 50);
        existing.reason = `Frequently visited (${fm.visits} times)`;
      }
    }

    return Array.from(scored.values())
      .sort((a, b) => b.score - a.score);
  }

  getTopModules(
    userId: string,
    companyId: string,
    roles: string[],
    limit = 6,
  ): string[] {
    const roleModules = this.getRolePriority(roles[0] ?? "");
    const baseModules = roleModules.slice(0, limit);

    const behaviorModules = userBehaviorAnalyzer.getFrequentModuleNames(userId, companyId);
    for (const mod of behaviorModules) {
      if (!baseModules.includes(mod) && baseModules.length < limit) {
        baseModules.push(mod);
      }
    }

    return baseModules;
  }

  private getRolePriority(role: string): string[] {
    const upperRole = role.toUpperCase().replace(/\s+/g, "_");
    return ROLE_NAVIGATION_PRIORITY[upperRole] ?? [];
  }
}

export const navigationOptimizer = new NavigationOptimizer();
