import { describe, expect, it } from "vitest";
import { formatKstDate } from "./date";

describe("formatKstDate", () => {
  it("UTC 일시를 한국 날짜로 바꾼다", () => {
    expect(formatKstDate("2026-11-02T05:30:00Z")).toBe("2026년 11월 2일");
  });

  it("UTC 기준 전날 저녁이 한국에서는 다음 날이 된다", () => {
    expect(formatKstDate("2026-11-01T16:00:00Z")).toBe("2026년 11월 2일");
  });

  it("ISO 8601이 아니면 예외를 던진다", () => {
    expect(() => formatKstDate("어제")).toThrow(RangeError);
  });
});
