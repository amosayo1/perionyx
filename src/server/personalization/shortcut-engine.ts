import type { ShortcutSuggestion } from "./types";
import { userBehaviorAnalyzer } from "./user-behavior-analyzer";

export class ShortcutEngine {
  suggest(
    userId: string,
    companyId: string,
    roles: string[],
    currentPage?: string,
  ): ShortcutSuggestion[] {
    const suggestions: ShortcutSuggestion[] = [];
    const seen = new Set<string>();

    const roleShortcuts = this.getRoleShortcuts(roles, currentPage);
    for (const s of roleShortcuts) {
      if (!seen.has(s.id)) {
        suggestions.push(s);
        seen.add(s.id);
      }
    }

    const behaviorShortcuts = this.getBehaviorShortcuts(userId, companyId, currentPage);
    for (const s of behaviorShortcuts) {
      if (!seen.has(s.id)) {
        suggestions.push(s);
        seen.add(s.id);
      }
    }

    return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private getRoleShortcuts(roles: string[], _currentPage?: string): ShortcutSuggestion[] {
    const shortcuts: ShortcutSuggestion[] = [];
    const allRole = roles.map((r) => r.toUpperCase().replace(/\s+/g, "_"));

    if (allRole.includes("CFO")) {
      shortcuts.push(
        { id: "sc-cfo-cash", label: "Cash Position", action: "navigate", url: "/treasury", module: "treasury", score: 0.9, context: "CFO priority" },
        { id: "sc-cfo-forecast", label: "Forecast", action: "navigate", url: "/analytics", module: "analytics", score: 0.8, context: "CFO priority" },
        { id: "sc-cfo-briefing", label: "Executive Briefing", action: "navigate", url: "/briefings", module: "executive_intelligence", score: 0.7, context: "CFO priority" },
      );
    }
    if (allRole.includes("TREASURER")) {
      shortcuts.push(
        { id: "sc-treas-liquidity", label: "Liquidity Overview", action: "navigate", url: "/treasury", module: "treasury", score: 0.9, context: "Treasurer priority" },
        { id: "sc-treas-payments", label: "Payment Queue", action: "navigate", url: "/payments", module: "payments", score: 0.8, context: "Treasurer priority" },
      );
    }
    if (allRole.includes("CONTROLLER")) {
      shortcuts.push(
        { id: "sc-ctrl-recon", label: "Reconciliation", action: "navigate", url: "/reconciliation", module: "treasury", score: 0.9, context: "Controller priority" },
        { id: "sc-ctrl-monthend", label: "Month-End Progress", action: "navigate", url: "/reports", module: "reports", score: 0.8, context: "Controller priority" },
      );
    }
    if (allRole.includes("AUDITOR")) {
      shortcuts.push(
        { id: "sc-aud-trail", label: "Audit Trail", action: "navigate", url: "/audit", module: "audit", score: 0.9, context: "Auditor priority" },
        { id: "sc-aud-compliance", label: "Compliance", action: "navigate", url: "/compliance", module: "compliance", score: 0.8, context: "Auditor priority" },
      );
    }

    shortcuts.push(
      { id: "sc-approvals", label: "Pending Approvals", action: "navigate", url: "/approvals", module: "approvals", score: 0.6, context: "Common action" },
      { id: "sc-search", label: "Search", action: "navigate", url: "/search", module: "search", score: 0.5, context: "Quick access" },
    );

    return shortcuts;
  }

  private getBehaviorShortcuts(userId: string, companyId: string, _currentPage?: string): ShortcutSuggestion[] {
    const shortcuts: ShortcutSuggestion[] = [];
    const frequentModules = userBehaviorAnalyzer.getFrequentModuleNames(userId, companyId);

    for (const mod of frequentModules.slice(0, 3)) {
      shortcuts.push({
        id: `sc-behav-${mod}`,
        label: mod.charAt(0).toUpperCase() + mod.slice(1),
        action: "navigate",
        url: `/${mod}`,
        module: mod,
        score: 0.5,
        context: "Frequently used",
      });
    }

    return shortcuts;
  }
}

export const shortcutEngine = new ShortcutEngine();
