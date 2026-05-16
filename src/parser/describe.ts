import { WEEKDAY_NAMES, MONTH_NAMES, expandMacro } from '../utils/constants.js';

export const describe = (cron: string): string => {
  const expanded = expandMacro(cron);
  const parts = expanded.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error(`Invalid cron expression: expected 5 fields, got ${parts.length}.`);
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const segments: string[] = [];

  const hourIsComplex = hour.includes('/') || hour.includes('-');

  if (minute.startsWith('*/')) {
    segments.push(`every ${minute.slice(2)} minutes`);
  } else if (hour.startsWith('*/')) {
    segments.push(`every ${hour.slice(2)} hours`);
    if (minute !== '0' && minute !== '*') segments.push(`at minute ${minute}`);
  } else if (hourIsComplex) {
    if (minute !== '*') segments.push(`at minute ${minute}`);
    segments.push(`during hours ${hour}`);
  } else {
    const timeStr = formatTime(hour, minute);
    if (timeStr) segments.push(`at ${timeStr}`);
  }

  if (dayOfMonth !== '*') {
    segments.push(`on day ${dayOfMonth} of the month`);
  }

  if (month !== '*') {
    if (month.startsWith('*/')) {
      segments.push(`every ${month.slice(2)} months`);
    } else {
      segments.push(`in ${describeList(month, (v) => MONTH_NAMES[v] || String(v))}`);
    }
  }

  if (dayOfWeek !== '*') {
    if (dayOfWeek.startsWith('*/')) {
      segments.push(`every ${dayOfWeek.slice(2)} days of the week`);
    } else {
      segments.push(`on ${describeList(dayOfWeek, (v) => WEEKDAY_NAMES[v % 7] || String(v))}`);
    }
  }

  return segments.length === 0 ? 'every minute' : segments.join(', ');
};

const formatTime = (hour: string, minute: string): string | null => {
  if (hour === '*' && minute === '*') return null;
  if (hour === '*') return `minute ${minute}`;

  const hours = hour.split(',');
  const minutes = minute === '*' ? ['0'] : minute.split(',');

  if (hours.length === 1 && minutes.length === 1) {
    return `${hours[0].padStart(2, '0')}:${minutes[0].padStart(2, '0')}`;
  }

  const times = [];
  for (const h of hours) {
    for (const m of minutes) {
      times.push(`${h.padStart(2, '0')}:${m.padStart(2, '0')}`);
    }
  }
  return times.join(', ');
};

const describeList = (expr: string, nameFor: (v: number) => string): string => {
  if (expr.includes('/')) {
    const [range, step] = expr.split('/');
    if (range.includes('-')) {
      const [s, e] = range.split('-').map(Number);
      return `every ${step} from ${nameFor(s)} through ${nameFor(e)}`;
    }
  }
  if (expr.includes('-')) {
    const [s, e] = expr.split('-').map(Number);
    return `${nameFor(s)} through ${nameFor(e)}`;
  }
  return expr.split(',').map(v => nameFor(Number(v))).join(', ');
};
