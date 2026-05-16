import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('every()');

test('every 5 minutes', () => {
  eq(cronify.every('5m').toCron(), '*/5 * * * *');
});

test('every 15 minutes', () => {
  eq(cronify.every('15m').toCron(), '*/15 * * * *');
});

test('every 2 hours', () => {
  eq(cronify.every('2h').toCron(), '0 */2 * * *');
});

test('every 6 hours', () => {
  eq(cronify.every('6h').toCron(), '0 */6 * * *');
});

test('every 3 days', () => {
  eq(cronify.every('3d').toCron(), '0 0 */3 * *');
});

test('every(5, "minutes") numeric form', () => {
  eq(cronify.every(5, 'minutes').toCron(), '*/5 * * * *');
});

test('every(2, "hours") numeric form', () => {
  eq(cronify.every(2, 'hours').toCron(), '0 */2 * * *');
});

test('every minute', () => {
  eq(cronify.every('minute').toCron(), '* * * * *');
});

test('every hour', () => {
  eq(cronify.every('hour').toCron(), '0 * * * *');
});

test('every day', () => {
  eq(cronify.every('day').toCron(), '0 0 * * *');
});

test('every daily alias', () => {
  eq(cronify.every('daily').toCron(), '0 0 * * *');
});

test('every day at 5:07', () => {
  eq(cronify.every('day').at('5:07').toCron(), '7 5 * * *');
});

test('every week', () => {
  eq(cronify.every('week').toCron(), '0 0 * * 0');
});

test('every weekly alias', () => {
  eq(cronify.every('weekly').toCron(), '0 0 * * 0');
});

test('every month', () => {
  eq(cronify.every('month').toCron(), '0 0 1 * *');
});

test('every monthly alias', () => {
  eq(cronify.every('monthly').toCron(), '0 0 1 * *');
});

test('every month on 31st at 5:07', () => {
  eq(cronify.every('month').on(31).at('5:07').toCron(), '7 5 31 * *');
});

test('every year', () => {
  eq(cronify.every('year').toCron(), '0 0 1 1 *');
});

test('every yearly alias', () => {
  eq(cronify.every('yearly').toCron(), '0 0 1 1 *');
});

test('every annually alias', () => {
  eq(cronify.every('annually').toCron(), '0 0 1 1 *');
});

// ── month/week intervals (#3) ───────────────────────────────

console.log('\nevery() month/week intervals');

test('every 3 months (quarterly)', () => {
  eq(cronify.every('3M').toCron(), '0 0 1 */3 *');
});

test('every 3 months via numeric', () => {
  eq(cronify.every(3, 'months').toCron(), '0 0 1 */3 *');
});

test('every 6 months (biannual)', () => {
  eq(cronify.every(6, 'months').toCron(), '0 0 1 */6 *');
});

test('every 2 weeks (day-of-week step)', () => {
  eq(cronify.every('2w').toCron(), '0 0 * * */2');
});

test('every 2 weeks via numeric', () => {
  eq(cronify.every(2, 'weeks').toCron(), '0 0 * * */2');
});

// ── error handling ──────────────────────────────────────────

console.log('\nevery() errors');

test('throws on invalid interval string', () => {
  try { cronify.every('banana'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Cannot parse'), true); }
});

test('throws on minute interval out of range', () => {
  try { cronify.every('60m'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Minute interval must be 1-59'), true); }
});

test('throws on hour interval out of range', () => {
  try { cronify.every('24h'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Hour interval must be 1-23'), true); }
});

test('throws on day interval out of range', () => {
  try { cronify.every('32d'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Day interval must be 1-31'), true); }
});

test('throws on month interval out of range', () => {
  try { cronify.every(13, 'months'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Month interval must be 1-12'), true); }
});

test('throws on week interval out of range', () => {
  try { cronify.every(7, 'weeks'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Week interval must be 1-6'), true); }
});

summary();
