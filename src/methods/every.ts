import type { CronState } from '../types.js';
import { DEFAULT_STATE } from '../utils/helpers.js';
import { Minute, Hour, DayOfMonth, Month, DayOfWeek, Cron } from '../constants/index.js';

export const applyEvery = (value: string | number, unit?: string): CronState => {
  const state = { ...DEFAULT_STATE };

  if (typeof value === 'number' && unit) {
    return applyInterval(state, value, unit);
  }

  if (typeof value === 'string') {
    const match = value.match(/^(\d+)\s*(m|min|mins|minutes?|h|hr|hrs|hours?|d|days?|w|wk|wks|weeks?|M|mo|mos|months?)$/);
    if (match) {
      return applyInterval(state, Number(match[1]), match[2]);
    }

    const lower = value.toLowerCase();
    if (lower === 'minute') return state;
    if (lower === 'hour') return { ...state, minute: Minute.Zero };
    if (lower === 'day' || lower === 'daily') return { ...state, minute: Minute.Zero, hour: Hour.Midnight };
    if (lower === 'week' || lower === 'weekly') return { ...state, minute: Minute.Zero, hour: Hour.Midnight, dayOfWeek: DayOfWeek.SundayStr };
    if (lower === 'month' || lower === 'monthly') return { ...state, minute: Minute.Zero, hour: Hour.Midnight, dayOfMonth: DayOfMonth.First };
    if (lower === 'year' || lower === 'yearly' || lower === 'annually') return { ...state, minute: Minute.Zero, hour: Hour.Midnight, dayOfMonth: DayOfMonth.First, month: Month.First };

    throw new Error(`Cannot parse interval: "${value}". Use formats like "5m", "2h", "3d", "2w", "3M", "day", "month", etc.`);
  }

  throw new Error(`Invalid interval: ${value}`);
};

const applyInterval = (state: CronState, amount: number, unit: string): CronState => {
  const u = unit.replace(/s$/, '');

  switch (u) {
    case 'm': case 'min': case 'minute':
      if (amount < Cron.MinStep || amount > Minute.Max) throw new Error(`Minute interval must be ${Cron.MinStep}-${Minute.Max}.`);
      return { ...state, minute: `*/${amount}` };
    case 'h': case 'hr': case 'hour':
      if (amount < Cron.MinStep || amount > Hour.Max) throw new Error(`Hour interval must be ${Cron.MinStep}-${Hour.Max}.`);
      return { ...state, minute: Minute.Zero, hour: `*/${amount}` };
    case 'd': case 'day':
      if (amount < Cron.MinStep || amount > DayOfMonth.Max) throw new Error(`Day interval must be ${Cron.MinStep}-${DayOfMonth.Max}.`);
      return { ...state, minute: Minute.Zero, hour: Hour.Midnight, dayOfMonth: `*/${amount}` };
    case 'w': case 'wk': case 'week':
      if (amount < Cron.MinStep || amount > DayOfWeek.Max) throw new Error(`Week interval must be ${Cron.MinStep}-${DayOfWeek.Max} (day-of-week step).`);
      return { ...state, minute: Minute.Zero, hour: Hour.Midnight, dayOfWeek: `*/${amount}` };
    case 'M': case 'mo': case 'month':
      if (amount < Cron.MinStep || amount > Month.Max) throw new Error(`Month interval must be ${Cron.MinStep}-${Month.Max}.`);
      return { ...state, minute: Minute.Zero, hour: Hour.Midnight, dayOfMonth: DayOfMonth.First, month: `*/${amount}` };
    default:
      throw new Error(`Unknown unit: "${unit}". Use m/h/d/w/M (minutes/hours/days/weeks/months).`);
  }
};
