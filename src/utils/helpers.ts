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

export const withField = (state: CronState, field: keyof CronState, value: string): CronState => ({
  ...state,
  [field]: value,
});

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
