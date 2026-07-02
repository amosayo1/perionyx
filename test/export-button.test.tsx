// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExportButton } from "../src/components/export/ExportButton";

describe("ExportButton", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    global.URL.createObjectURL = vi.fn(() => "blob:test");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with default label", () => {
    render(<ExportButton type="accounts" />);
    expect(screen.getByText("Export CSV")).toBeDefined();
  });

  it("renders with custom label", () => {
    render(<ExportButton type="accounts" label="Download" />);
    expect(screen.getByText("Download")).toBeDefined();
  });

  it("calls fetch on click", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });
    render(<ExportButton type="transactions" />);
    fireEvent.click(screen.getByText("Export CSV"));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/export?type=transactions"),
        expect.objectContaining({ credentials: "include" }),
      );
    });
  });

  it("shows loading state during export", async () => {
    (global.fetch as any).mockImplementationOnce(() => new Promise(() => {}));
    render(<ExportButton type="accounts" />);
    fireEvent.click(screen.getByText("Export CSV"));
    expect(await screen.findByText("Exporting...")).toBeDefined();
  });

  it("handles failed export gracefully", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));
    render(<ExportButton type="accounts" />);
    fireEvent.click(screen.getByText("Export CSV"));
    await waitFor(() => {
      expect(screen.getByText("Export CSV")).toBeDefined();
    });
  });
});
