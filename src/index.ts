import { CronBuilder } from './builder.js';
import { describe, isValid, validate, nextRuns } from './parser.js';

function every(value: string | number, unit?: string): CronBuilder {
  const builder = new CronBuilder();

  if (typeof value === 'number' && unit) {
    return applyInterval(builder, value, unit);
  }

  if (typeof value === 'string') {
    const match = value.match(/^(\d+)\s*(m|min|mins|minutes?|h|hr|hrs|hours?|d|days?)$/i);
    if (match) {
      return applyInterval(builder, Number(match[1]), match[2]);
    }

    const lower = value.toLowerCase();
    if (lower === 'minute') return builder;
    if (lower === 'hour') { builder.setMinute('0'); builder.setHour('*'); return builder; }
    if (lower === 'day' || lower === 'daily') { builder.setMinute('0'); builder.setHour('0'); return builder; }
    if (lower === 'week' || lower === 'weekly') { builder.setMinute('0'); builder.setHour('0'); builder.setDayOfWeek('0'); return builder; }
    if (lower === 'month' || lower === 'monthly') { builder.setMinute('0'); builder.setHour('0'); builder.setDayOfMonth('1'); return builder; }
    if (lower === 'year' || lower === 'yearly' || lower === 'annually') { builder.setMinute('0'); builder.setHour('0'); builder.setDayOfMonth('1'); builder.setMonth('1'); return builder; }

    throw new Error(`Cannot parse interval: "${value}". Use formats like "5m", "2h", "day", "month", etc.`);
  }

  throw new Error(`Invalid interval: ${value}`);
}

function applyInterval(builder: CronBuilder, amount: number, unit: string): CronBuilder {
  const u = unit.toLowerCase().replace(/s$/, '');
  switch (u) {
    case 'm': case 'min': case 'minute':
      if (amount < 1 || amount > 59) throw new Error('Minute interval must be 1-59.');
      builder.setMinute(`*/${amount}`);
      return builder;
    case 'h': case 'hr': case 'hour':
      if (amount < 1 || amount > 23) throw new Error('Hour interval must be 1-23.');
      builder.setMinute('0');
      builder.setHour(`*/${amount}`);
      return builder;
    case 'd': case 'day':
      if (amount < 1 || amount > 31) throw new Error('Day interval must be 1-31.');
      builder.setMinute('0');
      builder.setHour('0');
      builder.setDayOfMonth(`*/${amount}`);
      return builder;
    default:
      throw new Error(`Unknown unit: "${unit}". Use m/h/d (minutes/hours/days).`);
  }
}

function at(time: string): CronBuilder {
  return new CronBuilder().at(time);
}

function on(...days: (string | number)[]): CronBuilder {
  return new CronBuilder().on(...days);
}

function inMonth(...months: (string | number)[]): CronBuilder {
  return new CronBuilder().inMonth(...months);
}

function times(...timeList: string[]): CronBuilder {
  return new CronBuilder().times(...timeList);
}

function between(start: number, end: number) {
  return new CronBuilder().between(start, end);
}

const cronify = {
  every,
  at,
  on,
  inMonth,
  times,
  between,
  describe,
  isValid,
  validate,
  nextRuns,
};

export { cronify, CronBuilder };
export { describe, isValid, validate, nextRuns } from './parser.js';
export default cronify;
