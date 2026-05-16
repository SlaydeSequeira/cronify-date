import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('integration: multi-method chaining');

test('every(day) + at + on weekdays', () => {
  eq(cronify.every('day').at('8:30').on('weekdays').toCron(), '30 8 * * 1-5');
});

test('every(month) + on(15) + at + inMonth', () => {
  eq(cronify.every('month').on(15).at('9:00').inMonth('mar', 'sep').toCron(), '0 9 15 3,9 *');
});

test('every(year) + inMonth + on + at', () => {
  eq(cronify.every('year').inMonth('mar').on(15).at('9:00').toCron(), '0 9 15 3 *');
});

test('every(2h) + on weekends + inMonth(jun, jul)', () => {
  eq(cronify.every('2h').on('weekends').inMonth('jun', 'jul').toCron(), '0 */2 * 6,7 0,6');
});

test('on(mon, wed, fri) + at + exceptDays(wed)', () => {
  eq(cronify.on('mon', 'wed', 'fri').at('10:00').exceptDays('wed').toCron(), '0 10 * * 1,5');
});

test('inMonth(1..12) + exceptMonths(jun, jul, aug) + on(1) + at', () => {
  eq(
    cronify.inMonth(1,2,3,4,5,6,7,8,9,10,11,12).exceptMonths('jun','jul','aug').on(1).at('0:00').toCron(),
    '0 0 1 1,2,3,4,5,9,10,11,12 *',
  );
});

test('between hours + at + on weekdays', () => {
  eq(cronify.between(9, 17).hours().at('0:00').on('weekdays').toCron(), '0 9-17 * * 1-5');
});

test('between hours stepped + at + exceptDays', () => {
  eq(cronify.between(8, 20).hours(2).at('0:00').exceptDays('sun').toCron(), '0 8-20/2 * * 1,2,3,4,5,6');
});

test('between minutes stepped + on + inMonth', () => {
  eq(cronify.between(0, 30).minutes(10).on('weekdays').inMonth('jan').toCron(), '0-30/10 * * 1 1-5');
});

test('times + on + inMonth', () => {
  eq(cronify.times('9:00', '12:00', '18:00').on('weekdays').inMonth('mar').toCron(), '0 9,12,18 * 3 1-5');
});

test('preset quarterly + at + exceptMonths', () => {
  eq(cronify.quarterly().at('6:00').exceptMonths('oct').toCron(), '0 6 1 1,4,7 *');
});

test('preset businessHours + exceptDays + at', () => {
  eq(cronify.businessHours().exceptDays('mon', 'fri').at('0:30').toCron(), '30 9-17 * * 2,3,4');
});

test('preset weekdays + at + exceptDays + inMonth', () => {
  eq(cronify.weekdays().at('7:00').exceptDays('mon').inMonth('dec').toCron(), '0 7 * 12 2,3,4,5');
});

test('preset midnight + on specific days', () => {
  eq(cronify.midnight().on('mon', 'thu').toCron(), '0 0 * * 1,4');
});

test('preset endOfDay + on weekends + inMonth', () => {
  eq(cronify.endOfDay().on('weekends').inMonth('dec').toCron(), '59 23 * 12 0,6');
});

test('every(5m) chained with on and inMonth', () => {
  eq(cronify.every('5m').on('mon').inMonth('jan').toCron(), '*/5 * * 1 1');
});

test('deep chain: preset + at + tz + exceptDays + toObject', () => {
  const obj = cronify.weekdays().at('9:00').tz('America/New_York').exceptDays('fri').toObject();
  eq(obj.expression, '0 9 * * 1,2,3,4');
  eq(obj.timezone, 'America/New_York');
});

test('deep chain: every + on + at + tz + toObject', () => {
  const obj = cronify.every('month').on(1).at('6:00').tz('Europe/London').toObject();
  eq(obj.expression, '0 6 1 * *');
  eq(obj.timezone, 'Europe/London');
});

summary();
