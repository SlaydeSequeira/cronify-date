import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('on()');

test('on monday at 9:00', () => {
  eq(cronify.on('monday').at('9:00').toCron(), '0 9 * * 1');
});

test('on abbreviated day names', () => {
  eq(cronify.on('mon', 'wed', 'fri').at('8:30').toCron(), '30 8 * * 1,3,5');
});

test('on full day names', () => {
  eq(cronify.on('tuesday', 'thursday').at('7:00').toCron(), '0 7 * * 2,4');
});

test('on weekdays group', () => {
  eq(cronify.on('weekdays').at('9:00').toCron(), '0 9 * * 1-5');
});

test('on weekends group', () => {
  eq(cronify.on('weekends').at('10:00').toCron(), '0 10 * * 0,6');
});

test('on day-of-month number', () => {
  eq(cronify.on(1).at('0:00').toCron(), '0 0 1 * *');
});

test('on multiple day-of-month numbers', () => {
  eq(cronify.on(1, 15).at('12:00').toCron(), '0 12 1,15 * *');
});

test('onDay alias works', () => {
  eq(cronify.on(5).at('6:00').toCron(), cronify.at('6:00').onDay(5).toCron());
});

test('deduplicates and sorts days', () => {
  eq(cronify.on('fri', 'mon', 'fri').at('9:00').toCron(), '0 9 * * 1,5');
});

test('throws on unknown day name', () => {
  try { cronify.on('notaday'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Unknown day'), true); }
});

test('throws on day-of-month out of range', () => {
  try { cronify.on(32); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Day of month must be 1-31'), true); }
});

test('throws on mixing numbers and names', () => {
  try { cronify.on(1, 'monday' as any); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Cannot mix'), true); }
});

summary();
