import type { CronState } from '../types.js';

// All wildcards — the starting point before any method narrows a field
export const DEFAULT_STATE: CronState = {
  minute: '*',
  hour: '*',
  dayOfMonth: '*',
  month: '*',
  dayOfWeek: '*',
};

// Joins the 5 fields into a cron string: "min hour dom month dow"
export const toCron = (state: CronState): string =>
  `${state.minute} ${state.hour} ${state.dayOfMonth} ${state.month} ${state.dayOfWeek}`;

export const unique = (arr: number[]): number[] =>
  [...new Set(arr)].sort((a, b) => a - b);

// Parses "HH:MM" into separate hour/minute strings, validates ranges
export const parseTime = (time: string): { hour: string; minute: string } => {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) throw new Error(`Invalid time format: "${time}". Use HH:MM (e.g. "5:07", "14:30").`);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23) throw new Error(`Hour must be 0-23, got ${hour}.`);
  if (minute > 59) throw new Error(`Minute must be 0-59, got ${minute}.`);
  return { hour: String(hour), minute: String(minute) };
};

// Expands a cron field expression (*, */n, n-m, n-m/s, n,m) into concrete values
export const expandFieldValues = (expr: string, min: number, max: number): number[] => {
  if (expr === '*') {
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  }

  const result: number[] = [];
  for (const part of expr.split(',')) {
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = Number(stepStr);
      let start = min, end = max;
      if (range !== '*') {
        if (range.includes('-')) {
          [start, end] = range.split('-').map(Number);
        } else {
          start = Number(range);
        }
      }
      for (let i = start; i <= end; i += step) result.push(i);
    } else if (part.includes('-')) {
      const [s, e] = part.split('-').map(Number);
      for (let i = s; i <= e; i++) result.push(i);
    } else {
      result.push(Number(part));
    }
  }

  return unique(result);
};

// Validates a timezone string using the Intl API
export const validateTimezone = (tz: string): void => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
  } catch {
    throw new Error(`Invalid timezone: "${tz}". Use IANA timezone names (e.g. "America/New_York", "UTC").`);
  }
};
