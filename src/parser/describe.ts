import { WEEKDAY_NAMES, MONTH_NAMES } from '../utils/constants.js';

export const describe = (cron: string): string => {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error(`Invalid cron expression: expected 5 fields, got ${parts.length}.`);
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const segments: string[] = [];

  if (minute.startsWith('*/')) {
    segments.push(`every ${minute.slice(2)} minutes`);
  } else if (hour.startsWith('*/')) {
    segments.push(`every ${hour.slice(2)} hours`);
    if (minute !== '0' && minute !== '*') segments.push(`at minute ${minute}`);
  } else {
    const timeStr = formatTime(hour, minute);
    if (timeStr) segments.push(`at ${timeStr}`);
  }

  if (dayOfMonth !== '*') {
    segments.push(`on day ${dayOfMonth} of the month`);
  }

  if (month !== '*') {
    segments.push(`in ${describeList(month, (v) => MONTH_NAMES[v] || String(v))}`);
  }

  if (dayOfWeek !== '*') {
    segments.push(`on ${describeList(dayOfWeek, (v) => WEEKDAY_NAMES[v % 7] || String(v))}`);
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
  if (expr.includes('-')) {
    const [s, e] = expr.split('-').map(Number);
    return `${nameFor(s)} through ${nameFor(e)}`;
  }
  return expr.split(',').map(v => nameFor(Number(v))).join(', ');
};
