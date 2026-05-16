import { test, eq, summary } from '../helpers.js';
import { cronify } from '../../src/index.js';

console.log('exceptDays()');

test('except weekends from all days', () => {
  eq(cronify.at('9:00').exceptDays('weekends').toCron(), '0 9 * * 1,2,3,4,5');
});

test('except weekdays from all days', () => {
  eq(cronify.at('9:00').exceptDays('weekdays').toCron(), '0 9 * * 0,6');
});

test('except specific days by name', () => {
  eq(cronify.at('9:00').exceptDays('mon', 'fri').toCron(), '0 9 * * 0,2,3,4,6');
});

test('except from an existing day range', () => {
  eq(cronify.on('weekdays').at('9:00').exceptDays('wed').toCron(), '0 9 * * 1,2,4,5');
});

test('except by number', () => {
  eq(cronify.at('9:00').exceptDays(0, 6).toCron(), '0 9 * * 1,2,3,4,5');
});

test('no-op when excluding days not in set', () => {
  eq(cronify.on('weekdays').at('9:00').exceptDays('sunday').toCron(), '0 9 * * 1,2,3,4,5');
});

test('throws when excluding all days', () => {
  try { cronify.at('9:00').exceptDays('weekdays', 'weekends'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Cannot exclude all'), true); }
});

test('throws on unknown day', () => {
  try { cronify.at('9:00').exceptDays('notaday'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Unknown day'), true); }
});

console.log('\nexceptMonths()');

test('except december', () => {
  eq(cronify.at('9:00').exceptMonths('dec').toCron(), '0 9 * 1,2,3,4,5,6,7,8,9,10,11 *');
});

test('except summer months', () => {
  eq(cronify.at('9:00').exceptMonths('jun', 'jul', 'aug').toCron(), '0 9 * 1,2,3,4,5,9,10,11,12 *');
});

test('except by number', () => {
  eq(cronify.at('9:00').exceptMonths(1, 2).toCron(), '0 9 * 3,4,5,6,7,8,9,10,11,12 *');
});

test('except from existing month list', () => {
  eq(cronify.inMonth(1, 4, 7, 10).at('0:00').exceptMonths('jan').toCron(), '0 0 * 4,7,10 *');
});

test('throws when excluding all months', () => {
  try { cronify.inMonth(3).at('0:00').exceptMonths('mar'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Cannot exclude all'), true); }
});

test('throws on unknown month', () => {
  try { cronify.at('9:00').exceptMonths('notamonth'); eq(true, false); }
  catch (e: any) { eq(e.message.includes('Unknown month'), true); }
});

summary();
