import type { CronState } from '../types.js';
import { DEFAULT_STATE } from '../utils/helpers.js';

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
    if (lower === 'hour') return { ...state, minute: '0' };
    if (lower === 'day' || lower === 'daily') return { ...state, minute: '0', hour: '0' };
    if (lower === 'week' || lower === 'weekly') return { ...state, minute: '0', hour: '0', dayOfWeek: '0' };
    if (lower === 'month' || lower === 'monthly') return { ...state, minute: '0', hour: '0', dayOfMonth: '1' };
    if (lower === 'year' || lower === 'yearly' || lower === 'annually') return { ...state, minute: '0', hour: '0', dayOfMonth: '1', month: '1' };

    throw new Error(`Cannot parse interval: "${value}". Use formats like "5m", "2h", "3d", "2w", "3M", "day", "month", etc.`);
  }

  throw new Error(`Invalid interval: ${value}`);
};

const applyInterval = (state: CronState, amount: number, unit: string): CronState => {
  const u = unit.replace(/s$/, '');

  switch (u) {
    case 'm': case 'min': case 'minute':
      if (amount < 1 || amount > 59) throw new Error('Minute interval must be 1-59.');
      return { ...state, minute: `*/${amount}` };
    case 'h': case 'hr': case 'hour':
      if (amount < 1 || amount > 23) throw new Error('Hour interval must be 1-23.');
      return { ...state, minute: '0', hour: `*/${amount}` };
    case 'd': case 'day':
      if (amount < 1 || amount > 31) throw new Error('Day interval must be 1-31.');
      return { ...state, minute: '0', hour: '0', dayOfMonth: `*/${amount}` };
    case 'w': case 'wk': case 'week':
      if (amount < 1 || amount > 6) throw new Error('Week interval must be 1-6 (day-of-week step).');
      return { ...state, minute: '0', hour: '0', dayOfWeek: `*/${amount}` };
    case 'M': case 'mo': case 'month':
      if (amount < 1 || amount > 12) throw new Error('Month interval must be 1-12.');
      return { ...state, minute: '0', hour: '0', dayOfMonth: '1', month: `*/${amount}` };
    default:
      throw new Error(`Unknown unit: "${unit}". Use m/h/d/w/M (minutes/hours/days/weeks/months).`);
  }
};
