export type ThemeMode = "light" | "dark" | "high-contrast" | "executive";

export type ThemeCategory = "system" | "tenant" | "workspace" | "custom";

export type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

export interface HexColor {
  hex: string;
}

export interface ThemeAccentPalette {
  base: string;
  hover: string;
  pressed: string;
  focus: string;
  muted: string;
  subtle: string;
  onAccent: string;
}

export interface ThemeBackgroundPalette {
  primary: string;
  secondary: string;
  surface: string;
  panel: string;
  panelStrong: string;
  elevated: string;
  atmosphere: string;
}

export interface ThemeBorderPalette {
  default: string;
  soft: string;
  muted: string;
  strong: string;
}

export interface ThemeTextPalette {
  primary: string;
  muted: string;
  subtle: string;
  faint: string;
  inverse: string;
  link: string;
}

export interface ThemeStatusPalette {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeChartPalette {
  colors: string[];
}

export interface ThemeShadowPalette {
  soft: string;
  panel: string;
  large: string;
  popover: string;
  modal: string;
}

export interface ThemeTypographyConfig {
  fontFamily: string;
  fontSizeBase: string;
  headingFont: string;
  monospaceFont: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  mode: ThemeMode;
  category: ThemeCategory;
  accent: ThemeAccentPalette;
  backgrounds: ThemeBackgroundPalette;
  borders: ThemeBorderPalette;
  text: ThemeTextPalette;
  status: ThemeStatusPalette;
  charts: ThemeChartPalette;
  shadows: ThemeShadowPalette;
  typography: ThemeTypographyConfig;
  borderRadius: string;
}

export interface BrandingConfig {
  logoUrl: string;
  iconUrl: string;
  organizationName: string;
  brandAccent: string;
  secondaryAccent: string;
  typography: {
    headingFont: string;
    bodyFont: string;
    monospaceFont: string;
  };
  loginBackground: string;
  welcomeBanner: string;
  emailBranding: {
    primaryColor: string;
    logoUrl: string;
    footerText: string;
  };
  pdfBranding: {
    primaryColor: string;
    logoUrl: string;
    footerText: string;
  };
  reportBranding: {
    primaryColor: string;
    logoUrl: string;
    coverPageBackground: string;
  };
  invoiceBranding: {
    primaryColor: string;
    logoUrl: string;
    accentColor: string;
  };
  workspaceBranding: {
    bannerColor: string;
    bannerTextColor: string;
  };
}

export interface TenantTheme {
  id: string;
  organizationId: string;
  workspaceId?: string;
  name: string;
  mode: ThemeMode;
  branding?: BrandingConfig;
  overrides?: Partial<ThemeConfig>;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ThemePreference {
  userId?: string;
  organizationId?: string;
  workspaceId?: string;
  themeId: string;
  mode: ThemeMode;
  accentColor?: string;
  reducedMotion: boolean;
  highContrast: boolean;
  fontScaling: number;
}

export type ThemePreferenceLevel = "user" | "organization" | "workspace" | "system";

export interface ThemePreviewState {
  active: boolean;
  previewTheme: ThemeConfig | null;
  originalTheme: ThemeConfig | null;
}

export interface ThemeValidationError {
  property: string;
  message: string;
  wcagCriterion?: string;
  currentValue?: string;
  suggestedValue?: string;
}

export interface ThemeValidationResult {
  valid: boolean;
  errors: ThemeValidationError[];
  warnings: ThemeValidationError[];
  score: number;
}

export type ThemeEventType = "applied" | "switched" | "preview" | "published" | "reset";

export interface ThemeEvent {
  type: ThemeEventType;
  themeId: string;
  userId?: string;
  organizationId?: string;
  timestamp: number;
  previousThemeId?: string;
}
