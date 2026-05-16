import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('integration: edge cases and error boundaries');

test('chaining at() twice: hour preserved once set, minute overridden', () => {
  eq(cronify.every('day').at('9:00').at('17:30').toCron(), '30 9 * * *');
});

test('on() with day-of-month then inMonth', () => {
  eq(cronify.on(31).at('0:00').inMonth('jan', 'mar', 'may').toCron(), '0 0 31 1,3,5 *');
});

test('exceptDays from explicit list leaves correct remainder', () => {
  eq(cronify.on('mon', 'tue', 'wed', 'thu', 'fri').at('9:00').exceptDays('tue', 'thu').toCron(), '0 9 * * 1,3,5');
});

test('exceptMonths from quarterly leaves correct remainder', () => {
  eq(cronify.quarterly().exceptMonths('jan', 'oct').toCron(), '0 0 1 4,7 *');
});

test('times() with same-minute different-hours', () => {
  eq(cronify.times('9:30', '17:30').toCron(), '30 9,17 * * *');
});

test('times() cross-product throws', () => {
  try {
    cronify.times('9:30', '17:45');
    eq(true, false);
  } catch (e: any) {
    eq(e.message.includes('cross-product') || e.message.includes('different minutes'), true);
  }
});

test('betweenTimes with non-zero minutes throws', () => {
  try {
    cronify.every('day').betweenTimes('9:30', '17:00');
    eq(true, false);
  } catch (e: any) {
    eq(e.message.includes('hour-level'), true);
  }
});

test('invalid timezone throws', () => {
  try {
    cronify.at('9:00').tz('Not/A/Zone');
    eq(true, false);
  } catch (e: any) {
    eq(e.message.includes('Invalid timezone'), true);
  }
});

test('exceptDays all throws', () => {
  try {
    cronify.on('weekdays').at('9:00').exceptDays('mon', 'tue', 'wed', 'thu', 'fri');
    eq(true, false);
  } catch (e: any) {
    eq(e.message.includes('Cannot exclude all'), true);
  }
});

test('validate rejects out-of-range', () => {
  eq(cronify.isValid('60 * * * *'), false);
  try {
    cronify.validate('60 * * * *');
    eq(true, false);
  } catch (e: any) {
    eq(e.message.includes('out of range'), true);
  }
});

test('describe handles @ macros', () => {
  eq(cronify.describe('@daily'), cronify.describe('0 0 * * *'));
  eq(cronify.describe('@hourly'), cronify.describe('0 * * * *'));
  eq(cronify.describe('@yearly'), cronify.describe('0 0 1 1 *'));
});

test('toObject without tz omits timezone field', () => {
  const obj = cronify.at('9:00').toObject();
  eq(obj.expression, '0 9 * * *');
  eq('timezone' in obj, false);
});

test('toObject with tz includes timezone field', () => {
  const obj = cronify.at('9:00').tz('Asia/Tokyo').toObject();
  eq(obj.expression, '0 9 * * *');
  eq(obj.timezone, 'Asia/Tokyo');
});

test('toString and template literal produce cron string', () => {
  const chain = cronify.every('5m');
  eq(chain.toString(), '*/5 * * * *');
  eq(`${chain}`, '*/5 * * * *');
});

test('every(1, "minutes") same as every("1m")', () => {
  eq(cronify.every(1, 'minutes').toCron(), cronify.every('1m').toCron());
});

test('every(2, "hours") same as every("2h")', () => {
  eq(cronify.every(2, 'hours').toCron(), cronify.every('2h').toCron());
});

test('every(3, "months") same as every("3M")', () => {
  eq(cronify.every(3, 'months').toCron(), cronify.every('3M').toCron());
});

test('between daysOfMonth + at', () => {
  eq(cronify.between(1, 15).daysOfMonth().at('8:00').toCron(), '0 8 1-15 * *');
});

test('between months + on + at', () => {
  eq(cronify.between(1, 6).months().on(1).at('0:00').toCron(), '0 0 1 1-6 *');
});

test('between daysOfWeek', () => {
  eq(cronify.between(1, 5).daysOfWeek().at('9:00').toCron(), '0 9 * * 1-5');
});

summary();
