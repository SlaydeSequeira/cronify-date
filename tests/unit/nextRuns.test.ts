import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('nextRuns()');

const from = new Date('2025-01-01T00:00:00');

test('returns correct count', () => {
  const runs = cronify.nextRuns('0 9 * * *', 3, from);
  eq(runs.length, 3);
});

test('returns Date objects', () => {
  const runs = cronify.nextRuns('0 12 * * *', 1, from);
  eq(runs[0] instanceof Date, true);
});

test('respects hour/minute pattern', () => {
  const runs = cronify.nextRuns('0 9 * * *', 5, from);
  for (const r of runs) {
    eq(r.getHours(), 9);
    eq(r.getMinutes(), 0);
  }
});

test('respects day-of-week pattern (monday=1)', () => {
  const runs = cronify.nextRuns('0 9 * * 1', 4, from);
  for (const r of runs) {
    eq(r.getDay(), 1);
  }
});

test('respects day-of-month pattern', () => {
  const runs = cronify.nextRuns('0 0 15 * *', 3, from);
  for (const r of runs) {
    eq(r.getDate(), 15);
  }
});

test('defaults to 5 results', () => {
  const runs = cronify.nextRuns('0 12 * * *');
  eq(runs.length, 5);
});

test('results are in chronological order', () => {
  const runs = cronify.nextRuns('*/30 * * * *', 5, from);
  for (let i = 1; i < runs.length; i++) {
    eq(runs[i].getTime() > runs[i - 1].getTime(), true);
  }
});

test('throws on invalid cron', () => {
  try { cronify.nextRuns('60 * * * *'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('minute'), true); }
});

summary();
