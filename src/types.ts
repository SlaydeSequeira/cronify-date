// Immutable representation of the 5 cron fields: minute hour dom month dow
export type CronState = {
  readonly minute: string;
  readonly hour: string;
  readonly dayOfMonth: string;
  readonly month: string;
  readonly dayOfWeek: string;
};

// Fluent API — each method returns a new CronChain (immutable chaining)
export type CronChain = {
  readonly at: (time: string) => CronChain;
  readonly on: (...days: (string | number)[]) => CronChain;
  readonly onDay: (...days: number[]) => CronChain;
  readonly inMonth: (...months: (string | number)[]) => CronChain;
  readonly times: (...timeList: string[]) => CronChain;
  readonly between: (start: number, end: number) => RangeChain;
  readonly betweenTimes: (start: string, end: string) => CronChain;
  readonly toCron: () => string;
  readonly toString: () => string;
};

// Intermediate returned by between() — pick a field, then resume chaining
export type RangeChain = {
  readonly hours: (step?: number) => CronChain;
  readonly minutes: (step?: number) => CronChain;
  readonly daysOfMonth: (step?: number) => CronChain;
  readonly months: (step?: number) => CronChain;
  readonly daysOfWeek: (step?: number) => CronChain;
};
