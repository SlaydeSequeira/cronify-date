import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('tz()');

test('tz does not affect cron string', () => {
  eq(cronify.at('9:00').tz('America/New_York').toCron(), '0 9 * * *');
});

test('toObject includes timezone', () => {
  const obj = cronify.at('9:00').tz('America/New_York').toObject();
  eq(obj.expression, '0 9 * * *');
  eq(obj.timezone, 'America/New_York');
});

test('toObject without tz omits timezone', () => {
  const obj = cronify.at('9:00').toObject();
  eq(obj.expression, '0 9 * * *');
  eq(obj.timezone, undefined);
});

test('throws on invalid timezone', () => {
  try { cronify.at('9:00').tz('Not/A/Zone'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Invalid timezone'), true); }
});

test('accepts common IANA timezones', () => {
  cronify.at('9:00').tz('UTC');
  cronify.at('9:00').tz('Europe/London');
  cronify.at('9:00').tz('Asia/Tokyo');
  cronify.at('9:00').tz('America/Los_Angeles');
});

test('tz is preserved through chaining', () => {
  const obj = cronify.at('9:00').tz('Asia/Kolkata').on('weekdays').toObject();
  eq(obj.timezone, 'Asia/Kolkata');
  eq(obj.expression, '0 9 * * 1-5');
});

console.log('\nnextRuns() with timezone');

test('chain nextRuns uses stored timezone', () => {
  const from = new Date('2025-06-01T00:00:00Z');
  const runs = cronify.at('9:00').tz('UTC').nextRuns(3, from);
  eq(runs.length, 3);
});

test('standalone nextRuns with timezone option', () => {
  const from = new Date('2025-06-01T00:00:00Z');
  const runs = cronify.nextRuns('0 9 * * *', 3, { from, timezone: 'UTC' });
  eq(runs.length, 3);
  for (const r of runs) {
    const utcHour = r.getUTCHours();
    eq(utcHour, 9);
  }
});

test('nextRuns backward-compatible with Date arg', () => {
  const from = new Date('2025-06-01T00:00:00');
  const runs = cronify.nextRuns('0 9 * * *', 3, from);
  eq(runs.length, 3);
});

test('timezone produces different results than local', () => {
  const from = new Date('2025-06-01T00:00:00Z');
  const utcRuns = cronify.nextRuns('0 9 * * *', 1, { from, timezone: 'UTC' });
  const tokyoRuns = cronify.nextRuns('0 9 * * *', 1, { from, timezone: 'Asia/Tokyo' });
  // Tokyo is UTC+9, so 9:00 Tokyo = 0:00 UTC — different timestamps
  const utcTime = utcRuns[0].getTime();
  const tokyoTime = tokyoRuns[0].getTime();
  eq(utcTime !== tokyoTime, true);
});

summary();
