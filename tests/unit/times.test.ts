import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('times()');

test('three times same minute', () => {
  eq(cronify.times('9:00', '12:00', '18:00').toCron(), '0 9,12,18 * * *');
});

test('two times same minute different value', () => {
  eq(cronify.times('8:30', '17:30').toCron(), '30 8,17 * * *');
});

test('two times same hour', () => {
  eq(cronify.times('9:00', '9:30').toCron(), '0,30 9 * * *');
});

test('different hours and minutes', () => {
  eq(cronify.times('8:15', '17:45').toCron(), '15,45 8,17 * * *');
});

test('chained with on()', () => {
  eq(cronify.times('9:00', '17:00').on('weekdays').toCron(), '0 9,17 * * 1-5');
});

test('single time', () => {
  eq(cronify.times('12:00').toCron(), '0 12 * * *');
});

test('throws on empty args', () => {
  try { cronify.times(); eq(true, false); }
  catch (e: any) { eq(e.message.includes('At least one time'), true); }
});

summary();
