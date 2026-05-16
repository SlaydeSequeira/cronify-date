const { cronify } = require('../dist/index.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
  }
}

function eq(actual, expected) {
  if (actual !== expected) throw new Error(`Expected "${expected}", got "${actual}"`);
}

// ── every() ──────────────────────────────────────────────────

console.log('\nevery()');

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

test('every(5, "minutes")', () => {
  eq(cronify.every(5, 'minutes').toCron(), '*/5 * * * *');
});

test('every(2, "hours")', () => {
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

test('every day at 5:07', () => {
  eq(cronify.every('day').at('5:07').toCron(), '7 5 * * *');
});

test('every week', () => {
  eq(cronify.every('week').toCron(), '0 0 * * 0');
});

test('every month', () => {
  eq(cronify.every('month').toCron(), '0 0 1 * *');
});

test('every month on 31st at 5:07', () => {
  eq(cronify.every('month').on(31).at('5:07').toCron(), '7 5 31 * *');
});

test('every year', () => {
  eq(cronify.every('year').toCron(), '0 0 1 1 *');
});

// ── at() ─────────────────────────────────────────────────────

console.log('\nat()');

test('at 9:00', () => {
  eq(cronify.at('9:00').toCron(), '0 9 * * *');
});

test('at 14:30', () => {
  eq(cronify.at('14:30').toCron(), '30 14 * * *');
});

test('at 0:00', () => {
  eq(cronify.at('0:00').toCron(), '0 0 * * *');
});

test('at 23:59', () => {
  eq(cronify.at('23:59').toCron(), '59 23 * * *');
});

// ── on() ─────────────────────────────────────────────────────

console.log('\non()');

test('on monday at 9:00', () => {
  eq(cronify.on('monday').at('9:00').toCron(), '0 9 * * 1');
});

test('on mon, wed, fri at 8:30', () => {
  eq(cronify.on('mon', 'wed', 'fri').at('8:30').toCron(), '30 8 * * 1,3,5');
});

test('on weekdays at 9:00', () => {
  eq(cronify.on('weekdays').at('9:00').toCron(), '0 9 * * 1-5');
});

test('on weekends at 10:00', () => {
  eq(cronify.on('weekends').at('10:00').toCron(), '0 10 * * 0,6');
});

test('on day 1 at midnight', () => {
  eq(cronify.on(1).at('0:00').toCron(), '0 0 1 * *');
});

test('on days 1 and 15 at 12:00', () => {
  eq(cronify.on(1, 15).at('12:00').toCron(), '0 12 1,15 * *');
});

// ── inMonth() ────────────────────────────────────────────────

console.log('\ninMonth()');

test('in january on 1st at midnight', () => {
  eq(cronify.inMonth('jan').on(1).at('0:00').toCron(), '0 0 1 1 *');
});

test('in jan and jun on 15th at 9:00', () => {
  eq(cronify.inMonth('jan', 'jun').on(15).at('9:00').toCron(), '0 9 15 1,6 *');
});

test('inMonth with numbers', () => {
  eq(cronify.inMonth(3, 6, 9, 12).on(1).at('0:00').toCron(), '0 0 1 3,6,9,12 *');
});

// ── times() ──────────────────────────────────────────────────

console.log('\ntimes()');

test('times 9:00, 12:00, 18:00', () => {
  eq(cronify.times('9:00', '12:00', '18:00').toCron(), '0 9,12,18 * * *');
});

test('times 8:30, 17:30 (same minutes)', () => {
  eq(cronify.times('8:30', '17:30').toCron(), '30 8,17 * * *');
});

// ── between() ────────────────────────────────────────────────

console.log('\nbetween()');

test('between hours 9-17', () => {
  eq(cronify.between(9, 17).hours().toCron(), '0 9-17 * * *');
});

test('between hours 9-17 every 30 min', () => {
  eq(cronify.between(9, 17).hours().at('0:30').toCron(), '30 9-17 * * *');
});

test('between days 1-15', () => {
  eq(cronify.between(1, 15).daysOfMonth().at('8:00').toCron(), '0 8 1-15 * *');
});

test('between months 3-6', () => {
  eq(cronify.between(3, 6).months().toCron(), '* * * 3-6 *');
});

// ── chaining combos ─────────────────────────────────────────

console.log('\nchaining');

test('quarterly: jan,apr,jul,oct on 1st at 6:00', () => {
  eq(cronify.inMonth(1, 4, 7, 10).on(1).at('6:00').toCron(), '0 6 1 1,4,7,10 *');
});

test('weekdays in march at 7:45', () => {
  eq(cronify.on('weekdays').inMonth('mar').at('7:45').toCron(), '45 7 * 3 1-5');
});

test('every month on 15th and 30th at 12:00', () => {
  eq(cronify.on(15, 30).at('12:00').toCron(), '0 12 15,30 * *');
});

// ── describe() ───────────────────────────────────────────────

console.log('\ndescribe()');

test('describe */5 * * * *', () => {
  const desc = cronify.describe('*/5 * * * *');
  eq(desc, 'every 5 minutes');
});

test('describe 0 9 * * 1', () => {
  const desc = cronify.describe('0 9 * * 1');
  eq(desc, 'at 09:00, on Monday');
});

test('describe 30 8 * * 1-5', () => {
  const desc = cronify.describe('30 8 * * 1-5');
  eq(desc, 'at 08:30, on Monday through Friday');
});

test('describe 0 0 1 1 *', () => {
  const desc = cronify.describe('0 0 1 1 *');
  eq(desc, 'at 00:00, on day 1 of the month, in January');
});

// ── isValid() ────────────────────────────────────────────────

console.log('\nisValid()');

test('valid cron', () => {
  eq(cronify.isValid('*/5 * * * *'), true);
});

test('valid cron with ranges', () => {
  eq(cronify.isValid('0 9-17 * * 1-5'), true);
});

test('invalid cron - too few fields', () => {
  eq(cronify.isValid('* * *'), false);
});

test('invalid cron - out of range', () => {
  eq(cronify.isValid('60 * * * *'), false);
});

// ── nextRuns() ───────────────────────────────────────────────

console.log('\nnextRuns()');

test('nextRuns returns correct count', () => {
  const runs = cronify.nextRuns('0 9 * * *', 3);
  eq(runs.length, 3);
});

test('nextRuns returns Date objects', () => {
  const runs = cronify.nextRuns('0 12 * * *', 1);
  eq(runs[0] instanceof Date, true);
});

test('nextRuns respects cron pattern', () => {
  const from = new Date('2025-01-01T00:00:00');
  const runs = cronify.nextRuns('0 9 * * *', 3, from);
  for (const r of runs) {
    eq(r.getHours(), 9);
    eq(r.getMinutes(), 0);
  }
});

// ── error handling ───────────────────────────────────────────

console.log('\nerror handling');

test('invalid time format throws', () => {
  try { cronify.at('25:00'); eq(true, false); }
  catch (e) { eq(e.message.includes('Hour must be 0-23'), true); }
});

test('invalid day throws', () => {
  try { cronify.on('notaday'); eq(true, false); }
  catch (e) { eq(e.message.includes('Unknown day'), true); }
});

test('invalid month throws', () => {
  try { cronify.inMonth('notamonth'); eq(true, false); }
  catch (e) { eq(e.message.includes('Unknown month'), true); }
});

test('invalid interval throws', () => {
  try { cronify.every('banana'); eq(true, false); }
  catch (e) { eq(e.message.includes('Cannot parse'), true); }
});

// ── toString() ───────────────────────────────────────────────

console.log('\ntoString()');

test('toString equals toCron', () => {
  const builder = cronify.every('5m');
  eq(builder.toString(), builder.toCron());
});

test('template literal usage', () => {
  eq(`${cronify.every('5m')}`, '*/5 * * * *');
});

// ── summary ──────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
