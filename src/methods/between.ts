import type { CronState } from '../types.js';
import { Hour, Minute, DayOfMonth, Month, DayOfWeek, Cron } from '../constants/index.js';

const rangeExpr = (start: number, end: number, step?: number): string =>
  step ? `${start}-${end}/${step}` : `${start}-${end}`;

export const applyBetweenHours = (state: CronState, start: number, end: number, step?: number): CronState => {
  if (start < Hour.Min || end > Hour.Max) throw new Error(`Hours must be ${Hour.Min}-${Hour.Max}.`);
  if (step !== undefined && step < Cron.MinStep) throw new Error(`Step must be >= ${Cron.MinStep}.`);
  return { ...state, hour: rangeExpr(start, end, step) };
};

export const applyBetweenMinutes = (state: CronState, start: number, end: number, step?: number): CronState => {
  if (start < Minute.Min || end > Minute.Max) throw new Error(`Minutes must be ${Minute.Min}-${Minute.Max}.`);
  if (step !== undefined && step < Cron.MinStep) throw new Error(`Step must be >= ${Cron.MinStep}.`);
  return { ...state, minute: rangeExpr(start, end, step) };
};

export const applyBetweenDaysOfMonth = (state: CronState, start: number, end: number, step?: number): CronState => {
  if (start < DayOfMonth.Min || end > DayOfMonth.Max) throw new Error(`Day of month must be ${DayOfMonth.Min}-${DayOfMonth.Max}.`);
  if (step !== undefined && step < Cron.MinStep) throw new Error(`Step must be >= ${Cron.MinStep}.`);
  return { ...state, dayOfMonth: rangeExpr(start, end, step) };
};

export const applyBetweenMonths = (state: CronState, start: number, end: number, step?: number): CronState => {
  if (start < Month.Min || end > Month.Max) throw new Error(`Month must be ${Month.Min}-${Month.Max}.`);
  if (step !== undefined && step < Cron.MinStep) throw new Error(`Step must be >= ${Cron.MinStep}.`);
  return { ...state, month: rangeExpr(start, end, step) };
};

export const applyBetweenDaysOfWeek = (state: CronState, start: number, end: number, step?: number): CronState => {
  if (start < DayOfWeek.Min || end > DayOfWeek.Max) throw new Error(`Day of week must be ${DayOfWeek.Min}-${DayOfWeek.Max}.`);
  if (step !== undefined && step < Cron.MinStep) throw new Error(`Step must be >= ${Cron.MinStep}.`);
  return { ...state, dayOfWeek: rangeExpr(start, end, step) };
};
