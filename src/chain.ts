import type { CronState, CronChain, RangeChain } from './types.js';
import { toCron, parseTime } from './utils/helpers.js';
import { applyAt } from './methods/at.js';
import { applyOn } from './methods/on.js';
import { applyInMonth } from './methods/in-month.js';
import { applyTimes } from './methods/times.js';
import {
  applyBetweenHours,
  applyBetweenMinutes,
  applyBetweenDaysOfMonth,
  applyBetweenMonths,
  applyBetweenDaysOfWeek,
} from './methods/between.js';

export const createChain = (state: CronState): CronChain => ({
  at: (time) => createChain(applyAt(state, time)),
  on: (...days) => createChain(applyOn(state, ...days)),
  onDay: (...days) => createChain(applyOn(state, ...days)),
  inMonth: (...months) => createChain(applyInMonth(state, ...months)),
  times: (...timeList) => createChain(applyTimes(state, ...timeList)),
  between: (start, end) => createRangeChain(state, start, end),
  betweenTimes: (start, end) => {
    const s = parseTime(start);
    const e = parseTime(end);
    if (s.minute !== '0' || e.minute !== '0') {
      throw new Error(
        'betweenTimes() only supports hour-level ranges (e.g. "9:00", "17:00"). ' +
        'Minute-precision time ranges cannot be expressed in a single cron expression.'
      );
    }
    return createChain({ ...state, hour: `${s.hour}-${e.hour}` });
  },
  toCron: () => toCron(state),
  toString: () => toCron(state),
});

const createRangeChain = (state: CronState, start: number, end: number): RangeChain => ({
  hours: (step?) => createChain(applyBetweenHours(state, start, end, step)),
  minutes: (step?) => createChain(applyBetweenMinutes(state, start, end, step)),
  daysOfMonth: (step?) => createChain(applyBetweenDaysOfMonth(state, start, end, step)),
  months: (step?) => createChain(applyBetweenMonths(state, start, end, step)),
  daysOfWeek: (step?) => createChain(applyBetweenDaysOfWeek(state, start, end, step)),
});
