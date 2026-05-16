import type { CronChain, RangeChain } from './types.js';
import { DEFAULT_STATE } from './utils/helpers.js';
import { createChain } from './chain.js';
import { applyEvery } from './methods/every.js';
import { applyAt } from './methods/at.js';
import { applyOn } from './methods/on.js';
import { applyInMonth } from './methods/in-month.js';
import { applyTimes } from './methods/times.js';
import { describe } from './parser/describe.js';
import { isValid, validate } from './parser/validate.js';
import { nextRuns } from './parser/next-runs.js';

// Entry-point functions — each starts a fresh chain from DEFAULT_STATE
const every = (value: string | number, unit?: string): CronChain =>
  createChain(applyEvery(value, unit));

const at = (time: string): CronChain =>
  createChain(applyAt(DEFAULT_STATE, time));

const on = (...days: (string | number)[]): CronChain =>
  createChain(applyOn(DEFAULT_STATE, ...days));

const inMonth = (...months: (string | number)[]): CronChain =>
  createChain(applyInMonth(DEFAULT_STATE, ...months));

const times = (...timeList: string[]): CronChain =>
  createChain(applyTimes(DEFAULT_STATE, ...timeList));

const between = (start: number, end: number): RangeChain =>
  createChain(DEFAULT_STATE).between(start, end);

const cronify = { every, at, on, inMonth, times, between, describe, isValid, validate, nextRuns };

export { cronify };
export type { CronChain, RangeChain, CronState } from './types.js';
export { describe, isValid, validate, nextRuns };
export default cronify;
