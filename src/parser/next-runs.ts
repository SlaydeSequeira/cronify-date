import type { NextRunsOptions } from '../types.js';
import { validate } from './validate.js';
import { expandMacro } from '../utils/constants.js';
import { expandFieldValues } from '../utils/helpers.js';

// Brute-force scans forward minute-by-minute to find the next N matching dates.
// 3rd argument is backward-compatible: accepts Date (legacy) or options object.
export const nextRuns = (
  cron: string,
  count: number = 5,
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

  const maxIterations = 525600; // 1 year of minutes
  for (let i = 0; i < maxIterations && results.length < count; i++) {
    const dateParts = timezone ? getPartsInTz(current, timezone) : getLocalParts(current);
    if (matcher(dateParts)) {
      results.push(new Date(current));
    }
    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
};

// Merges runs from multiple cron expressions, sorted chronologically
export const nextRunsUnion = (
  crons: string[],
  count: number = 5,
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

// Extracts date components in a specific timezone using the Intl API
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

  // Day of week via a separate formatter since formatToParts doesn't include numeric weekday
  const dowStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(d);
  const dowMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    minute: get('minute'),
    hour: hour === 24 ? 0 : hour, // midnight edge case in some locales
    day: get('day'),
    month: get('month'),
    dow: dowMap[dowStr] ?? 0,
  };
};

// Pre-computes Sets for each field so matching is O(1) per field per minute
const buildMatcher = (parts: string[]): (d: DateParts) => boolean => {
  const [minExpr, hourExpr, domExpr, monthExpr, dowExpr] = parts;
  const minSet = new Set(expandFieldValues(minExpr, 0, 59));
  const hourSet = new Set(expandFieldValues(hourExpr, 0, 23));
  const domSet = new Set(expandFieldValues(domExpr, 1, 31));
  const monthSet = new Set(expandFieldValues(monthExpr, 1, 12));
  const dowSet = new Set(expandFieldValues(dowExpr, 0, 7));

  return (d: DateParts) =>
    minSet.has(d.minute)
    && hourSet.has(d.hour)
    && domSet.has(d.day)
    && monthSet.has(d.month)
    && (dowSet.has(d.dow) || dowSet.has(d.dow + 7)); // 0 and 7 both mean Sunday
};
