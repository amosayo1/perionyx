"use client";

export type SidebarMode = "expanded" | "collapsed" | "mobile-open";

export interface NavigationContextValue {
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;
  toggleSidebar: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

export type SidebarSection = "favorites" | "recent" | "pinned" | "core" | "treasury" | "accounting" | "compliance" | "analytics" | "automation" | "administration" | "settings";

export interface SidebarGroup {
  id: SidebarSection;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  collapsible?: boolean;
}
