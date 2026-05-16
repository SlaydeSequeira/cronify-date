import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('integration: real-world scheduling scenarios');

test('daily standup: weekdays at 9:15 AM', () => {
  eq(cronify.weekdays().at('9:15').toCron(), '15 9 * * 1-5');
});

test('weekly report: every friday at 5 PM', () => {
  eq(cronify.on('friday').at('17:00').toCron(), '0 17 * * 5');
});

test('monthly invoice: 1st of every month at midnight', () => {
  eq(cronify.every('month').on(1).at('0:00').toCron(), '0 0 1 * *');
});

test('quarterly board meeting: 1st of Jan/Apr/Jul/Oct at 10 AM', () => {
  eq(cronify.quarterly().at('10:00').toCron(), '0 10 1 1,4,7,10 *');
});

test('biweekly payroll: 1st and 15th at 6 AM', () => {
  eq(cronify.on(1, 15).at('6:00').toCron(), '0 6 1,15 * *');
});

test('nightly backup: every day at 2:30 AM', () => {
  eq(cronify.every('day').at('2:30').toCron(), '30 2 * * *');
});

test('health check: every 5 minutes', () => {
  eq(cronify.every('5m').toCron(), '*/5 * * * *');
});

test('cache warm: every 2 hours on weekdays', () => {
  eq(cronify.every('2h').on('weekdays').toCron(), '0 */2 * * 1-5');
});

test('log rotation: weekly on sunday at 3 AM', () => {
  eq(cronify.on('sunday').at('3:00').toCron(), '0 3 * * 0');
});

test('DB maintenance window: weekends between 2-6 AM on the hour', () => {
  eq(cronify.between(2, 6).hours().at('0:00').on('weekends').toCron(), '0 2-6 * * 0,6');
});

test('business hours monitoring: every 15m, 9-17 on weekdays', () => {
  eq(cronify.between(0, 59).minutes(15).between(9, 17).hours().on('weekdays').toCron(), '0-59/15 9-17 * * 1-5');
});

test('annual tax reminder: march 15th at 9 AM', () => {
  eq(cronify.inMonth('mar').on(15).at('9:00').toCron(), '0 9 15 3 *');
});

test('multi-timezone deployment: at noon UTC', () => {
  const obj = cronify.at('12:00').tz('UTC').toObject();
  eq(obj.expression, '0 12 * * *');
  eq(obj.timezone, 'UTC');
});

test('holiday blackout: all year except summer', () => {
  eq(
    cronify.every('day').at('8:00').exceptMonths('jun', 'jul', 'aug').toCron(),
    '0 8 * 1,2,3,4,5,9,10,11,12 *',
  );
});

test('MWF morning emails', () => {
  eq(cronify.on('mon', 'wed', 'fri').at('7:00').toCron(), '0 7 * * 1,3,5');
});

test('end-of-day reports on weekdays except friday', () => {
  eq(cronify.endOfDay().on('weekdays').exceptDays('fri').toCron(), '59 23 * * 1,2,3,4');
});

test('new year notification: jan 1st at midnight', () => {
  eq(cronify.inMonth('jan').on(1).at('0:00').toCron(), '0 0 1 1 *');
});

test('sprint retro: every other friday at 3 PM (using union)', () => {
  const crons = cronify.union(
    cronify.on('friday').at('15:00'),
  );
  eq(crons[0], '0 15 * * 5');
});

test('shift handoff: morning at 6 AM and evening at 6 PM', () => {
  const crons = cronify.union(
    cronify.at('6:00'),
    cronify.at('18:00'),
  );
  eq(crons.length, 2);
  eq(crons[0], '0 6 * * *');
  eq(crons[1], '0 18 * * *');
});

test('multi-schedule alerts: 9AM weekdays + 10AM weekends', () => {
  const crons = cronify.union(
    cronify.weekdays().at('9:00'),
    cronify.weekends().at('10:00'),
  );
  eq(crons.length, 2);
  eq(crons[0], '0 9 * * 1-5');
  eq(crons[1], '0 10 * * 0,6');
});

summary();
