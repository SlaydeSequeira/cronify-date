import type { CronState } from '../types.js';
import { WEEKDAYS, DAY_GROUPS, MONTHS } from '../utils/constants.js';
import { expandFieldValues, unique } from '../utils/helpers.js';

// Removes specific days from the dayOfWeek field.
// If dayOfWeek is "*", starts with all 7 days then subtracts.
export const applyExceptDays = (state: CronState, ...days: (string | number)[]): CronState => {
  const excludeSet = new Set<number>();

  for (const day of days) {
    if (typeof day === 'number') {
      if (day < 0 || day > 6) throw new Error(`Day of week must be 0-6, got ${day}`);
      excludeSet.add(day);
    } else {
      const lower = day.toLowerCase();
      if (lower in DAY_GROUPS) {
        for (const d of DAY_GROUPS[lower]) excludeSet.add(d);
      } else if (lower in WEEKDAYS) {
        excludeSet.add(WEEKDAYS[lower]);
      } else {
        throw new Error(`Unknown day: "${day}". Use day names (mon-sun), "weekdays", or "weekends".`);
      }
    }
  }

  const current = expandFieldValues(state.dayOfWeek, 0, 6);
  const remaining = current.filter(d => !excludeSet.has(d));

  if (remaining.length === 0) throw new Error('Cannot exclude all days of the week.');
  if (remaining.length === 7) return state;

  return { ...state, dayOfWeek: remaining.join(',') };
};

// Removes specific months from the month field.
// If month is "*", starts with all 12 months then subtracts.
export const applyExceptMonths = (state: CronState, ...months: (string | number)[]): CronState => {
  const excludeSet = new Set<number>();

  for (const m of months) {
    if (typeof m === 'number') {
      if (m < 1 || m > 12) throw new Error(`Month must be 1-12, got ${m}`);
      excludeSet.add(m);
    } else {
      const lower = m.toLowerCase();
      if (lower in MONTHS) {
        excludeSet.add(MONTHS[lower]);
      } else {
        throw new Error(`Unknown month: "${m}". Use month names (jan-dec) or numbers (1-12).`);
      }
    }
  }

  const current = expandFieldValues(state.month, 1, 12);
  const remaining = current.filter(m => !excludeSet.has(m));

  if (remaining.length === 0) throw new Error('Cannot exclude all months.');
  if (remaining.length === 12) return state;

  return { ...state, month: remaining.join(',') };
};
