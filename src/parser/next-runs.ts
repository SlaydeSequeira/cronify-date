import type { NextRunsOptions } from '../types.js';
import { validate } from './validate.js';
import { expandMacro } from '../utils/constants.js';
import { expandFieldValues } from '../utils/helpers.js';
import { Minute, Hour, DayOfMonth, Month, DayOfWeek, Cron } from '../constants/index.js';

export const nextRuns = (
  cron: string,
  count: number = Cron.DefaultNextRunCount,
  fromOrOptions?: Date | NextRunsOptions,
): Date[] => {
  validate(cron);
  const expanded = expandMacro(cron);
  const parts = expanded.trim().split(/\s+/);

  let from: Date;
  let timezone: string | undefined;

  if (fromOrOptions instanceof Date) {
    from = fromOrOptions;
  } else if (fromOrOptions) {
    from = fromOrOptions.from ?? new Date();
    timezone = fromOrOptions.timezone;
  } else {
    from = new Date();
  }

  const matcher = buildMatcher(parts);
  const results: Date[] = [];
  const current = new Date(from);
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  for (let i = 0; i < Cron.MaxIterations && results.length < count; i++) {
    const dateParts = timezone ? getPartsInTz(current, timezone) : getLocalParts(current);
    if (matcher(dateParts)) {
      results.push(new Date(current));
    }
    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
};

export const nextRunsUnion = (
  crons: string[],
  count: number = Cron.DefaultNextRunCount,
  fromOrOptions?: Date | NextRunsOptions,
): Date[] => {
  const allRuns: Date[] = [];
  for (const cron of crons) {
    allRuns.push(...nextRuns(cron, count, fromOrOptions));
  }

  allRuns.sort((a, b) => a.getTime() - b.getTime());

  const seen = new Set<number>();
  const result: Date[] = [];
  for (const d of allRuns) {
    const t = d.getTime();
    if (!seen.has(t)) {
      seen.add(t);
      result.push(d);
    }
    if (result.length >= count) break;
  }

  return result;
};

type DateParts = { minute: number; hour: number; day: number; month: number; dow: number };

const getLocalParts = (d: Date): DateParts => ({
  minute: d.getMinutes(),
  hour: d.getHours(),
  day: d.getDate(),
  month: d.getMonth() + 1,
  dow: d.getDay(),
});

const getPartsInTz = (d: Date, tz: string): DateParts => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(d);

  const get = (type: string): number => {
    const p = parts.find(part => part.type === type);
    return p ? Number(p.value) : 0;
  };

  const hour = get('hour');

  const dowStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(d);
  const dowMap: Record<string, number> = {
    Sun: DayOfWeek.Sunday,
    Mon: DayOfWeek.Monday,
    Tue: DayOfWeek.Tuesday,
    Wed: DayOfWeek.Wednesday,
    Thu: DayOfWeek.Thursday,
    Fri: DayOfWeek.Friday,
    Sat: DayOfWeek.Saturday,
  };

  return {
    minute: get('minute'),
    hour: hour === Cron.MidnightHour ? 0 : hour,
    day: get('day'),
    month: get('month'),
    dow: dowMap[dowStr] ?? DayOfWeek.Sunday,
  };
};

const buildMatcher = (parts: string[]): (d: DateParts) => boolean => {
  const [minExpr, hourExpr, domExpr, monthExpr, dowExpr] = parts;
  const minSet = new Set(expandFieldValues(minExpr, Minute.Min, Minute.Max));
  const hourSet = new Set(expandFieldValues(hourExpr, Hour.Min, Hour.Max));
  const domSet = new Set(expandFieldValues(domExpr, DayOfMonth.Min, DayOfMonth.Max));
  const monthSet = new Set(expandFieldValues(monthExpr, Month.Min, Month.Max));
  const dowSet = new Set(expandFieldValues(dowExpr, DayOfWeek.Min, DayOfWeek.MaxWithSundayAlt));

  return (d: DateParts) =>
    minSet.has(d.minute)
    && hourSet.has(d.hour)
    && domSet.has(d.day)
    && monthSet.has(d.month)
    && (dowSet.has(d.dow) || dowSet.has(d.dow + DayOfWeek.TotalDays));
};
