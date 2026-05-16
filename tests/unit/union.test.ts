import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('union()');

test('union of two chains returns array', () => {
  const result = cronify.union(
    cronify.on('monday').at('9:00'),
    cronify.on('friday').at('17:00'),
  );
  eq(Array.isArray(result), true);
  eq(result.length, 2);
});

test('union produces correct cron strings', () => {
  const result = cronify.union(
    cronify.on('monday').at('9:00'),
    cronify.on('friday').at('17:00'),
  );
  eq(result[0], '0 9 * * 1');
  eq(result[1], '0 17 * * 5');
});

test('union with single chain', () => {
  const result = cronify.union(cronify.every('5m'));
  eq(result.length, 1);
  eq(result[0], '*/5 * * * *');
});

test('union with three chains', () => {
  const result = cronify.union(
    cronify.at('8:00'),
    cronify.at('12:00'),
    cronify.at('18:00'),
  );
  eq(result.length, 3);
  eq(result[0], '0 8 * * *');
  eq(result[1], '0 12 * * *');
  eq(result[2], '0 18 * * *');
});

console.log('\nnextRunsUnion()');

test('merges and sorts runs from multiple crons', () => {
  const from = new Date('2025-01-01T00:00:00');
  const runs = cronify.nextRunsUnion(
    ['0 9 * * *', '0 17 * * *'],
    4,
    from,
  );
  eq(runs.length, 4);
  for (let i = 1; i < runs.length; i++) {
    eq(runs[i].getTime() > runs[i - 1].getTime(), true);
  }
});

test('deduplicates identical timestamps', () => {
  const from = new Date('2025-01-01T00:00:00');
  const runs = cronify.nextRunsUnion(
    ['0 9 * * *', '0 9 * * *'],
    3,
    from,
  );
  eq(runs.length, 3);
});

test('nextRunsUnion with timezone', () => {
  const from = new Date('2025-06-01T00:00:00Z');
  const runs = cronify.nextRunsUnion(
    ['0 9 * * *', '0 17 * * *'],
    4,
    { from, timezone: 'UTC' },
  );
  eq(runs.length, 4);
});

summary();
