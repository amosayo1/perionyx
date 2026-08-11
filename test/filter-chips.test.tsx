// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterChips } from "../src/components/work-queue/filter-chips";

const mockReplace = vi.fn();
const mockUseSearchParams = vi.fn(() => new URLSearchParams(""));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/work-queue",
}));

describe("FilterChips", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockUseSearchParams.mockClear();
    mockUseSearchParams.mockReturnValue(new URLSearchParams(""));
  });

  const chips = [
    { value: "high-priority", label: "High Priority", count: 5 },
    { value: "medium-priority", label: "Medium Priority", count: 3 },
    { value: "quick-approvals", label: "Quick Approvals", count: 8 },
  ];

  it("renders all chips", () => {
    render(<FilterChips chips={chips} />);
    expect(screen.getByText("High Priority")).toBeDefined();
    expect(screen.getByText("Medium Priority")).toBeDefined();
    expect(screen.getByText("Quick Approvals")).toBeDefined();
  });

  it("displays counts when provided", () => {
    render(<FilterChips chips={chips} />);
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("8")).toBeDefined();
  });

  it("does not render count badge when count is undefined", () => {
    const noCountChips = [{ value: "all", label: "All Items" }];
    render(<FilterChips chips={noCountChips} />);
    expect(screen.getByText("All Items")).toBeDefined();
  });

  it("highlights active chip", () => {
    mockUseSearchParams.mockReturnValueOnce(new URLSearchParams("filter=high-priority"));
    render(<FilterChips chips={chips} />);
    const activeChip = screen.getByText("High Priority");
    expect(activeChip.className).toContain("bg-gold");
  });

  it("calls router.replace with filter param on click", () => {
    render(<FilterChips chips={chips} />);
    fireEvent.click(screen.getByText("High Priority"));
    expect(mockReplace).toHaveBeenCalledWith("/work-queue?filter=high-priority");
  });

  it("removes filter param when clicking active chip", () => {
    mockUseSearchParams.mockReturnValueOnce(new URLSearchParams("filter=high-priority"));
    render(<FilterChips chips={chips} />);
    fireEvent.click(screen.getByText("High Priority"));
    expect(mockReplace).toHaveBeenCalledWith("/work-queue?");
  });

  it("clears page param when filter changes", () => {
    mockUseSearchParams.mockReturnValueOnce(new URLSearchParams("filter=high-priority&page=3"));
    render(<FilterChips chips={chips} />);
    fireEvent.click(screen.getByText("Medium Priority"));
    expect(mockReplace).toHaveBeenCalledWith("/work-queue?filter=medium-priority");
  });
});
