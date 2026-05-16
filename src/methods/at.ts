import type { CronState } from '../types.js';
import { parseTime } from '../utils/helpers.js';

export const applyAt = (state: CronState, time: string): CronState => {
  const parsed = parseTime(time);
  return {
    ...state,
    minute: parsed.minute,
    hour: (state.hour === '*' || state.hour === '0') ? parsed.hour : state.hour,
  };
};
