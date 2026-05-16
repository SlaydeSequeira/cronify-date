import { expandMacro } from '../utils/constants.js';
import { Minute, Hour, DayOfMonth, Month, DayOfWeek, Cron } from '../constants/index.js';

export const isValid = (cron: string): boolean => {
  try {
    validate(cron);
    return true;
  } catch {
    return false;
  }
};

export const validate = (cron: string): void => {
  const expanded = expandMacro(cron);
  const parts = expanded.trim().split(/\s+/);
  if (parts.length !== Cron.FieldCount) throw new Error(`Expected ${Cron.FieldCount} fields, got ${parts.length}.`);
  validateField(parts[0], Minute.Min, Minute.Max, 'minute');
  validateField(parts[1], Hour.Min, Hour.Max, 'hour');
  validateField(parts[2], DayOfMonth.Min, DayOfMonth.Max, 'day of month');
  validateField(parts[3], Month.Min, Month.Max, 'month');
  validateField(parts[4], DayOfWeek.Min, DayOfWeek.MaxWithSundayAlt, 'day of week');
};

const validateField = (value: string, min: number, max: number, name: string): void => {
  if (value === Cron.Wildcard) return;

  for (const part of value.split(',')) {
    if (part.includes('/')) {
      const [range, step] = part.split('/');
      if (range !== Cron.Wildcard) validateRange(range, min, max, name);
      const s = Number(step);
      if (isNaN(s) || s < Cron.MinStep) throw new Error(`Invalid step "${step}" in ${name}.`);
    } else if (part.includes('-')) {
      validateRange(part, min, max, name);
    } else {
      const n = Number(part);
      if (isNaN(n) || n < min || n > max) throw new Error(`${name} value ${part} out of range (${min}-${max}).`);
    }
  }
};

const validateRange = (range: string, min: number, max: number, name: string): void => {
  const [s, e] = range.split('-').map(Number);
  if (isNaN(s) || isNaN(e)) throw new Error(`Invalid range "${range}" in ${name}.`);
  if (s < min || s > max || e < min || e > max) throw new Error(`${name} range ${range} out of bounds (${min}-${max}).`);
};
