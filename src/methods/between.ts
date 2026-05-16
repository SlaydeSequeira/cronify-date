import type { CronState } from '../types.js';

export const applyBetweenHours = (state: CronState, start: number, end: number): CronState => {
  if (start < 0 || end > 23) throw new Error('Hours must be 0-23.');
  return { ...state, hour: `${start}-${end}`, minute: '0' };
};

export const applyBetweenMinutes = (state: CronState, start: number, end: number): CronState => {
  if (start < 0 || end > 59) throw new Error('Minutes must be 0-59.');
  return { ...state, minute: `${start}-${end}` };
};

export const applyBetweenDaysOfMonth = (state: CronState, start: number, end: number): CronState => {
  if (start < 1 || end > 31) throw new Error('Day of month must be 1-31.');
  return { ...state, dayOfMonth: `${start}-${end}` };
};

export const applyBetweenMonths = (state: CronState, start: number, end: number): CronState => {
  if (start < 1 || end > 12) throw new Error('Month must be 1-12.');
  return { ...state, month: `${start}-${end}` };
};

export const applyBetweenDaysOfWeek = (state: CronState, start: number, end: number): CronState => {
  if (start < 0 || end > 6) throw new Error('Day of week must be 0-6.');
  return { ...state, dayOfWeek: `${start}-${end}` };
};
