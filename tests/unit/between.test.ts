import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('between()');

test('between hours 9-17 preserves minute', () => {
  eq(cronify.between(9, 17).hours().toCron(), '* 9-17 * * *');
});

test('between hours with at()', () => {
  eq(cronify.between(9, 17).hours().at('0:30').toCron(), '30 9-17 * * *');
});

test('between minutes 0-30', () => {
  eq(cronify.between(0, 30).minutes().toCron(), '0-30 * * * *');
});

test('between days of month 1-15', () => {
  eq(cronify.between(1, 15).daysOfMonth().at('8:00').toCron(), '0 8 1-15 * *');
});

test('between months 3-6', () => {
  eq(cronify.between(3, 6).months().toCron(), '* * * 3-6 *');
});

test('between days of week 1-5', () => {
  eq(cronify.between(1, 5).daysOfWeek().at('9:00').toCron(), '0 9 * * 1-5');
});

test('between hours chained with on()', () => {
  eq(cronify.between(9, 17).hours().on('weekdays').toCron(), '* 9-17 * * 1-5');
});

// ── stepped ranges (#1) ─────────────────────────────────────

console.log('\nbetween() with step');

test('stepped hours: every 2h between 9-17', () => {
  eq(cronify.between(9, 17).hours(2).at('0:00').toCron(), '0 9-17/2 * * *');
});

test('stepped minutes: every 5m in first half hour', () => {
  eq(cronify.between(0, 30).minutes(5).toCron(), '0-30/5 * * * *');
});

test('stepped days of month', () => {
  eq(cronify.between(1, 31).daysOfMonth(2).at('0:00').toCron(), '0 0 1-31/2 * *');
});

test('stepped months', () => {
  eq(cronify.between(1, 12).months(3).at('0:00').toCron(), '0 0 * 1-12/3 *');
});

test('stepped days of week', () => {
  eq(cronify.between(0, 6).daysOfWeek(2).at('9:00').toCron(), '0 9 * * 0-6/2');
});

// ── offset steps (#2) ───────────────────────────────────────

console.log('\nbetween() for offset steps');

test('offset step: minutes starting at 5, every 15', () => {
  eq(cronify.between(5, 59).minutes(15).toCron(), '5-59/15 * * * *');
});

test('offset step: hours starting at 1, every 3', () => {
  eq(cronify.between(1, 23).hours(3).toCron(), '* 1-23/3 * * *');
});

// ── error handling ──────────────────────────────────────────

console.log('\nbetween() errors');

test('throws on hours out of range', () => {
  try { cronify.between(-1, 17).hours(); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Hours must be 0-23'), true); }
});

test('throws on minutes out of range', () => {
  try { cronify.between(0, 60).minutes(); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Minutes must be 0-59'), true); }
});

test('throws on day-of-month out of range', () => {
  try { cronify.between(0, 15).daysOfMonth(); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Day of month must be 1-31'), true); }
});

test('throws on month out of range', () => {
  try { cronify.between(0, 6).months(); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Month must be 1-12'), true); }
});

test('throws on day-of-week out of range', () => {
  try { cronify.between(0, 7).daysOfWeek(); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Day of week must be 0-6'), true); }
});

test('throws on step < 1', () => {
  try { cronify.between(0, 59).minutes(0); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Step must be >= 1'), true); }
});

summary();
