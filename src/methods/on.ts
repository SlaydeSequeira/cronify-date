import type { CronState } from '../types.js';
import { WEEKDAYS, DAY_GROUPS } from '../utils/constants.js';
import { unique } from '../utils/helpers.js';
import { DayOfMonth, Cron } from '../constants/index.js';

export const applyOn = (state: CronState, ...days: (string | number)[]): CronState => {
  const nums: number[] = [];
  const weekDays: number[] = [];
  let usedGroup = false;

  for (const day of days) {
    if (typeof day === 'number') {
      if (day < DayOfMonth.Min || day > DayOfMonth.Max) throw new Error(`Day of month must be ${DayOfMonth.Min}-${DayOfMonth.Max}, got ${day}`);
      nums.push(day);
    } else {
      const lower = day.toLowerCase();
      if (lower in DAY_GROUPS) {
        weekDays.push(...DAY_GROUPS[lower]);
        usedGroup = true;
      } else if (lower in WEEKDAYS) {
        weekDays.push(WEEKDAYS[lower]);
      } else {
        throw new Error(`Unknown day: "${day}". Use day names (mon-sun), numbers (${DayOfMonth.Min}-${DayOfMonth.Max}), "weekdays", or "weekends".`);
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

    if (usedGroup && sorted.length > Cron.MinContiguousForRange) {
      const isContiguous = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
      dayOfWeek = isContiguous ? `${sorted[0]}-${sorted[sorted.length - 1]}` : sorted.join(',');
    } else {
      dayOfWeek = sorted.join(',');
    }

    result = { ...result, dayOfWeek };
  }

  return result;
};
