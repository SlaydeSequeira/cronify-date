# cronify-date

Convert human-readable time expressions to cron syntax with a fluent, chainable API. No more memorizing `* * * * *` field order.

## Install

```bash
npm install cronify-date
```

## Quick Start

```js
const { cronify } = require('cronify-date');
// or
import { cronify } from 'cronify-date';

// Every 5 minutes
cronify.every('5m').toCron();                         // "*/5 * * * *"

// Daily at 5:07 AM
cronify.every('day').at('5:07').toCron();              // "7 5 * * *"

// Monthly on the 31st at 5:07 AM
cronify.every('month').on(31).at('5:07').toCron();    // "7 5 31 * *"

// Weekdays at 9 AM, New York timezone
cronify.weekdays().at('9:00').tz('America/New_York').toObject();
// { expression: "0 9 * * 1-5", timezone: "America/New_York" }

// Use presets for common patterns
cronify.businessHours().toCron();                     // "* 9-17 * * 1-5"
cronify.quarterly().at('6:00').toCron();              // "0 6 1 1,4,7,10 *"
```

## API

All methods return a chainable builder. Call `.toCron()` or `.toString()` at the end to get the cron string. You can also use template literals directly:

```js
console.log(`Schedule: ${cronify.every('5m')}`); // "Schedule: */5 * * * *"
```

---

### `cronify.every(interval)`

Set up recurring schedules.

```js
// Shorthand strings
cronify.every('5m')       // */5 * * * *    (every 5 minutes)
cronify.every('2h')       // 0 */2 * * *    (every 2 hours)
cronify.every('3d')       // 0 0 */3 * *    (every 3 days)
cronify.every('2w')       // 0 0 * * */2    (every 2nd day-of-week)
cronify.every('3M')       // 0 0 1 */3 *    (every 3 months / quarterly)

// Named intervals
cronify.every('minute')   // * * * * *
cronify.every('hour')     // 0 * * * *
cronify.every('day')      // 0 0 * * *
cronify.every('week')     // 0 0 * * 0
cronify.every('month')    // 0 0 1 * *
cronify.every('year')     // 0 0 1 1 *

// Numeric with unit
cronify.every(5, 'minutes') // */5 * * * *
cronify.every(2, 'hours')   // 0 */2 * * *
cronify.every(3, 'months')  // 0 0 1 */3 *
cronify.every(2, 'weeks')   // 0 0 * * */2
```

Chain with `.at()`, `.on()`, `.inMonth()` for more control:

```js
cronify.every('day').at('5:07')              // 7 5 * * *
cronify.every('month').on(31).at('5:07')     // 7 5 31 * *
cronify.every('year').inMonth('mar').on(15).at('9:00') // 0 9 15 3 *
```

---

### `cronify.at(time)`

Run at a specific time every day. Time format is `HH:MM` (24-hour).

```js
cronify.at('9:00')    // 0 9 * * *
cronify.at('14:30')   // 30 14 * * *
cronify.at('0:00')    // 0 0 * * *     (midnight)
cronify.at('23:59')   // 59 23 * * *
```

---

### `cronify.on(...days)`

Run on specific days. Accepts weekday names, `"weekdays"`, `"weekends"`, or day-of-month numbers.

```js
// Weekday names (full or abbreviated)
cronify.on('monday').at('9:00')             // 0 9 * * 1
cronify.on('mon', 'wed', 'fri').at('8:30')  // 30 8 * * 1,3,5

// Day groups
cronify.on('weekdays').at('9:00')   // 0 9 * * 1-5
cronify.on('weekends').at('10:00')  // 0 10 * * 0,6

// Day of month (numbers)
cronify.on(1).at('0:00')        // 0 0 1 * *     (1st of every month)
cronify.on(1, 15).at('12:00')   // 0 12 1,15 * * (1st and 15th)
```

---

### `cronify.inMonth(...months)`

Restrict to specific months. Accepts month names or numbers (1-12).

```js
cronify.inMonth('jan').on(1).at('0:00')            // 0 0 1 1 *
cronify.inMonth('jan', 'jun').on(15).at('9:00')    // 0 9 15 1,6 *
cronify.inMonth(3, 6, 9, 12).on(1).at('0:00')     // 0 0 1 3,6,9,12 *
```

---

### `cronify.times(...times)`

Run at multiple specific times each day.

```js
cronify.times('9:00', '12:00', '18:00')  // 0 9,12,18 * * *
cronify.times('8:30', '17:30')           // 30 8,17 * * *
```

Chain with `.on()` or `.inMonth()`:

```js
cronify.times('9:00', '17:00').on('weekdays')  // 0 9,17 * * 1-5
```

> **Note:** `times()` throws an error if both hours and minutes differ across the list (e.g. `times('9:30', '17:45')`), because 5-field cron would produce a cross-product (4 runs instead of 2). Use `union()` for those cases.

---

### `cronify.between(start, end)`

Create range-based schedules. Follow with `.hours(step?)`, `.minutes(step?)`, `.daysOfMonth(step?)`, `.months(step?)`, or `.daysOfWeek(step?)` to specify which field. Pass an optional **step** to create stepped ranges.

```js
// Business hours (every minute during 9-17)
cronify.between(9, 17).hours()                    // * 9-17 * * *

// Business hours, on the hour
cronify.between(9, 17).hours().at('0:00')         // 0 9-17 * * *

// Stepped range: every 2 hours between 9-17
cronify.between(9, 17).hours(2).at('0:00')        // 0 9-17/2 * * *

// Every 5 minutes in the first half hour
cronify.between(0, 30).minutes(5)                 // 0-30/5 * * * *

// Offset step: at minutes 5, 20, 35, 50
cronify.between(5, 59).minutes(15)                // 5-59/15 * * * *

// First half of month
cronify.between(1, 15).daysOfMonth().at('8:00')   // 0 8 1-15 * *

// Q1
cronify.between(1, 3).months()                    // * * * 1-3 *

// Stepped months (every 3 months from Jan-Dec)
cronify.between(1, 12).months(3)                  // * * * 1-12/3 *
```

---

### `.tz(timezone)`

Attach an IANA timezone to a chain. Does not change the cron string — affects `toObject()` and `nextRuns()`.

```js
// Timezone in structured output
cronify.at('9:00').tz('America/New_York').toObject();
// { expression: "0 9 * * *", timezone: "America/New_York" }

// Timezone-aware next runs
cronify.at('9:00').tz('Asia/Tokyo').nextRuns(3);
// Next 3 dates when it's 9:00 in Tokyo

// Chaining — timezone is preserved through all methods
cronify.weekdays().at('9:00').tz('Europe/London').exceptDays('fri').toObject();
// { expression: "0 9 * * 1,2,3,4", timezone: "Europe/London" }
```

Throws on invalid timezone names:

```js
cronify.at('9:00').tz('Not/A/Zone');
// throws: 'Invalid timezone: "Not/A/Zone"...'
```

---

### `.exceptDays(...days)` / `.exceptMonths(...months)`

Remove specific days or months from a schedule. Subtracts from the current field — if the field is `*`, starts with all values.

```js
// Exclude weekends from daily schedule
cronify.at('9:00').exceptDays('weekends')       // 0 9 * * 1,2,3,4,5

// Exclude specific days from a range
cronify.weekdays().at('9:00').exceptDays('wed') // 0 9 * * 1,2,4,5

// Exclude summer months
cronify.at('9:00').exceptMonths('jun', 'jul', 'aug')
// 0 9 * 1,2,3,4,5,9,10,11,12 *

// Exclude from an existing list
cronify.quarterly().exceptMonths('jul')         // 0 0 1 1,4,10 *
```

---

### `cronify.union(...chains)`

Combine multiple schedules into an array of cron strings. Use when a single expression can't cover your schedule.

```js
const crons = cronify.union(
  cronify.on('monday').at('9:00'),
  cronify.on('friday').at('17:00'),
);
// ["0 9 * * 1", "0 17 * * 5"]

// Solves the cross-product problem with times()
const crons = cronify.union(
  cronify.at('9:30'),
  cronify.at('17:45'),
);
// ["30 9 * * *", "45 17 * * *"]
```

### `cronify.nextRunsUnion(crons, count?, from?)`

Get the next N run dates across multiple cron expressions, merged and sorted.

```js
const runs = cronify.nextRunsUnion(
  ['0 9 * * *', '0 17 * * *'],
  4,
);
// Next 4 dates across both schedules, interleaved chronologically

// With timezone
const runs = cronify.nextRunsUnion(
  ['0 9 * * *', '0 17 * * *'],
  4,
  { from: new Date(), timezone: 'UTC' },
);
```

---

### Presets

Shortcut methods for common scheduling patterns. All return a chainable `CronChain`.

```js
// Time-of-day
cronify.midnight()        // 0 0 * * *
cronify.noon()            // 0 12 * * *

// Frequency
cronify.hourly()          // 0 * * * *
cronify.daily()           // 0 0 * * *
cronify.weekly()          // 0 0 * * 0
cronify.monthly()         // 0 0 1 * *
cronify.yearly()          // 0 0 1 1 *
cronify.quarterly()       // 0 0 1 1,4,7,10 *

// Day groups (chain with .at() to set time)
cronify.weekdays()        // * * * * 1-5
cronify.weekends()        // * * * * 0,6

// Common patterns
cronify.startOfMonth()    // 0 0 1 * *
cronify.endOfDay()        // 59 23 * * *
cronify.businessHours()   // * 9-17 * * 1-5
```

All presets are chainable:

```js
cronify.midnight().on('weekdays')                 // 0 0 * * 1-5
cronify.quarterly().at('6:00')                    // 0 6 1 1,4,7,10 *
cronify.businessHours().at('0:30')                // 30 9-17 * * 1-5
cronify.weekdays().at('9:00').tz('America/Chicago').toObject()
// { expression: "0 9 * * 1-5", timezone: "America/Chicago" }
cronify.weekdays().at('9:00').exceptDays('wed')   // 0 9 * * 1,2,4,5
```

---

### `cronify.describe(cron)`

Convert a cron expression to a human-readable string. Supports `@yearly`, `@monthly`, `@weekly`, `@daily`, `@hourly` macros.

```js
cronify.describe('*/5 * * * *')     // "every 5 minutes"
cronify.describe('0 9 * * 1')       // "at 09:00, on Monday"
cronify.describe('30 8 * * 1-5')    // "at 08:30, on Monday through Friday"
cronify.describe('0 0 1 1 *')       // "at 00:00, on day 1 of the month, in January"
cronify.describe('@daily')          // "at 00:00"
cronify.describe('@yearly')         // "at 00:00, on day 1 of the month, in January"
```

---

### `cronify.isValid(cron)` / `cronify.validate(cron)`

```js
cronify.isValid('*/5 * * * *')    // true
cronify.isValid('0 9-17/2 * * *') // true
cronify.isValid('@daily')         // true
cronify.isValid('60 * * * *')     // false

cronify.validate('60 * * * *');
// throws: "minute value 60 out of range (0-59)"
```

---

### `cronify.nextRuns(cron, count?, fromOrOptions?)`

Get the next N run dates for a cron expression. Supports `@` macros and timezone.

```js
cronify.nextRuns('0 9 * * *', 3);
// Next 3 occurrences of 9 AM (local time)

// From a specific start date
cronify.nextRuns('0 9 * * 1', 5, new Date('2025-06-01'));
// Next 5 Mondays at 9 AM after June 1, 2025

// With timezone
cronify.nextRuns('0 9 * * *', 3, { from: new Date(), timezone: 'Asia/Tokyo' });
// Next 3 occurrences of 9 AM Tokyo time
```

Or use `.nextRuns()` directly on a chain:

```js
cronify.weekdays().at('9:00').tz('UTC').nextRuns(5);
// Next 5 weekday 9 AM UTC dates
```

---

## Chaining Examples

```js
// Quarterly report: 1st of Jan, Apr, Jul, Oct at 6 AM
cronify.inMonth(1, 4, 7, 10).on(1).at('6:00')        // "0 6 1 1,4,7,10 *"

// Weekday mornings in March
cronify.on('weekdays').inMonth('mar').at('7:45')       // "45 7 * 3 1-5"

// Every 2 hours on weekends
cronify.every('2h').on('weekends')                     // "0 */2 * * 0,6"

// Business hours except Wednesday, in Tokyo
cronify.businessHours().exceptDays('wed').tz('Asia/Tokyo').toObject()
// { expression: "* 9-17 * * 1,2,4,5", timezone: "Asia/Tokyo" }

// Union: different times on different days
cronify.union(
  cronify.on('mon', 'wed').at('7:00'),
  cronify.on('fri').at('15:00'),
)
// ["0 7 * * 1,3", "0 15 * * 5"]
```

## Limitations

| Limitation | Why | Workaround |
|---|---|---|
| **Cross-product times** | `times('9:30', '17:45')` would produce 4 runs, not 2 | `times()` throws — use `union()` instead |
| **Last day of month** | Requires Quartz `L` extension, not available in POSIX cron | Use `on(28, 29, 30, 31)` for an approximation |
| **Minute-precision ranges** | `betweenTimes('9:30', '17:30')` can't be one expression | `betweenTimes()` throws — use hour-level ranges |
| **6-field cron (seconds)** | Different spec entirely | Out of scope — targets standard 5-field POSIX cron |
| **Quartz extensions** | `L`, `W`, `#`, `?` are non-POSIX | Out of scope |
| **`@reboot`** | System-level directive, no fixed schedule | `validate()` throws a descriptive error |

## Cron Field Reference

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sun=0)
│ │ │ │ │
* * * * *
```

| Symbol | Meaning           | Example           |
|--------|-------------------|-------------------|
| `*`    | Any value         | `* * * * *`       |
| `*/n`  | Every n           | `*/5 * * * *`     |
| `n`    | Specific value    | `0 9 * * *`       |
| `n,m`  | List              | `0 9,17 * * *`    |
| `n-m`  | Range             | `0 9-17 * * *`    |
| `n-m/s`| Stepped range     | `0 9-17/2 * * *`  |

## Supported `@` Macros

| Macro | Equivalent |
|---|---|
| `@yearly` / `@annually` | `0 0 1 1 *` |
| `@monthly` | `0 0 1 * *` |
| `@weekly` | `0 0 * * 0` |
| `@daily` / `@midnight` | `0 0 * * *` |
| `@hourly` | `0 * * * *` |

## License

MIT
