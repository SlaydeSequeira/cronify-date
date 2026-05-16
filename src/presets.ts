import type { CronChain } from './types.js';
import { DEFAULT_STATE } from './utils/helpers.js';
import { createChain } from './chain.js';
import { Minute, Hour, DayOfMonth, Month, DayOfWeek } from './constants/index.js';

// ── Time-of-day presets ──────────────────────────────────────

// Daily at midnight: 0 0 * * *
export const midnight = (): CronChain =>
  createChain({ ...DEFAULT_STATE, minute: Minute.Zero, hour: Hour.Midnight });

// Daily at noon: 0 12 * * *
export const noon = (): CronChain =>
  createChain({ ...DEFAULT_STATE, minute: Minute.Zero, hour: Hour.Noon });

// ── Frequency presets ────────────────────────────────────────

// Every hour on the hour: 0 * * * *
export const hourly = (): CronChain =>
  createChain({ ...DEFAULT_STATE, minute: Minute.Zero });

// Every day at midnight: 0 0 * * *
export const daily = (): CronChain => midnight();

// Every Sunday at midnight: 0 0 * * 0
export const weekly = (): CronChain =>
  createChain({ ...DEFAULT_STATE, minute: Minute.Zero, hour: Hour.Midnight, dayOfWeek: DayOfWeek.SundayStr });

// 1st of every month at midnight: 0 0 1 * *
export const monthly = (): CronChain =>
  createChain({ ...DEFAULT_STATE, minute: Minute.Zero, hour: Hour.Midnight, dayOfMonth: DayOfMonth.First });

// Jan 1st at midnight: 0 0 1 1 *
export const yearly = (): CronChain =>
  createChain({ ...DEFAULT_STATE, minute: Minute.Zero, hour: Hour.Midnight, dayOfMonth: DayOfMonth.First, month: Month.First });

// 1st of Jan, Apr, Jul, Oct at midnight: 0 0 1 1,4,7,10 *
export const quarterly = (): CronChain =>
  createChain({ ...DEFAULT_STATE, minute: Minute.Zero, hour: Hour.Midnight, dayOfMonth: DayOfMonth.First, month: Month.QuarterlyList });

// ── Day-group presets (chain .at() to set time) ──────────────

// Monday-Friday: * * * * 1-5
export const weekdays = (): CronChain =>
  createChain({ ...DEFAULT_STATE, dayOfWeek: DayOfWeek.WeekdayRange });

// Saturday-Sunday: * * * * 0,6
export const weekends = (): CronChain =>
  createChain({ ...DEFAULT_STATE, dayOfWeek: DayOfWeek.WeekendList });

// ── Common pattern presets ───────────────────────────────────

// 1st of every month at midnight: 0 0 1 * *
export const startOfMonth = (): CronChain => monthly();

// Every day at 23:59: 59 23 * * *
export const endOfDay = (): CronChain =>
  createChain({ ...DEFAULT_STATE, minute: Minute.EndOfDay, hour: Hour.EndOfDay });

// Every minute during 9-17 on weekdays: * 9-17 * * 1-5
export const businessHours = (): CronChain =>
  createChain({ ...DEFAULT_STATE, hour: Hour.BusinessRange, dayOfWeek: DayOfWeek.WeekdayRange });
