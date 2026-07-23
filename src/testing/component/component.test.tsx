import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Component Tests", () => {
  it("should render with required props", () => {
    const Component = ({ title, children }: { title: string; children: React.ReactNode }) => (
      <div>
        <h1>{title}</h1>
        {children}
      </div>
    );
    const { container } = render(
      <Component title="Test">Content</Component>,
    );
    expect(container.querySelector("h1")?.textContent).toBe("Test");
    expect(container.textContent).toContain("Content");
  });

  it("should handle optional props", () => {
    const Component = ({ label, disabled }: { label: string; disabled?: boolean }) => (
      <button disabled={disabled}>{label}</button>
    );
    const { container } = render(<Component label="Click" />);
    expect(container.querySelector("button")).toBeTruthy();
  });

  it("should handle events", () => {
    let clicked = false;
    const Component = ({ onClick }: { onClick: () => void }) => (
      <button onClick={onClick}>Click</button>
    );
    render(<Component onClick={() => { clicked = true; }} />);
    screen.getByText("Click").click();
    expect(clicked).toBe(true);
  });
});
