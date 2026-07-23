import type { UserPreferences, PersonalizationScope, ThemeMode, DensityMode, DateFormat, DashboardLayout } from "./types";
import { DEFAULT_USER_PREFERENCES } from "./types";

export interface PreferenceDefinition {
  key: string;
  label: string;
  description: string;
  type: "string" | "boolean" | "number" | "select" | "multi_select";
  scope: PersonalizationScope[];
  defaultValue: unknown;
  options?: { label: string; value: string }[];
  requiresRestart?: boolean;
}

export class EnterprisePreferenceRegistry {
  private definitions = new Map<string, PreferenceDefinition>();
  private roleDefaults = new Map<string, Partial<UserPreferences>>();
  private orgDefaults = new Map<string, Partial<UserPreferences>>();
  private deptDefaults = new Map<string, Partial<UserPreferences>>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    const defs: PreferenceDefinition[] = [
      { key: "theme", label: "Theme", description: "Visual theme", type: "select", scope: ["user", "organization"], defaultValue: "dark", options: [{ label: "Dark", value: "dark" }, { label: "Light", value: "light" }, { label: "System", value: "system" }] },
      { key: "density", label: "Density", description: "Content density", type: "select", scope: ["user", "organization"], defaultValue: "comfortable", options: [{ label: "Compact", value: "compact" }, { label: "Comfortable", value: "comfortable" }, { label: "Spacious", value: "spacious" }] },
      { key: "language", label: "Language", description: "Interface language", type: "select", scope: ["user", "organization"], defaultValue: "en", options: [{ label: "English", value: "en" }, { label: "Arabic", value: "ar" }] },
      { key: "dateFormat", label: "Date Format", description: "Date display format", type: "select", scope: ["user"], defaultValue: "YYYY-MM-DD", options: [{ label: "MM/DD/YYYY", value: "MM/DD/YYYY" }, { label: "DD/MM/YYYY", value: "DD/MM/YYYY" }, { label: "YYYY-MM-DD", value: "YYYY-MM-DD" }] },
      { key: "currency", label: "Currency", description: "Preferred currency", type: "select", scope: ["user", "organization"], defaultValue: "USD" },
      { key: "timezone", label: "Time Zone", description: "Display time zone", type: "select", scope: ["user"], defaultValue: "UTC" },
      { key: "landingPage", label: "Landing Page", description: "Default landing page after login", type: "select", scope: ["user", "role"], defaultValue: "/analytics" },
      { key: "dashboardLayout", label: "Dashboard Layout", description: "Default dashboard layout", type: "select", scope: ["user", "role", "organization"], defaultValue: "two_column", options: [{ label: "Single Column", value: "single" }, { label: "Two Column", value: "two_column" }, { label: "Three Column", value: "three_column" }, { label: "Grid", value: "grid" }, { label: "Freeform", value: "freeform" }] },
    ];

    for (const def of defs) {
      this.definitions.set(def.key, def);
    }
  }

  setRoleDefault(role: string, prefs: Partial<UserPreferences>): void {
    this.roleDefaults.set(role.toUpperCase(), prefs);
  }

  setOrgDefault(companyId: string, prefs: Partial<UserPreferences>): void {
    this.orgDefaults.set(companyId, prefs);
  }

  setDepartmentDefault(department: string, prefs: Partial<UserPreferences>): void {
    this.deptDefaults.set(department.toUpperCase(), prefs);
  }

  getDefinition(key: string): PreferenceDefinition | undefined {
    return this.definitions.get(key);
  }

  getAllDefinitions(): PreferenceDefinition[] {
    return Array.from(this.definitions.values());
  }

  getRoleDefault(role: string): Partial<UserPreferences> | undefined {
    return this.roleDefaults.get(role.toUpperCase());
  }

  getOrgDefault(companyId: string): Partial<UserPreferences> | undefined {
    return this.orgDefaults.get(companyId);
  }

  getDepartmentDefault(department: string): Partial<UserPreferences> | undefined {
    return this.deptDefaults.get(department.toUpperCase());
  }

  resolveDefaults(roles: string[], companyId: string, department?: string): UserPreferences {
    const prefs = { ...DEFAULT_USER_PREFERENCES };

    const orgDefault = this.getOrgDefault(companyId);
    if (orgDefault) Object.assign(prefs, orgDefault);

    if (department) {
      const deptDefault = this.getDepartmentDefault(department);
      if (deptDefault) Object.assign(prefs, deptDefault);
    }

    for (const role of roles) {
      const roleDefault = this.getRoleDefault(role);
      if (roleDefault) Object.assign(prefs, roleDefault);
    }

    return prefs;
  }
}

export const enterprisePreferenceRegistry = new EnterprisePreferenceRegistry();
