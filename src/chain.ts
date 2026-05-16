import type { CronState, CronChain, RangeChain } from './types.js';
import { toCron, parseTime, validateTimezone } from './utils/helpers.js';
import { applyAt } from './methods/at.js';
import { applyOn } from './methods/on.js';
import { applyInMonth } from './methods/in-month.js';
import { applyTimes } from './methods/times.js';
import { applyExceptDays, applyExceptMonths } from './methods/except.js';
import {
  applyBetweenHours,
  applyBetweenMinutes,
  applyBetweenDaysOfMonth,
  applyBetweenMonths,
  applyBetweenDaysOfWeek,
} from './methods/between.js';
import { nextRuns } from './parser/next-runs.js';

// Wraps pure state-transform functions into a fluent chainable API via closures
export const createChain = (state: CronState): CronChain => ({
  at: (time) => createChain(applyAt(state, time)),
  on: (...days) => createChain(applyOn(state, ...days)),
  onDay: (...days) => createChain(applyOn(state, ...days)),
  inMonth: (...months) => createChain(applyInMonth(state, ...months)),
  times: (...timeList) => createChain(applyTimes(state, ...timeList)),
  between: (start, end) => createRangeChain(state, start, end),

  // Only supports hour-level ranges — minute-precision ranges can't be a single cron expression
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

  // Attaches a timezone — affects nextRuns() and toObject(), not the cron string itself
  tz: (timezone) => {
    validateTimezone(timezone);
    return createChain({ ...state, timezone });
  },

  // Removes specific days from the schedule (subtracts from dayOfWeek)
  exceptDays: (...days) => createChain(applyExceptDays(state, ...days)),

  // Removes specific months from the schedule (subtracts from month)
  exceptMonths: (...months) => createChain(applyExceptMonths(state, ...months)),

  toCron: () => toCron(state),

  // Returns the expression + timezone as a structured object
  toObject: () => ({
    expression: toCron(state),
    ...(state.timezone ? { timezone: state.timezone } : {}),
  }),

  // Convenience: compute next run dates directly from the chain
  nextRuns: (count?, from?) => {
    const opts = state.timezone ? { from, timezone: state.timezone } : { from };
    return nextRuns(toCron(state), count ?? 5, opts);
  },

  toString: () => toCron(state),
});

// Intermediate step: user picks which field the range applies to, with optional step
const createRangeChain = (state: CronState, start: number, end: number): RangeChain => ({
  hours: (step?) => createChain(applyBetweenHours(state, start, end, step)),
  minutes: (step?) => createChain(applyBetweenMinutes(state, start, end, step)),
  daysOfMonth: (step?) => createChain(applyBetweenDaysOfMonth(state, start, end, step)),
  months: (step?) => createChain(applyBetweenMonths(state, start, end, step)),
  daysOfWeek: (step?) => createChain(applyBetweenDaysOfWeek(state, start, end, step)),
});
