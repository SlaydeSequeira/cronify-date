import type { CronState, CronChain, RangeChain } from './types.js';
import { toCron } from './utils/helpers.js';
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
    const s = start.match(/^(\d{1,2}):/);
    const e = end.match(/^(\d{1,2}):/);
    if (!s || !e) throw new Error('Invalid time format. Use HH:MM.');
    return createChain({ ...state, hour: `${Number(s[1])}-${Number(e[1])}` });
  },
  toCron: () => toCron(state),
  toString: () => toCron(state),
});

const createRangeChain = (state: CronState, start: number, end: number): RangeChain => ({
  hours: () => createChain(applyBetweenHours(state, start, end)),
  minutes: () => createChain(applyBetweenMinutes(state, start, end)),
  daysOfMonth: () => createChain(applyBetweenDaysOfMonth(state, start, end)),
  months: () => createChain(applyBetweenMonths(state, start, end)),
  daysOfWeek: () => createChain(applyBetweenDaysOfWeek(state, start, end)),
});
