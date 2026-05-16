import type { CronState } from '../types.js';
import { WEEKDAYS, DAY_GROUPS, MONTHS } from '../utils/constants.js';
import { expandFieldValues, unique } from '../utils/helpers.js';
import { DayOfWeek, Month } from '../constants/index.js';

export const applyExceptDays = (state: CronState, ...days: (string | number)[]): CronState => {
  const excludeSet = new Set<number>();

  for (const day of days) {
    if (typeof day === 'number') {
      if (day < DayOfWeek.Min || day > DayOfWeek.Max) throw new Error(`Day of week must be ${DayOfWeek.Min}-${DayOfWeek.Max}, got ${day}`);
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

  const current = expandFieldValues(state.dayOfWeek, DayOfWeek.Min, DayOfWeek.Max);
  const remaining = current.filter(d => !excludeSet.has(d));

  if (remaining.length === 0) throw new Error('Cannot exclude all days of the week.');
  if (remaining.length === DayOfWeek.TotalDays) return state;

  return { ...state, dayOfWeek: remaining.join(',') };
};

export const applyExceptMonths = (state: CronState, ...months: (string | number)[]): CronState => {
  const excludeSet = new Set<number>();

  for (const m of months) {
    if (typeof m === 'number') {
      if (m < Month.Min || m > Month.Max) throw new Error(`Month must be ${Month.Min}-${Month.Max}, got ${m}`);
      excludeSet.add(m);
    } else {
      const lower = m.toLowerCase();
      if (lower in MONTHS) {
        excludeSet.add(MONTHS[lower]);
      } else {
        throw new Error(`Unknown month: "${m}". Use month names (jan-dec) or numbers (${Month.Min}-${Month.Max}).`);
      }
    }
  }

  const current = expandFieldValues(state.month, Month.Min, Month.Max);
  const remaining = current.filter(m => !excludeSet.has(m));

  if (remaining.length === 0) throw new Error('Cannot exclude all months.');
  if (remaining.length === Month.Max) return state;

  return { ...state, month: remaining.join(',') };
};
