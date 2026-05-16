import type { CronState } from '../types.js';
import { parseTime, unique } from '../utils/helpers.js';

export const applyTimes = (state: CronState, ...timeList: string[]): CronState => {
  if (timeList.length === 0) throw new Error('At least one time is required.');

  const minutes: number[] = [];
  const hours: number[] = [];

  for (const t of timeList) {
    const parsed = parseTime(t);
    minutes.push(Number(parsed.minute));
    hours.push(Number(parsed.hour));
  }

  const uniqueMinutes = unique(minutes);
  const uniqueHours = unique(hours);

  if (uniqueMinutes.length > 1 && uniqueHours.length > 1) {
    throw new Error(
      `Cannot express times [${timeList.join(', ')}] in a single cron expression. ` +
      `When both hours and minutes differ, cron produces a cross-product ` +
      `(${uniqueHours.length * uniqueMinutes.length} runs instead of ${timeList.length}). ` +
      `Use separate cron expressions for each time instead.`
    );
  }

  if (uniqueMinutes.length === 1) {
    return { ...state, minute: String(uniqueMinutes[0]), hour: uniqueHours.join(',') };
  }

  return { ...state, hour: String(uniqueHours[0]), minute: uniqueMinutes.join(',') };
};
