import { WEEKDAYS, MONTHS, DAY_GROUPS } from './constants.js';

export class CronBuilder {
  private _minute = '*';
  private _hour = '*';
  private _dayOfMonth = '*';
  private _month = '*';
  private _dayOfWeek = '*';

  at(time: string): this {
    const parsed = parseTime(time);
    this._minute = parsed.minute;
    if (this._hour === '*' || this._hour === '0') {
      this._hour = parsed.hour;
    }
    return this;
  }

  on(...days: (string | number)[]): this {
    const nums: number[] = [];
    const weekDays: number[] = [];
    let usedGroup = false;

    for (const day of days) {
      if (typeof day === 'number') {
        if (day < 1 || day > 31) throw new Error(`Day of month must be 1-31, got ${day}`);
        nums.push(day);
      } else {
        const lower = day.toLowerCase();
        if (lower in DAY_GROUPS) {
          weekDays.push(...DAY_GROUPS[lower]);
          usedGroup = true;
        } else if (lower in WEEKDAYS) {
          weekDays.push(WEEKDAYS[lower]);
        } else {
          throw new Error(`Unknown day: "${day}". Use day names (mon-sun), numbers (1-31), "weekdays", or "weekends".`);
        }
      }
    }

    if (nums.length > 0 && weekDays.length > 0) {
      throw new Error('Cannot mix day-of-month numbers with weekday names in a single call.');
    }

    if (nums.length > 0) {
      this._dayOfMonth = unique(nums).join(',');
    }
    if (weekDays.length > 0) {
      if (usedGroup && weekDays.length > 2) {
        const sorted = unique(weekDays);
        const isContiguous = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
        this._dayOfWeek = isContiguous ? `${sorted[0]}-${sorted[sorted.length - 1]}` : sorted.join(',');
      } else {
        this._dayOfWeek = unique(weekDays).join(',');
      }
    }

    return this;
  }

  onDay(...days: number[]): this {
    return this.on(...days);
  }

  inMonth(...months: (string | number)[]): this {
    const nums: number[] = [];
    for (const m of months) {
      if (typeof m === 'number') {
        if (m < 1 || m > 12) throw new Error(`Month must be 1-12, got ${m}`);
        nums.push(m);
      } else {
        const lower = m.toLowerCase();
        if (lower in MONTHS) {
          nums.push(MONTHS[lower]);
        } else {
          throw new Error(`Unknown month: "${m}". Use month names (jan-dec) or numbers (1-12).`);
        }
      }
    }
    this._month = unique(nums).join(',');
    return this;
  }

  between(start: number, end: number): RangeBuilder {
    return new RangeBuilder(this, start, end);
  }

  betweenTimes(start: string, end: string): this {
    const s = parseTime(start);
    const e = parseTime(end);
    this._hour = `${s.hour}-${e.hour}`;
    if (s.minute !== '0') this._minute = s.minute;
    return this;
  }

  times(...timeList: string[]): this {
    if (timeList.length === 0) throw new Error('At least one time is required.');

    const minutes: number[] = [];
    const hours: number[] = [];
    let allSameMinute = true;

    for (const t of timeList) {
      const parsed = parseTime(t);
      minutes.push(Number(parsed.minute));
      hours.push(Number(parsed.hour));
    }

    const firstMin = minutes[0];
    for (const m of minutes) {
      if (m !== firstMin) { allSameMinute = false; break; }
    }

    if (allSameMinute) {
      this._minute = String(firstMin);
      this._hour = unique(hours).join(',');
    } else {
      const allSameHour = hours.every(h => h === hours[0]);
      if (allSameHour) {
        this._hour = String(hours[0]);
        this._minute = unique(minutes).join(',');
      } else {
        this._minute = unique(minutes).join(',');
        this._hour = unique(hours).join(',');
      }
    }

    return this;
  }

  setMinute(val: string): this { this._minute = val; return this; }
  setHour(val: string): this { this._hour = val; return this; }
  setDayOfMonth(val: string): this { this._dayOfMonth = val; return this; }
  setMonth(val: string): this { this._month = val; return this; }
  setDayOfWeek(val: string): this { this._dayOfWeek = val; return this; }

  toCron(): string {
    return `${this._minute} ${this._hour} ${this._dayOfMonth} ${this._month} ${this._dayOfWeek}`;
  }

  toString(): string {
    return this.toCron();
  }
}

export class RangeBuilder {
  constructor(
    private parent: CronBuilder,
    private start: number,
    private end: number,
  ) {}

  hours(): CronBuilder {
    if (this.start < 0 || this.end > 23) throw new Error('Hours must be 0-23.');
    this.parent.setHour(`${this.start}-${this.end}`);
    this.parent.setMinute('0');
    return this.parent;
  }

  minutes(): CronBuilder {
    if (this.start < 0 || this.end > 59) throw new Error('Minutes must be 0-59.');
    this.parent.setMinute(`${this.start}-${this.end}`);
    return this.parent;
  }

  daysOfMonth(): CronBuilder {
    if (this.start < 1 || this.end > 31) throw new Error('Day of month must be 1-31.');
    this.parent.setDayOfMonth(`${this.start}-${this.end}`);
    return this.parent;
  }

  months(): CronBuilder {
    if (this.start < 1 || this.end > 12) throw new Error('Month must be 1-12.');
    this.parent.setMonth(`${this.start}-${this.end}`);
    return this.parent;
  }

  daysOfWeek(): CronBuilder {
    if (this.start < 0 || this.end > 6) throw new Error('Day of week must be 0-6.');
    this.parent.setDayOfWeek(`${this.start}-${this.end}`);
    return this.parent;
  }
}

function parseTime(time: string): { hour: string; minute: string } {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) throw new Error(`Invalid time format: "${time}". Use HH:MM (e.g. "5:07", "14:30").`);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23) throw new Error(`Hour must be 0-23, got ${hour}.`);
  if (minute > 59) throw new Error(`Minute must be 0-59, got ${minute}.`);
  return { hour: String(hour), minute: String(minute) };
}

function unique(arr: number[]): number[] {
  return [...new Set(arr)].sort((a, b) => a - b);
}
