import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DateResolverService,
} from "../date-resolver.service.js";

const reference =
  new Date("2026-08-24T12:00:00.000Z");

describe("DateResolverService", () => {
  it("resolves today", () => {
    const result =
      DateResolverService.resolve(
        "today",
        reference
      );

    expect(result.needsClarification)
      .toBeUndefined();

    expect(result.startDateFrom)
      .toBe("2026-08-24T00:00:00.000Z");

    expect(result.startDateTo)
      .toBe("2026-08-24T23:59:59.999Z");
  });

  it("resolves tomorrow", () => {
    const result =
      DateResolverService.resolve(
        "tomorrow",
        reference
      );

    expect(result.startDateFrom)
      .toBe("2026-08-25T00:00:00.000Z");

    expect(result.startDateTo)
      .toBe("2026-08-25T23:59:59.999Z");
  });

  it("resolves Hindi aaj", () => {
    const result =
      DateResolverService.resolve(
        "aaj",
        reference
      );

    expect(result.startDateFrom)
      .toBe("2026-08-24T00:00:00.000Z");
  });

  it("resolves Hindi kal", () => {
    const result =
      DateResolverService.resolve(
        "kal",
        reference
      );

    expect(result.startDateFrom)
      .toBe("2026-08-25T00:00:00.000Z");
  });

  it("resolves this week", () => {
    const result =
      DateResolverService.resolve(
        "this week",
        reference
      );

    expect(result.startDateFrom)
      .toBe("2026-08-24T00:00:00.000Z");

    expect(result.startDateTo)
      .toBe("2026-08-30T23:59:59.999Z");
  });

  it("resolves next week", () => {
    const result =
      DateResolverService.resolve(
        "next week",
        reference
      );

    expect(result.startDateFrom)
      .toBe("2026-08-31T00:00:00.000Z");

    expect(result.startDateTo)
      .toBe("2026-09-06T23:59:59.999Z");
  });

  it("resolves this weekend", () => {
    const result =
      DateResolverService.resolve(
        "this weekend",
        reference
      );

    expect(result.startDateFrom)
      .toBe("2026-08-29T00:00:00.000Z");

    expect(result.startDateTo)
      .toBe("2026-08-30T23:59:59.999Z");
  });

  it("resolves next weekend", () => {
    const result =
      DateResolverService.resolve(
        "next weekend",
        reference
      );

    expect(result.startDateFrom)
      .toBe("2026-09-05T00:00:00.000Z");

    expect(result.startDateTo)
      .toBe("2026-09-06T23:59:59.999Z");
  });

  it("asks for clarification on ambiguous dates", () => {
    const result =
      DateResolverService.resolve(
        "sometime soon",
        reference
      );

    expect(result.needsClarification)
      .toBe(true);
  });
});
