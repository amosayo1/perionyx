import type { UserPreferences, DensityMode, ThemeMode, DashboardLayout } from "./types";

export interface LayoutConfig {
  theme: ThemeMode;
  density: DensityMode;
  sidebarWidth: number;
  fontSize: number;
  spacing: number;
  showLabels: boolean;
  dashboardLayout: DashboardLayout;
}

export class AdaptiveLayoutEngine {
  resolve(prefs: UserPreferences): LayoutConfig {
    return {
      theme: prefs.theme,
      density: prefs.density,
      sidebarWidth: this.getSidebarWidth(prefs.density),
      fontSize: this.getFontSize(prefs.density),
      spacing: this.getSpacing(prefs.density),
      showLabels: prefs.density !== "compact",
      dashboardLayout: prefs.dashboardLayout,
    };
  }

  getDefaultLayout(): LayoutConfig {
    return {
      theme: "dark",
      density: "comfortable",
      sidebarWidth: 240,
      fontSize: 14,
      spacing: 16,
      showLabels: true,
      dashboardLayout: "two_column",
    };
  }

  private getSidebarWidth(density: DensityMode): number {
    switch (density) {
      case "compact": return 200;
      case "comfortable": return 240;
      case "spacious": return 280;
    }
  }

  private getFontSize(density: DensityMode): number {
    switch (density) {
      case "compact": return 12;
      case "comfortable": return 14;
      case "spacious": return 16;
    }
  }

  private getSpacing(density: DensityMode): number {
    switch (density) {
      case "compact": return 8;
      case "comfortable": return 16;
      case "spacious": return 24;
    }
  }
}

export const adaptiveLayoutEngine = new AdaptiveLayoutEngine();
