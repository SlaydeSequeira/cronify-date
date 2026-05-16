import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('at()');

test('at 9:00', () => {
  eq(cronify.at('9:00').toCron(), '0 9 * * *');
});

test('at 14:30', () => {
  eq(cronify.at('14:30').toCron(), '30 14 * * *');
});

test('at 0:00 (midnight)', () => {
  eq(cronify.at('0:00').toCron(), '0 0 * * *');
});

test('at 23:59', () => {
  eq(cronify.at('23:59').toCron(), '59 23 * * *');
});

test('at preserves existing hour range', () => {
  eq(cronify.between(9, 17).hours().at('0:30').toCron(), '30 9-17 * * *');
});

test('at chained with on()', () => {
  eq(cronify.at('8:00').on('monday').toCron(), '0 8 * * 1');
});

test('throws on invalid time format', () => {
  try { cronify.at('25:00'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Hour must be 0-23'), true); }
});

test('throws on bad minute', () => {
  try { cronify.at('12:61'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Minute must be 0-59'), true); }
});

test('throws on non-time string', () => {
  try { cronify.at('noon'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Invalid time format'), true); }
});

summary();
