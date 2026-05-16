import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('inMonth()');

test('in january on 1st at midnight', () => {
  eq(cronify.inMonth('jan').on(1).at('0:00').toCron(), '0 0 1 1 *');
});

test('in jan and jun on 15th at 9:00', () => {
  eq(cronify.inMonth('jan', 'jun').on(15).at('9:00').toCron(), '0 9 15 1,6 *');
});

test('full month names', () => {
  eq(cronify.inMonth('march', 'september').on(1).at('0:00').toCron(), '0 0 1 3,9 *');
});

test('numeric months', () => {
  eq(cronify.inMonth(3, 6, 9, 12).on(1).at('0:00').toCron(), '0 0 1 3,6,9,12 *');
});

test('deduplicates and sorts months', () => {
  eq(cronify.inMonth('jun', 'jan', 'jun').on(1).at('0:00').toCron(), '0 0 1 1,6 *');
});

test('single numeric month', () => {
  eq(cronify.inMonth(12).on(25).at('0:00').toCron(), '0 0 25 12 *');
});

test('throws on unknown month name', () => {
  try { cronify.inMonth('notamonth'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Unknown month'), true); }
});

test('throws on month number out of range (0)', () => {
  try { cronify.inMonth(0); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Month must be 1-12'), true); }
});

test('throws on month number out of range (13)', () => {
  try { cronify.inMonth(13); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Month must be 1-12'), true); }
});

summary();
