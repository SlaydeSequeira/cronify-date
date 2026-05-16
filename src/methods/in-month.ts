import type { CronState } from '../types.js';
import { MONTHS } from '../utils/constants.js';
import { unique } from '../utils/helpers.js';
import { Month } from '../constants/index.js';

export const applyInMonth = (state: CronState, ...months: (string | number)[]): CronState => {
  const nums: number[] = [];

  for (const m of months) {
    if (typeof m === 'number') {
      if (m < Month.Min || m > Month.Max) throw new Error(`Month must be ${Month.Min}-${Month.Max}, got ${m}`);
      nums.push(m);
    } else {
      const lower = m.toLowerCase();
      if (lower in MONTHS) {
        nums.push(MONTHS[lower]);
      } else {
        throw new Error(`Unknown month: "${m}". Use month names (jan-dec) or numbers (${Month.Min}-${Month.Max}).`);
      }
    }
  }

  return { ...state, month: unique(nums).join(',') };
};
