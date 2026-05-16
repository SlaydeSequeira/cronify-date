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

  const allSameMinute = minutes.every(m => m === minutes[0]);
  const allSameHour = hours.every(h => h === hours[0]);

  if (allSameMinute) {
    return { ...state, minute: String(minutes[0]), hour: unique(hours).join(',') };
  }

  if (allSameHour) {
    return { ...state, hour: String(hours[0]), minute: unique(minutes).join(',') };
  }

  return { ...state, minute: unique(minutes).join(','), hour: unique(hours).join(',') };
};
