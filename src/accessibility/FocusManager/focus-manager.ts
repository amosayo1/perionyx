"use client";

export interface FocusManagerState {
  trapActive: boolean;
  trapElement: HTMLElement | null;
  lastFocusedElement: HTMLElement | null;
}

export function useFocusRing(visible: "always" | "keyboardOnly"): string {
  if (visible === "always") {
    return "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";
  }
  return "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";
}

export function trapFocus(element: HTMLElement, event: KeyboardEvent): void {
  const focusable = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.key === "Tab") {
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (event.key === "Escape") {
    event.preventDefault();
    const closeButton = element.querySelector<HTMLElement>('[aria-label="Close"]');
    closeButton?.click();
  }
}

export function restoreFocus(element: HTMLElement | null): void {
  if (element && typeof element.focus === "function") {
    element.focus({ preventScroll: true });
  }
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function focusFirstElement(container: HTMLElement): void {
  const elements = getFocusableElements(container);
  if (elements.length > 0) elements[0].focus();
}

export function focusLastElement(container: HTMLElement): void {
  const elements = getFocusableElements(container);
  if (elements.length > 0) elements[elements.length - 1].focus();
}
