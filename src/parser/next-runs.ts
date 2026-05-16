import { validate } from './validate.js';

export const nextRuns = (cron: string, count: number = 5, from: Date = new Date()): Date[] => {
  validate(cron);
  const parts = cron.trim().split(/\s+/);
  const matcher = buildMatcher(parts);
  const results: Date[] = [];
  const current = new Date(from);
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  const maxIterations = 525600;
  for (let i = 0; i < maxIterations && results.length < count; i++) {
    if (matcher(current)) {
      results.push(new Date(current));
    }
    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
};

const buildMatcher = (parts: string[]): (d: Date) => boolean => {
  const [minExpr, hourExpr, domExpr, monthExpr, dowExpr] = parts;
  const minSet = expandField(minExpr, 0, 59);
  const hourSet = expandField(hourExpr, 0, 23);
  const domSet = expandField(domExpr, 1, 31);
  const monthSet = expandField(monthExpr, 1, 12);
  const dowSet = expandField(dowExpr, 0, 7);

  return (d: Date) => {
    const dow = d.getDay();
    return minSet.has(d.getMinutes())
      && hourSet.has(d.getHours())
      && domSet.has(d.getDate())
      && monthSet.has(d.getMonth() + 1)
      && (dowSet.has(dow) || dowSet.has(dow + 7));
  };
};

const expandField = (expr: string, min: number, max: number): Set<number> => {
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
};
