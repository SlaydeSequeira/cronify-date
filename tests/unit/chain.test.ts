import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('chaining & toString()');

test('quarterly: jan,apr,jul,oct on 1st at 6:00', () => {
  eq(cronify.inMonth(1, 4, 7, 10).on(1).at('6:00').toCron(), '0 6 1 1,4,7,10 *');
});

test('weekdays in march at 7:45', () => {
  eq(cronify.on('weekdays').inMonth('mar').at('7:45').toCron(), '45 7 * 3 1-5');
});

test('every month on 15th and 30th at 12:00', () => {
  eq(cronify.on(15, 30).at('12:00').toCron(), '0 12 15,30 * *');
});

test('every 2 hours on weekends', () => {
  eq(cronify.every('2h').on('weekends').toCron(), '0 */2 * * 0,6');
});

test('toString equals toCron', () => {
  const chain = cronify.every('5m');
  eq(chain.toString(), chain.toCron());
});

test('template literal usage', () => {
  eq(`${cronify.every('5m')}`, '*/5 * * * *');
});

test('betweenTimes with zero-minute times', () => {
  eq(cronify.at('0:00').betweenTimes('9:00', '17:00').toCron(), '0 9-17 * * *');
});

test('betweenTimes throws on non-zero minutes', () => {
  try { cronify.at('0:00').betweenTimes('9:30', '17:30'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('hour-level ranges'), true); }
});

test('immutability - chaining does not mutate', () => {
  const base = cronify.every('day');
  const a = base.at('9:00');
  const b = base.at('17:00');
  eq(a.toCron(), '0 9 * * *');
  eq(b.toCron(), '0 17 * * *');
});

test('complex: stepped hours on weekdays in Q1', () => {
  eq(
    cronify.between(9, 17).hours(2).at('0:00').on('weekdays').inMonth(1, 2, 3).toCron(),
    '0 9-17/2 * 1,2,3 1-5'
  );
});

summary();
