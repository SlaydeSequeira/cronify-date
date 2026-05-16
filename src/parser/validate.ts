import { expandMacro, CRON_MACROS } from '../utils/constants.js';

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
  if (parts.length !== 5) throw new Error(`Expected 5 fields, got ${parts.length}.`);
  validateField(parts[0], 0, 59, 'minute');
  validateField(parts[1], 0, 23, 'hour');
  validateField(parts[2], 1, 31, 'day of month');
  validateField(parts[3], 1, 12, 'month');
  validateField(parts[4], 0, 7, 'day of week');
};

const validateField = (value: string, min: number, max: number, name: string): void => {
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
};

const validateRange = (range: string, min: number, max: number, name: string): void => {
  const [s, e] = range.split('-').map(Number);
  if (isNaN(s) || isNaN(e)) throw new Error(`Invalid range "${range}" in ${name}.`);
  if (s < min || s > max || e < min || e > max) throw new Error(`${name} range ${range} out of bounds (${min}-${max}).`);
};
