import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("블로그 제목을 보여준다", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: "개발 노트" })).toBeInTheDocument();
  });
});
