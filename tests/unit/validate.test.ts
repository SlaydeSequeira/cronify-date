import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('isValid()');

test('valid simple cron', () => {
  eq(cronify.isValid('*/5 * * * *'), true);
});

test('valid cron with ranges', () => {
  eq(cronify.isValid('0 9-17 * * 1-5'), true);
});

test('valid cron with lists', () => {
  eq(cronify.isValid('0 9,12,18 * * *'), true);
});

test('valid cron with step', () => {
  eq(cronify.isValid('*/15 */2 * * *'), true);
});

test('invalid - too few fields', () => {
  eq(cronify.isValid('* * *'), false);
});

test('invalid - too many fields', () => {
  eq(cronify.isValid('* * * * * *'), false);
});

test('invalid - minute out of range', () => {
  eq(cronify.isValid('60 * * * *'), false);
});

test('invalid - hour out of range', () => {
  eq(cronify.isValid('0 24 * * *'), false);
});

test('invalid - day of month out of range', () => {
  eq(cronify.isValid('0 0 32 * *'), false);
});

test('invalid - month out of range', () => {
  eq(cronify.isValid('0 0 * 13 *'), false);
});

test('invalid - day of week out of range', () => {
  eq(cronify.isValid('0 0 * * 8'), false);
});

console.log('\nvalidate()');

test('validate throws descriptive error for minute', () => {
  try { cronify.validate('60 * * * *'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('minute'), true); }
});

test('validate throws descriptive error for hour', () => {
  try { cronify.validate('0 25 * * *'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('hour'), true); }
});

test('validate throws on bad step', () => {
  try { cronify.validate('*/0 * * * *'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Invalid step'), true); }
});

test('validate throws on bad range', () => {
  try { cronify.validate('0 0 35-40 * *'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('out of bounds'), true); }
});

test('validate does not throw on valid cron', () => {
  cronify.validate('*/5 9-17 1,15 1-6 1-5');
});

summary();
