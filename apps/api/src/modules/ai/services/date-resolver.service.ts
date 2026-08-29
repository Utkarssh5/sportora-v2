export interface ResolvedDateRange {
  startDateFrom?: string;
  startDateTo?: string;
  needsClarification?: boolean;
  clarificationMessage?: string;
}

export class DateResolverService {
  public static resolve(
    expression: string,
    referenceDate = new Date()
  ): ResolvedDateRange {
    const value = expression.trim().toLowerCase();

    if (!value) {
      return {};
    }

    const base = new Date(referenceDate);
    base.setHours(0, 0, 0, 0);

    const format = (date: Date) =>
      date.toISOString();

    const range = (
      from: Date,
      to: Date
    ): ResolvedDateRange => ({
      startDateFrom: format(from),
      startDateTo: format(to),
    });

    // today / aaj
    if (
      value === "today" ||
      value === "aaj"
    ) {
      const to = new Date(base);
      to.setHours(23, 59, 59, 999);
      return range(base, to);
    }

    // tomorrow / kal
    if (
      value === "tomorrow" ||
      value === "kal"
    ) {
      const from = new Date(base);
      from.setDate(from.getDate() + 1);

      const to = new Date(from);
      to.setHours(23, 59, 59, 999);

      return range(from, to);
    }

    // yesterday
    if (value === "yesterday") {
      const from = new Date(base);
      from.setDate(from.getDate() - 1);

      const to = new Date(from);
      to.setHours(23, 59, 59, 999);

      return range(from, to);
    }

    // this week
    if (value === "this week") {
      const day = base.getDay();
      const mondayOffset =
        day === 0 ? -6 : 1 - day;

      const from = new Date(base);
      from.setDate(
        from.getDate() + mondayOffset
      );

      const to = new Date(from);
      to.setDate(to.getDate() + 6);
      to.setHours(23, 59, 59, 999);

      return range(from, to);
    }

    // next week
    if (value === "next week") {
      const day = base.getDay();
      const mondayOffset =
        day === 0 ? -6 : 1 - day;

      const from = new Date(base);
      from.setDate(
        from.getDate() + mondayOffset + 7
      );

      const to = new Date(from);
      to.setDate(to.getDate() + 6);
      to.setHours(23, 59, 59, 999);

      return range(from, to);
    }

    // this weekend
    if (
      value === "this weekend"
    ) {
      const day = base.getDay();

      const saturday = new Date(base);
      saturday.setDate(
        saturday.getDate() +
          (day === 0 ? -1 : 6 - day)
      );

      const sunday = new Date(saturday);
      sunday.setDate(
        sunday.getDate() + 1
      );
      sunday.setHours(23, 59, 59, 999);

      return range(
        saturday,
        sunday
      );
    }

    // next weekend
    if (
      value === "next weekend"
    ) {
      const day = base.getDay();

      const saturday = new Date(base);
      saturday.setDate(
        saturday.getDate() +
          (day === 0 ? 6 : 13 - day)
      );

      const sunday = new Date(saturday);
      sunday.setDate(
        sunday.getDate() + 1
      );
      sunday.setHours(23, 59, 59, 999);

      return range(
        saturday,
        sunday
      );
    }

    // this month
    if (
      value === "this month"
    ) {
      const from = new Date(
        base.getFullYear(),
        base.getMonth(),
        1
      );

      const to = new Date(
        base.getFullYear(),
        base.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      return range(from, to);
    }

    // next month
    if (
      value === "next month"
    ) {
      const from = new Date(
        base.getFullYear(),
        base.getMonth() + 1,
        1
      );

      const to = new Date(
        base.getFullYear(),
        base.getMonth() + 2,
        0,
        23,
        59,
        59,
        999
      );

      return range(from, to);
    }

    return {
      needsClarification: true,
      clarificationMessage:
        `I couldn't safely determine the date from "${expression}". Please provide a specific date or date range.`,
    };
  }
}
