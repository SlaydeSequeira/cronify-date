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
cronify.every('5m').toCron();          // "*/5 * * * *"

// Daily at 5:07 AM
cronify.every('day').at('5:07').toCron(); // "7 5 * * *"

// Monthly on the 31st at 5:07 AM
cronify.every('month').on(31).at('5:07').toCron(); // "7 5 31 * *"

// Weekdays at 9 AM
cronify.on('weekdays').at('9:00').toCron(); // "0 9 * * 1-5"

// Quarterly via step
cronify.every('3M').toCron();          // "0 0 1 */3 *"

// Every 2 hours between 9-17
cronify.between(9, 17).hours(2).at('0:00').toCron(); // "0 9-17/2 * * *"
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

> **Note:** `times()` throws an error if both hours and minutes differ across the list (e.g. `times('9:30', '17:45')`), because 5-field cron would produce a cross-product (4 runs instead of 2). Use separate cron expressions for those cases.

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

### `cronify.isValid(cron)`

Check if a cron expression is valid. Returns `true` or `false`. Supports `@` macros.

```js
cronify.isValid('*/5 * * * *')    // true
cronify.isValid('0 9-17/2 * * *') // true
cronify.isValid('@daily')         // true
cronify.isValid('@hourly')        // true
cronify.isValid('60 * * * *')     // false (minute max is 59)
cronify.isValid('* * *')          // false (needs 5 fields)
cronify.isValid('@reboot')        // false (system-level, no fixed schedule)
```

---

### `cronify.validate(cron)`

Like `isValid()` but throws a descriptive error instead of returning `false`.

```js
cronify.validate('60 * * * *');
// throws: "minute value 60 out of range (0-59)"

cronify.validate('@reboot');
// throws: "@reboot is a system-level directive with no fixed schedule..."
```

---

### `cronify.nextRuns(cron, count?, from?)`

Get the next N run dates for a cron expression. Supports `@` macros.

```js
const runs = cronify.nextRuns('0 9 * * *', 3);
// [Date(next 9AM), Date(following 9AM), Date(third 9AM)]

// From a specific start date
const from = new Date('2025-06-01T00:00:00');
const runs = cronify.nextRuns('0 9 * * 1', 5, from);
// Next 5 Mondays at 9 AM after June 1, 2025

// With @ macros
cronify.nextRuns('@daily', 3);
// Next 3 midnights
```

---

## Chaining Examples

Build complex schedules by chaining methods:

```js
// Quarterly report: 1st of Jan, Apr, Jul, Oct at 6 AM
cronify.inMonth(1, 4, 7, 10).on(1).at('6:00')
// "0 6 1 1,4,7,10 *"

// Weekday mornings in March
cronify.on('weekdays').inMonth('mar').at('7:45')
// "45 7 * 3 1-5"

// Bi-monthly payday
cronify.on(15, 30).at('12:00')
// "0 12 15,30 * *"

// Every 2 hours on weekends
cronify.every('2h').on('weekends')
// "0 */2 * * 0,6"

// Stepped hours on weekdays in Q1
cronify.between(9, 17).hours(2).at('0:00').on('weekdays').inMonth(1, 2, 3)
// "0 9-17/2 * 1,2,3 1-5"
```

## Limitations

These are fundamental constraints of 5-field POSIX cron that this library cannot work around:

| Limitation | Why | Workaround |
|---|---|---|
| **Cross-product times** | `times('9:30', '17:45')` would need independent hour+minute pairs, but cron cross-products them (4 runs, not 2) | `times()` throws an error — use separate cron expressions |
| **Minute-precision time ranges** | `betweenTimes('9:30', '17:30')` can't be expressed in one expression | `betweenTimes()` throws on non-zero minutes — use hour-level ranges |
| **6-field cron (seconds)** | Some schedulers (node-cron, Quartz) use a 6th seconds field | Out of scope — this library targets standard 5-field POSIX cron |
| **Quartz extensions** | `L` (last day), `W` (nearest weekday), `#` (nth weekday), `?` (unspecified) | Non-POSIX — out of scope |
| **`@reboot`** | System-level directive with no fixed schedule | `validate()` / `describe()` throw a descriptive error |

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
