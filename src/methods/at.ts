import type { CronState } from '../types.js';
import { parseTime } from '../utils/helpers.js';
import { Hour } from '../constants/index.js';

export const applyAt = (state: CronState, time: string): CronState => {
  const parsed = parseTime(time);
  return {
    ...state,
    minute: parsed.minute,
    hour: (state.hour === Hour.Wildcard || state.hour === Hour.Zero) ? parsed.hour : state.hour,
  };
};
