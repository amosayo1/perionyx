"use client";

export function srAnnounce(message: string, priority: "polite" | "assertive" = "polite"): void {
  const id = priority === "assertive" ? "a11y-sr-assertive" : "a11y-sr-polite";
  let region = document.getElementById(id);
  if (!region) {
    region = document.createElement("div");
    region.id = id;
    region.setAttribute("aria-live", priority);
    region.setAttribute("aria-atomic", "true");
    region.className = "sr-only";
    document.body.appendChild(region);
  }
  region.textContent = "";
  requestAnimationFrame(() => {
    region!.textContent = message;
  });
}

export function srAnnounceError(message: string): void {
  srAnnounce(`Error: ${message}`, "assertive");
}

export function srAnnounceSuccess(message: string): void {
  srAnnounce(`Success: ${message}`, "polite");
}

export function srAnnounceLoading(message: string = "Loading, please wait"): void {
  srAnnounce(message, "assertive");
}

export function getAriaSort(sortDirection: "asc" | "desc" | "none"): "ascending" | "descending" | "none" {
  if (sortDirection === "asc") return "ascending";
  if (sortDirection === "desc") return "descending";
  return "none";
}

export function announcePageChange(page: number, total: number): void {
  srAnnounce(`Page ${page} of ${total}`, "polite");
}

export function announceFilterChange(filterName: string, value: string): void {
  srAnnounce(`${filterName} filter set to ${value}`, "polite");
}

export function announceSelection(count: number, total: number): void {
  if (count === 0) srAnnounce("No items selected", "polite");
  else if (count === total) srAnnounce(`All ${total} items selected`, "polite");
  else srAnnounce(`${count} of ${total} items selected`, "polite");
}

export function announceSort(column: string, direction: "asc" | "desc"): void {
  srAnnounce(`Table sorted by ${column}, ${direction === "asc" ? "ascending" : "descending"}`, "polite");
}

export function announceRowCount(count: number): void {
  srAnnounce(`${count} rows`, "polite");
}
