import type { CronState } from '../types.js';
import { WEEKDAYS, DAY_GROUPS } from '../utils/constants.js';
import { unique } from '../utils/helpers.js';

// Accepts weekday names ("mon", "weekdays"), or day-of-month numbers (1-31).
// Mixing both types in one call throws — cron uses separate fields for each.
export const applyOn = (state: CronState, ...days: (string | number)[]): CronState => {
  const nums: number[] = [];       // day-of-month values
  const weekDays: number[] = [];   // day-of-week values
  let usedGroup = false;

  for (const day of days) {
    if (typeof day === 'number') {
      if (day < 1 || day > 31) throw new Error(`Day of month must be 1-31, got ${day}`);
      nums.push(day);
    } else {
      const lower = day.toLowerCase();
      if (lower in DAY_GROUPS) {
        weekDays.push(...DAY_GROUPS[lower]);
        usedGroup = true;
      } else if (lower in WEEKDAYS) {
        weekDays.push(WEEKDAYS[lower]);
      } else {
        throw new Error(`Unknown day: "${day}". Use day names (mon-sun), numbers (1-31), "weekdays", or "weekends".`);
      }
    }
  }

  if (nums.length > 0 && weekDays.length > 0) {
    throw new Error('Cannot mix day-of-month numbers with weekday names in a single call.');
  }

  let result = { ...state };

  if (nums.length > 0) {
    result = { ...result, dayOfMonth: unique(nums).join(',') };
  }

  if (weekDays.length > 0) {
    const sorted = unique(weekDays);
    let dayOfWeek: string;

    // Collapse contiguous groups like "weekdays" into a range (1-5) instead of a list
    if (usedGroup && sorted.length > 2) {
      const isContiguous = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
      dayOfWeek = isContiguous ? `${sorted[0]}-${sorted[sorted.length - 1]}` : sorted.join(',');
    } else {
      dayOfWeek = sorted.join(',');
    }

    result = { ...result, dayOfWeek };
  }

  return result;
};
