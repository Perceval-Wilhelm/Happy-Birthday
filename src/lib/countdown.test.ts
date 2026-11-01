import { describe, expect, it } from "vitest";
import { formatRemaining, remainingUntil } from "./countdown";

describe("countdown", () => {
  it("formats hours, minutes and seconds", () => {
    expect(formatRemaining(2 * 3600_000 + 13 * 60_000 + 45_000)).toBe("02:13:45");
  });

  it("rounds up so the last second still shows 00:00:01", () => {
    expect(formatRemaining(400)).toBe("00:00:01");
  });

  it("adds days when more than a day is left", () => {
    expect(formatRemaining(26 * 3600_000)).toBe("1 ngày 02:00:00");
  });

  it("measures the time left until an ISO moment with an offset", () => {
    const now = Date.parse("2026-11-01T23:59:00+07:00");
    expect(remainingUntil("2026-11-02T00:00:00+07:00", now)).toBe(60_000);
  });

  it("treats missing, past or invalid dates as already open", () => {
    expect(remainingUntil(null, 0)).toBe(0);
    expect(remainingUntil("2000-01-01T00:00:00Z", Date.now())).toBe(0);
    expect(remainingUntil("not a date", 0)).toBe(0);
  });
});
