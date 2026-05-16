// Immutable representation of the 5 cron fields + optional timezone
export type CronState = {
  readonly minute: string;
  readonly hour: string;
  readonly dayOfMonth: string;
  readonly month: string;
  readonly dayOfWeek: string;
  readonly timezone?: string;
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
  readonly tz: (timezone: string) => CronChain;
  readonly exceptDays: (...days: (string | number)[]) => CronChain;
  readonly exceptMonths: (...months: (string | number)[]) => CronChain;
  readonly toCron: () => string;
  readonly toObject: () => CronExpression;
  readonly nextRuns: (count?: number, from?: Date) => Date[];
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

// Returned by toObject() — includes timezone when set
export type CronExpression = {
  readonly expression: string;
  readonly timezone?: string;
};

// Options for nextRuns() — backward compatible (3rd arg can be Date or options)
export type NextRunsOptions = {
  readonly from?: Date;
  readonly timezone?: string;
};
