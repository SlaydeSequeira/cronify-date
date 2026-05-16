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

test('chained with on()', () => {
  eq(cronify.times('9:00', '17:00').on('weekdays').toCron(), '0 9,17 * * 1-5');
});

test('single time', () => {
  eq(cronify.times('12:00').toCron(), '0 12 * * *');
});

// ── cross-product error (#4) ────────────────────────────────

console.log('\ntimes() cross-product guard');

test('throws when hours AND minutes both differ', () => {
  try { cronify.times('9:30', '17:45'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('cross-product'), true); }
});

test('throws with helpful message listing the times', () => {
  try { cronify.times('8:15', '12:45', '18:30'); eq(true, false); }
  catch (e: any) {
    eq(e.message.includes('8:15, 12:45, 18:30'), true);
    eq(e.message.includes('separate cron expressions'), true);
  }
});

test('does NOT throw when all minutes are same', () => {
  eq(cronify.times('8:30', '12:30', '18:30').toCron(), '30 8,12,18 * * *');
});

test('does NOT throw when all hours are same', () => {
  eq(cronify.times('9:00', '9:15', '9:30', '9:45').toCron(), '0,15,30,45 9 * * *');
});

test('throws on empty args', () => {
  try { cronify.times(); eq(true, false); }
  catch (e: any) { eq(e.message.includes('At least one time'), true); }
});

summary();
