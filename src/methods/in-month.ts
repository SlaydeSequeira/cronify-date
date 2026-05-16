import type { CronState } from '../types.js';
import { MONTHS } from '../utils/constants.js';
import { unique } from '../utils/helpers.js';

export const applyInMonth = (state: CronState, ...months: (string | number)[]): CronState => {
  const nums: number[] = [];

  for (const m of months) {
    if (typeof m === 'number') {
      if (m < 1 || m > 12) throw new Error(`Month must be 1-12, got ${m}`);
      nums.push(m);
    } else {
      const lower = m.toLowerCase();
      if (lower in MONTHS) {
        nums.push(MONTHS[lower]);
      } else {
        throw new Error(`Unknown month: "${m}". Use month names (jan-dec) or numbers (1-12).`);
      }
    }
  }

  return { ...state, month: unique(nums).join(',') };
};
