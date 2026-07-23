import type { BrandingConfig } from "../types";
import { DEFAULT_BRANDING } from "../defaults";
import { validateAccentColor } from "../ThemeValidator";
import type { ThemeValidationError } from "../types";

const brandingStore = new Map<string, BrandingConfig>();

export function getBranding(organizationId: string): BrandingConfig {
  return brandingStore.get(organizationId) || { ...DEFAULT_BRANDING };
}

export function setBranding(
  organizationId: string,
  branding: BrandingConfig,
): ThemeValidationError[] {
  const errors: ThemeValidationError[] = [];

  const accentErrors = validateAccentColor(branding.brandAccent);
  errors.push(...accentErrors);

  const secondaryErrors = validateAccentColor(branding.secondaryAccent);
  errors.push(...secondaryErrors);

  if (!branding.organizationName || branding.organizationName.trim().length === 0) {
    errors.push({
      property: "organizationName",
      message: "Organization name is required",
    });
  }

  if (branding.organizationName.length > 100) {
    errors.push({
      property: "organizationName",
      message: "Organization name must be 100 characters or fewer",
    });
  }

  if (errors.length > 0) return errors;

  brandingStore.set(organizationId, branding);
  return [];
}

export function deleteBranding(organizationId: string): boolean {
  return brandingStore.delete(organizationId);
}

export function getAllBranding(): { organizationId: string; config: BrandingConfig }[] {
  return Array.from(brandingStore.entries()).map(([organizationId, config]) => ({
    organizationId,
    config,
  }));
}

export function validateBrandingConfig(
  branding: Partial<BrandingConfig>,
): ThemeValidationError[] {
  const errors: ThemeValidationError[] = [];

  if (branding.brandAccent) {
    errors.push(...validateAccentColor(branding.brandAccent));
  }
  if (branding.secondaryAccent) {
    errors.push(...validateAccentColor(branding.secondaryAccent));
  }
  if (branding.organizationName !== undefined) {
    if (branding.organizationName.trim().length === 0) {
      errors.push({
        property: "organizationName",
        message: "Organization name cannot be empty",
      });
    }
    if (branding.organizationName.length > 100) {
      errors.push({
        property: "organizationName",
        message: "Organization name must be 100 characters or fewer",
      });
    }
  }

  return errors;
}

export function brandDisplayName(organizationId?: string): string {
  if (!organizationId) return "PERIONYX";
  const branding = brandingStore.get(organizationId);
  return branding?.organizationName || "PERIONYX";
}
