import { describe, it, expect } from 'vitest';
import { convertToDutyString } from "./userDutiesConverter";

describe("convertToDutyString", () => {
  it("returns an empty string for an empty array", () => {
    expect(convertToDutyString([])).toBe("");
  });

  it("returns an empty string for undefined", () => {
    expect(convertToDutyString(undefined as unknown as number[])).toBe("");
  });

  it("formats a single hour", () => {
    expect(convertToDutyString([5])).toBe("05:00-06:00");
  });

  it("formats consecutive hours as a single range", () => {
    expect(convertToDutyString([5, 6, 7])).toBe("05:00-08:00");
  });

  it("formats multiple non-consecutive ranges", () => {
    expect(convertToDutyString([0, 1, 17, 18])).toBe(
      "00:00-02:00; 17:00-19:00"
    );
  });

  it("sorts hours before formatting", () => {
    expect(convertToDutyString([18, 0, 17, 1])).toBe(
      "00:00-02:00; 17:00-19:00"
    );
  });

  it("handles completely separate hours", () => {
    expect(convertToDutyString([1, 3, 5])).toBe(
      "01:00-02:00; 03:00-04:00; 05:00-06:00"
    );
  });

  it("handles consecutive hours ending at 23", () => {
    expect(convertToDutyString([22, 23])).toBe("22:00-24:00");
  });

  it("handles a range followed by a single hour", () => {
    expect(convertToDutyString([1, 2, 3, 7])).toBe(
      "01:00-04:00; 07:00-08:00"
    );
  });

  it("handles a single hour followed by a range", () => {
    expect(convertToDutyString([1, 5, 6, 7])).toBe(
      "01:00-02:00; 05:00-08:00"
    );
  });
});