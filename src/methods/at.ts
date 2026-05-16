import type { CronState } from '../types.js';
import { parseTime } from '../utils/helpers.js';

// Sets minute and hour from "HH:MM". Preserves hour if already set to a
// range or step (e.g. from between()), so chaining .at() only overrides minute.
export const applyAt = (state: CronState, time: string): CronState => {
  const parsed = parseTime(time);
  return {
    ...state,
    minute: parsed.minute,
    hour: (state.hour === '*' || state.hour === '0') ? parsed.hour : state.hour,
  };
};
