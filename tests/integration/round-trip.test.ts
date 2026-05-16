import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('integration: round-trip (build → toCron → validate → describe)');

const roundTrip = (chain: ReturnType<typeof cronify.at>, expectedCron: string, descSubstring: string) => {
  const cron = chain.toCron();
  eq(cron, expectedCron);
  eq(cronify.isValid(cron), true);
  cronify.validate(cron);
  const desc = cronify.describe(cron);
  eq(desc.includes(descSubstring), true);
};

test('every 5 minutes → validate → describe', () => {
  roundTrip(cronify.every('5m'), '*/5 * * * *', 'every 5 minutes');
});

test('daily at 9:00 → validate → describe', () => {
  roundTrip(cronify.every('day').at('9:00'), '0 9 * * *', '09:00');
});

test('weekdays at 8:30 → validate → describe', () => {
  roundTrip(cronify.weekdays().at('8:30'), '30 8 * * 1-5', '08:30');
});

test('monthly on 1st at midnight → validate → describe', () => {
  roundTrip(cronify.monthly().toCron() === '0 0 1 * *' ? cronify.monthly() : cronify.monthly(), '0 0 1 * *', 'day 1');
});

test('quarterly at 6:00 → validate → describe', () => {
  roundTrip(cronify.quarterly().at('6:00'), '0 6 1 1,4,7,10 *', '06:00');
});

test('yearly jan 1st → validate → describe', () => {
  roundTrip(cronify.yearly(), '0 0 1 1 *', 'January');
});

test('every 2 hours → validate → describe', () => {
  roundTrip(cronify.every('2h'), '0 */2 * * *', 'every 2 hours');
});

test('business hours → validate → describe', () => {
  const cron = cronify.businessHours().toCron();
  eq(cron, '* 9-17 * * 1-5');
  eq(cronify.isValid(cron), true);
  cronify.validate(cron);
});

test('between(9,17).hours stepped → validate', () => {
  const cron = cronify.between(9, 17).hours(2).at('0:00').toCron();
  eq(cron, '0 9-17/2 * * *');
  eq(cronify.isValid(cron), true);
  cronify.validate(cron);
});

test('except chain → validate', () => {
  const cron = cronify.weekdays().at('9:00').exceptDays('wed').toCron();
  eq(cron, '0 9 * * 1,2,4,5');
  eq(cronify.isValid(cron), true);
  cronify.validate(cron);
});

test('union results all valid', () => {
  const crons = cronify.union(
    cronify.on('mon').at('9:00'),
    cronify.on('fri').at('17:00'),
    cronify.weekends().at('10:00'),
  );
  for (const c of crons) {
    eq(cronify.isValid(c), true);
  }
});

console.log('\nintegration: build → nextRuns sanity');

test('every day at 9 AM produces ascending dates', () => {
  const runs = cronify.every('day').at('9:00').nextRuns(5);
  eq(runs.length, 5);
  for (let i = 1; i < runs.length; i++) {
    eq(runs[i].getTime() > runs[i - 1].getTime(), true);
  }
});

test('weekdays nextRuns skips weekends', () => {
  const from = new Date('2025-01-06T00:00:00'); // monday
  const runs = cronify.weekdays().at('9:00').nextRuns(5, from);
  eq(runs.length, 5);
  for (const r of runs) {
    const day = r.getDay();
    eq(day >= 1 && day <= 5, true);
  }
});

test('monthly on 15th nextRuns always lands on 15th', () => {
  const from = new Date('2025-01-01T00:00:00');
  const runs = cronify.every('month').on(15).at('12:00').nextRuns(6, from);
  eq(runs.length, 6);
  for (const r of runs) {
    eq(r.getDate(), 15);
  }
});

test('nextRunsUnion interleaves correctly', () => {
  const from = new Date('2025-01-01T00:00:00');
  const runs = cronify.nextRunsUnion(
    ['0 9 * * *', '0 17 * * *'],
    6,
    from,
  );
  eq(runs.length, 6);
  for (let i = 1; i < runs.length; i++) {
    eq(runs[i].getTime() > runs[i - 1].getTime(), true);
  }
});

test('chain nextRuns with timezone returns dates', () => {
  const runs = cronify.at('12:00').tz('UTC').nextRuns(3);
  eq(runs.length, 3);
  for (let i = 1; i < runs.length; i++) {
    eq(runs[i].getTime() > runs[i - 1].getTime(), true);
  }
});

summary();
