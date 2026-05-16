import type { CronState } from '../types.js';

const rangeExpr = (start: number, end: number, step?: number): string =>
  step ? `${start}-${end}/${step}` : `${start}-${end}`;

export const applyBetweenHours = (state: CronState, start: number, end: number, step?: number): CronState => {
  if (start < 0 || end > 23) throw new Error('Hours must be 0-23.');
  if (step !== undefined && step < 1) throw new Error('Step must be >= 1.');
  return { ...state, hour: rangeExpr(start, end, step) };
};

export const applyBetweenMinutes = (state: CronState, start: number, end: number, step?: number): CronState => {
  if (start < 0 || end > 59) throw new Error('Minutes must be 0-59.');
  if (step !== undefined && step < 1) throw new Error('Step must be >= 1.');
  return { ...state, minute: rangeExpr(start, end, step) };
};

export const applyBetweenDaysOfMonth = (state: CronState, start: number, end: number, step?: number): CronState => {
  if (start < 1 || end > 31) throw new Error('Day of month must be 1-31.');
  if (step !== undefined && step < 1) throw new Error('Step must be >= 1.');
  return { ...state, dayOfMonth: rangeExpr(start, end, step) };
};

export const applyBetweenMonths = (state: CronState, start: number, end: number, step?: number): CronState => {
  if (start < 1 || end > 12) throw new Error('Month must be 1-12.');
  if (step !== undefined && step < 1) throw new Error('Step must be >= 1.');
  return { ...state, month: rangeExpr(start, end, step) };
};

export const applyBetweenDaysOfWeek = (state: CronState, start: number, end: number, step?: number): CronState => {
  if (start < 0 || end > 6) throw new Error('Day of week must be 0-6.');
  if (step !== undefined && step < 1) throw new Error('Step must be >= 1.');
  return { ...state, dayOfWeek: rangeExpr(start, end, step) };
};
