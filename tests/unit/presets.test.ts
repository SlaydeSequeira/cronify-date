import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('presets - time of day');

test('midnight', () => {
  eq(cronify.midnight().toCron(), '0 0 * * *');
});

test('noon', () => {
  eq(cronify.noon().toCron(), '0 12 * * *');
});

test('midnight chained with on()', () => {
  eq(cronify.midnight().on('weekdays').toCron(), '0 0 * * 1-5');
});

test('noon chained with inMonth()', () => {
  eq(cronify.noon().inMonth('jan').toCron(), '0 12 * 1 *');
});

console.log('\npresets - frequency');

test('hourly', () => {
  eq(cronify.hourly().toCron(), '0 * * * *');
});

test('daily', () => {
  eq(cronify.daily().toCron(), '0 0 * * *');
});

test('daily chained with at()', () => {
  eq(cronify.daily().at('6:30').toCron(), '30 6 * * *');
});

test('weekly', () => {
  eq(cronify.weekly().toCron(), '0 0 * * 0');
});

test('monthly', () => {
  eq(cronify.monthly().toCron(), '0 0 1 * *');
});

test('yearly', () => {
  eq(cronify.yearly().toCron(), '0 0 1 1 *');
});

test('quarterly', () => {
  eq(cronify.quarterly().toCron(), '0 0 1 1,4,7,10 *');
});

test('quarterly chained with at()', () => {
  eq(cronify.quarterly().at('6:00').toCron(), '0 6 1 1,4,7,10 *');
});

console.log('\npresets - day groups');

test('weekdays', () => {
  eq(cronify.weekdays().toCron(), '* * * * 1-5');
});

test('weekdays with at()', () => {
  eq(cronify.weekdays().at('9:00').toCron(), '0 9 * * 1-5');
});

test('weekends', () => {
  eq(cronify.weekends().toCron(), '* * * * 0,6');
});

test('weekends with at()', () => {
  eq(cronify.weekends().at('10:00').toCron(), '0 10 * * 0,6');
});

console.log('\npresets - common patterns');

test('startOfMonth', () => {
  eq(cronify.startOfMonth().toCron(), '0 0 1 * *');
});

test('endOfDay', () => {
  eq(cronify.endOfDay().toCron(), '59 23 * * *');
});

test('endOfDay on weekdays', () => {
  eq(cronify.endOfDay().on('weekdays').toCron(), '59 23 * * 1-5');
});

test('businessHours', () => {
  eq(cronify.businessHours().toCron(), '* 9-17 * * 1-5');
});

test('businessHours with every 30m', () => {
  eq(cronify.businessHours().at('0:30').toCron(), '30 9-17 * * 1-5');
});

console.log('\npresets - chaining combinations');

test('quarterly except july', () => {
  eq(cronify.quarterly().exceptMonths('jul').toCron(), '0 0 1 1,4,10 *');
});

test('weekdays except wednesday', () => {
  eq(cronify.weekdays().at('9:00').exceptDays('wed').toCron(), '0 9 * * 1,2,4,5');
});

test('daily with timezone', () => {
  const obj = cronify.daily().at('9:00').tz('America/New_York').toObject();
  eq(obj.expression, '0 9 * * *');
  eq(obj.timezone, 'America/New_York');
});

summary();
