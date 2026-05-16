import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('describe()');

test('every 5 minutes', () => {
  eq(cronify.describe('*/5 * * * *'), 'every 5 minutes');
});

test('every 2 hours', () => {
  eq(cronify.describe('0 */2 * * *'), 'every 2 hours');
});

test('every 3 hours at minute 15', () => {
  eq(cronify.describe('15 */3 * * *'), 'every 3 hours, at minute 15');
});

test('specific time on a weekday', () => {
  eq(cronify.describe('0 9 * * 1'), 'at 09:00, on Monday');
});

test('weekday range', () => {
  eq(cronify.describe('30 8 * * 1-5'), 'at 08:30, on Monday through Friday');
});

test('day of month and month', () => {
  eq(cronify.describe('0 0 1 1 *'), 'at 00:00, on day 1 of the month, in January');
});

test('every minute', () => {
  eq(cronify.describe('* * * * *'), 'every minute');
});

test('multiple hours', () => {
  eq(cronify.describe('0 9,17 * * *'), 'at 09:00, 17:00');
});

test('multiple months', () => {
  eq(cronify.describe('0 0 1 1,6 *'), 'at 00:00, on day 1 of the month, in January, June');
});

test('stepped range in hours', () => {
  eq(cronify.describe('0 9-17/2 * * *'), 'at minute 0, during hours 9-17/2');
});

test('stepped range in months', () => {
  eq(cronify.describe('0 0 1 */3 *'), 'at 00:00, on day 1 of the month, every 3 months');
});

// ── @ macro aliases (#7) ────────────────────────────────────

console.log('\ndescribe() @ macros');

test('@yearly', () => {
  eq(cronify.describe('@yearly'), 'at 00:00, on day 1 of the month, in January');
});

test('@monthly', () => {
  eq(cronify.describe('@monthly'), 'at 00:00, on day 1 of the month');
});

test('@weekly', () => {
  eq(cronify.describe('@weekly'), 'at 00:00, on Sunday');
});

test('@daily', () => {
  eq(cronify.describe('@daily'), 'at 00:00');
});

test('@hourly', () => {
  eq(cronify.describe('@hourly'), 'at minute 0');
});

test('@reboot throws', () => {
  try { cronify.describe('@reboot'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('system-level directive'), true); }
});

test('throws on invalid field count', () => {
  try { cronify.describe('* * *'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('expected 5 fields'), true); }
});

summary();
