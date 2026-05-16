const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function describe(cron: string): string {
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
    const monthDesc = describeList(month, (v) => MONTH_NAMES[v] || String(v));
    segments.push(`in ${monthDesc}`);
  }

  if (dayOfWeek !== '*') {
    const dayDesc = describeList(dayOfWeek, (v) => WEEKDAY_NAMES[v % 7] || String(v));
    segments.push(`on ${dayDesc}`);
  }

  if (segments.length === 0) return 'every minute';
  return segments.join(', ');
}

export function isValid(cron: string): boolean {
  try {
    validate(cron);
    return true;
  } catch {
    return false;
  }
}

export function validate(cron: string): void {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error(`Expected 5 fields, got ${parts.length}.`);
  validateField(parts[0], 0, 59, 'minute');
  validateField(parts[1], 0, 23, 'hour');
  validateField(parts[2], 1, 31, 'day of month');
  validateField(parts[3], 1, 12, 'month');
  validateField(parts[4], 0, 7, 'day of week');
}

export function nextRuns(cron: string, count: number = 5, from: Date = new Date()): Date[] {
  validate(cron);
  const parts = cron.trim().split(/\s+/);
  const matcher = buildMatcher(parts);
  const results: Date[] = [];
  const current = new Date(from);
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  const maxIterations = 525600; // 1 year of minutes
  for (let i = 0; i < maxIterations && results.length < count; i++) {
    if (matcher(current)) {
      results.push(new Date(current));
    }
    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
}

function buildMatcher(parts: string[]): (d: Date) => boolean {
  const [minExpr, hourExpr, domExpr, monthExpr, dowExpr] = parts;
  const minSet = expandField(minExpr, 0, 59);
  const hourSet = expandField(hourExpr, 0, 23);
  const domSet = expandField(domExpr, 1, 31);
  const monthSet = expandField(monthExpr, 1, 12);
  const dowSet = expandField(dowExpr, 0, 7);

  return (d: Date) => {
    const min = d.getMinutes();
    const hr = d.getHours();
    const dom = d.getDate();
    const mon = d.getMonth() + 1;
    let dow = d.getDay();

    return minSet.has(min)
      && hourSet.has(hr)
      && domSet.has(dom)
      && monthSet.has(mon)
      && (dowSet.has(dow) || dowSet.has(dow + 7));
  };
}

function expandField(expr: string, min: number, max: number): Set<number> {
  const result = new Set<number>();
  if (expr === '*') {
    for (let i = min; i <= max; i++) result.add(i);
    return result;
  }
  for (const part of expr.split(',')) {
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = Number(stepStr);
      let start = min, end = max;
      if (range !== '*') {
        if (range.includes('-')) {
          [start, end] = range.split('-').map(Number);
        } else {
          start = Number(range);
        }
      }
      for (let i = start; i <= end; i += step) result.add(i);
    } else if (part.includes('-')) {
      const [s, e] = part.split('-').map(Number);
      for (let i = s; i <= e; i++) result.add(i);
    } else {
      result.add(Number(part));
    }
  }
  return result;
}

function validateField(value: string, min: number, max: number, name: string): void {
  if (value === '*') return;
  for (const part of value.split(',')) {
    if (part.includes('/')) {
      const [range, step] = part.split('/');
      if (range !== '*') validateRange(range, min, max, name);
      const s = Number(step);
      if (isNaN(s) || s < 1) throw new Error(`Invalid step "${step}" in ${name}.`);
    } else if (part.includes('-')) {
      validateRange(part, min, max, name);
    } else {
      const n = Number(part);
      if (isNaN(n) || n < min || n > max) throw new Error(`${name} value ${part} out of range (${min}-${max}).`);
    }
  }
}

function validateRange(range: string, min: number, max: number, name: string): void {
  const [s, e] = range.split('-').map(Number);
  if (isNaN(s) || isNaN(e)) throw new Error(`Invalid range "${range}" in ${name}.`);
  if (s < min || s > max || e < min || e > max) throw new Error(`${name} range ${range} out of bounds (${min}-${max}).`);
}

function formatTime(hour: string, minute: string): string | null {
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
}

function describeList(expr: string, nameFor: (v: number) => string): string {
  if (expr.includes('-')) {
    const [s, e] = expr.split('-').map(Number);
    return `${nameFor(s)} through ${nameFor(e)}`;
  }
  return expr.split(',').map(v => nameFor(Number(v))).join(', ');
}
